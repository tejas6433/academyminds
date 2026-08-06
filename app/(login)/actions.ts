'use server';

import { z } from 'zod';
import { and, eq, sql, isNull, gt } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  children,
  subscriptions,
  passwordResetTokens,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  ActivityType,
  invitations
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser,
  type ActionState
} from '@/lib/auth/middleware';
import { homePathForRole } from '@/lib/auth/guards';
import { sendWelcomeEmail, sendPasswordResetEmail } from '@/lib/email/resend';
import { rateLimit, clientIp } from '@/lib/rate-limit';

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

// Explicit return type: these actions end in redirect() (which never returns),
// and without the annotation TypeScript widens the result to include `void`,
// which no longer matches the narrowed ActionState the form state expects.
export const signIn = validatedAction(signInSchema, async (data, formData): Promise<ActionState> => {
  const { email, password } = data;

  // Brute-force guard. Keyed on the target email so an attacker can't grind one
  // account, and on IP so they can't spray many accounts from one host.
  const ip = clientIp(await headers());
  const perEmail = rateLimit(`signin:email:${email.toLowerCase()}`, 8, 900);
  const perIp = rateLimit(`signin:ip:${ip}`, 25, 900);
  if (!perEmail.ok || !perIp.ok) {
    return {
      error: 'Too many sign-in attempts. Please wait a few minutes and try again.',
      email,
      password
    };
  }

  const userWithTeam = await db
    .select({
      user: users,
      team: teams
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN)
  ]);

  const redirectTo = formData.get('redirect');
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId');
    if (typeof priceId === 'string' && priceId) {
      // Always redirects internally; awaiting keeps this action's return type
      // honest (ActionState) instead of leaking a void branch to the client.
      await createCheckoutSession({ team: foundTeam, priceId });
    }
  }

  redirect(homePathForRole(foundUser.role));
});

const signUpSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional(),
  accountType: z.enum(['parent', 'student']).optional(),
  childName: z.string().optional(),
  childGrade: z.coerce.number().int().min(5).max(7).optional(),
  subjectInterest: z.enum(['math', 'coding', 'both']).optional(),
  // Checkbox posts 'on' when ticked. Required — no account without consent.
  consent: z.literal('on', { errorMap: () => ({ message: 'Please confirm you agree and have guardian consent.' }) })
});

export const signUp = validatedAction(signUpSchema, async (data, formData): Promise<ActionState> => {
  const { email, password, inviteId, name, accountType, childName, childGrade, subjectInterest } = data;

  // Cap account creation per host — each signup also sends a welcome email.
  const signupLimit = rateLimit(`signup:${clientIp(await headers())}`, 5, 3600);
  if (!signupLimit.ok) {
    return {
      error: 'Too many accounts created from this device. Please try again later.',
      email,
      password
    };
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  const passwordHash = await hashPassword(password);

  // Platform role from the chosen account type (public signups are parents by default).
  const platformRole = inviteId ? 'member' : accountType ?? 'parent';

  const newUser: NewUser = {
    name: name || undefined,
    email,
    passwordHash,
    role: platformRole,
    parentalConsentAt: new Date() // schema guarantees the box was ticked
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teams.$inferSelect | null = null;

  if (inviteId) {
    // Check if there's a valid invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;

      await db
        .update(invitations)
        .set({ status: 'accepted' })
        .where(eq(invitations.id, invitation.id));

      await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);

      [createdTeam] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);
    } else {
      return { error: 'Invalid or expired invitation.', email, password };
    }
  } else {
    // Create a new team if there's no invitation
    const newTeam: NewTeam = {
      name: `${email}'s Team`
    };

    [createdTeam] = await db.insert(teams).values(newTeam).returning();

    if (!createdTeam) {
      return {
        error: 'Failed to create team. Please try again.',
        email,
        password
      };
    }

    teamId = createdTeam.id;
    userRole = 'owner';

    await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
  }

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole
  };

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser)
  ]);

  // Capture the child's details when a parent signs up.
  if (platformRole === 'parent' && childName && childGrade) {
    await db.insert(children).values({
      parentId: createdUser.id,
      name: childName,
      gradeLevel: childGrade,
      subjectInterest: subjectInterest ?? 'both'
    });
  }

  // If they already paid before creating an account, link that subscription now
  // (it was stored keyed by email with userId = null; connect it to this user).
  await db
    .update(subscriptions)
    .set({ userId: createdUser.id })
    .where(and(eq(subscriptions.email, email), isNull(subscriptions.userId)));

  // Fire-and-forget welcome email (never block signup on email delivery).
  void sendWelcomeEmail(email, name);

  const redirectTo = formData.get('redirect');
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId');
    if (typeof priceId === 'string' && priceId) {
      await createCheckoutSession({ team: createdTeam, priceId });
    }
  }

  redirect(homePathForRole(platformRole));
});

// ── Password reset ──────────────────────────────────────────────────────────

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

/**
 * Request a reset link. IMPORTANT: we always return the same success message
 * whether or not the email exists — revealing "no such user" lets attackers
 * enumerate which emails have accounts. Only send mail if the user is real.
 */
export const requestPasswordReset = validatedAction(forgotPasswordSchema, async (data) => {
  const { email } = data;

  // Without a cap this endpoint is an email bomb: repeated requests mail the
  // target repeatedly and burn the sending quota. Silently succeed when limited
  // so the response still can't be used to probe which emails exist.
  const resetLimit = rateLimit(`reset:${email.toLowerCase()}`, 3, 900);
  const resetIpLimit = rateLimit(`reset:ip:${clientIp(await headers())}`, 10, 900);
  if (!resetLimit.ok || !resetIpLimit.ok) {
    return { success: 'If an account exists for that email, a reset link is on its way.' };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex'); // sent in the email
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashToken(rawToken), // only the hash is stored
      expiresAt: new Date(Date.now() + RESET_TTL_MS)
    });
    const resetUrl = `${process.env.BASE_URL}/reset-password?token=${rawToken}`;
    void sendPasswordResetEmail(email, resetUrl);
  }

  return { success: 'If an account exists for that email, a reset link is on its way.' };
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(8).max(100),
    confirm: z.string().min(8).max(100)
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm']
  });

export const resetPassword = validatedAction(resetPasswordSchema, async (data) => {
  const { token, password } = data;
  const tokenHash = hashToken(token);

  // Valid = matches hash, not used, not expired.
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!row) {
    return { error: 'This reset link is invalid or has expired. Please request a new one.' };
  }

  const newHash = await hashPassword(password);
  await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, row.userId));
  // Single-use: burn the token so the same link can't be replayed.
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, row.id));

  redirect('/sign-in?reset=success');
});

export async function signOut() {
  const user = (await getUser()) as User;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Account deletion failed.'
      };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId)
          )
        );
    }

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return { name, success: 'Account updated successfully.' };
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.number()
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending'
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithTeam.team.name, role)

    return { success: 'Invitation sent successfully' };
  }
);
