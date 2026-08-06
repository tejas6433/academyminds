import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  bigint,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  // When the account holder gave parental/guardian consent at sign-up (PIPEDA).
  parentalConsentAt: timestamp('parental_consent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  subject: varchar('subject', { length: 20 }).notNull(), // 'math' | 'coding'
  gradeLevel: integer('grade_level').notNull(), // 5, 6, or 7
  teacherId: integer('teacher_id').references(() => users.id), // assigned teacher (platform user)
  teacherName: varchar('teacher_name', { length: 100 }).notNull(),
  teacherTitle: varchar('teacher_title', { length: 200 }),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Sun, 1=Mon...6=Sat
  startTimeUtc: varchar('start_time_utc', { length: 8 }).notNull(), // 'HH:MM:SS'
  durationMinutes: integer('duration_minutes').notNull().default(60),
  joinUrl: text('join_url'),
  zoomMeetingId: varchar('zoom_meeting_id', { length: 50 }), // Zoom numeric meeting id
  zoomStartUrl: text('zoom_start_url'), // host start link (teacher only)
  rrule: varchar('rrule', { length: 100 }).default('FREQ=WEEKLY'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const classEnrollments = pgTable('class_enrollments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  classId: integer('class_id').notNull().references(() => classes.id),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
});

export const children = pgTable('children', {
  id: serial('id').primaryKey(),
  parentId: integer('parent_id').notNull().references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  gradeLevel: integer('grade_level').notNull(), // 5, 6, or 7
  subjectInterest: varchar('subject_interest', { length: 20 }).notNull().default('both'), // 'math' | 'coding' | 'both'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// A class recording. Lifecycle:
//   pending  → row created by Zoom webhook; MP4 still on Zoom cloud
//   ready    → MP4 copied to our own R2 bucket (r2Key set); served via signed URL
//   failed   → transfer failed after retries; retry cron will keep trying until token expiry
// Retention: `expiresAt` = recordedAt + 30 days. The retention cron deletes the
// R2 object and this row once expired, so storage never grows without bound.
export const recordings = pgTable('recordings', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').notNull().references(() => classes.id),
  title: varchar('title', { length: 200 }).notNull(),
  // Legacy Zoom share/play URL. Nullable now — new recordings are served from R2
  // behind an auth gate, so we no longer rely on a public Zoom link.
  playUrl: text('play_url'),
  downloadUrl: text('download_url'),
  passcode: varchar('passcode', { length: 50 }),
  durationMinutes: integer('duration_minutes').notNull().default(0),
  zoomMeetingId: varchar('zoom_meeting_id', { length: 50 }),
  recordedAt: timestamp('recorded_at').notNull().defaultNow(),
  published: integer('published').notNull().default(1), // 1=visible to students, 0=hidden

  // ── Transfer + storage state (Zoom cloud → our R2 bucket) ──
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending | ready | failed
  r2Key: text('r2_key'),                       // object key in the R2 bucket once uploaded
  sizeBytes: bigint('size_bytes', { mode: 'number' }), // uploaded file size (bytes)
  // Zoom-issued download credentials, kept only until the transfer succeeds.
  zoomDownloadUrl: text('zoom_download_url'),
  zoomDownloadToken: text('zoom_download_token'),
  transferAttempts: integer('transfer_attempts').notNull().default(0),
  // Set when a worker claims the row for transfer. Lets the retry cron detect a
  // crashed/timed-out transfer (still 'transferring' long after this time) and
  // reclaim it — without stealing a transfer that's legitimately still running.
  transferStartedAt: timestamp('transfer_started_at'),
  // When students lose access and the file is purged. NULL = never expires (legacy rows).
  expiresAt: timestamp('expires_at'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  // Student/teacher listing: "published recordings for these classes".
  classPublishedIdx: index('recordings_class_published_idx').on(t.classId, t.published),
  // Retention cron scans by expiry.
  expiresAtIdx: index('recordings_expires_at_idx').on(t.expiresAt),
  // Transfer worker sweeps by status.
  statusIdx: index('recordings_status_idx').on(t.status),
}));

// Billing state, synced FROM Stripe by the webhook. Stripe is the source of
// truth; this table is a queryable local copy so the app can answer
// "is this person an active subscriber?" without calling Stripe on every request.
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  // Nullable: a parent can pay before creating an account (identified by email),
  // then get linked to their user row at sign-up.
  userId: integer('user_id').references(() => users.id),
  email: varchar('email', { length: 255 }).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull(),
  // Unique → lets us upsert idempotently on repeated webhook deliveries.
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 30 }).notNull(), // active | trialing | past_due | canceled | ...
  planName: varchar('plan_name', { length: 100 }),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Trial-class / general enquiries submitted from the public /enquiry form.
export const enquiries = pgTable('enquiries', {
  id: serial('id').primaryKey(),
  parentName: varchar('parent_name', { length: 120 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  gradeLevel: integer('grade_level'), // 5, 6, 7 (nullable — parent may skip)
  interest: varchar('interest', { length: 20 }), // 'math' | 'coding' | 'both'
  message: text('message'),
  handled: integer('handled').notNull().default(0), // 1 once an admin has followed up
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

// Append-only record of sensitive actions: who did what, to what, when.
// Never updated or deleted — it's the audit trail admins and compliance rely on.
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id').references(() => users.id), // who did it (null = system/webhook)
  action: varchar('action', { length: 60 }).notNull(), // e.g. 'role.change', 'class.create'
  targetType: varchar('target_type', { length: 40 }), // 'user' | 'class' | 'subscription' | ...
  targetId: varchar('target_id', { length: 64 }),
  metadata: jsonb('metadata'), // before/after values, extra context
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// We store only a SHA-256 hash of the reset token, never the token itself.
// Single-use (usedAt) + short expiry (expiresAt) limit the blast radius if a
// row ever leaks — the hash can't be turned back into a working link.
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(), // sha256 hex
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  classEnrollments: many(classEnrollments),
  classesTaught: many(classes),
  children: many(children),
}));

export const childrenRelations = relations(children, ({ one }) => ({
  parent: one(users, { fields: [children.parentId], references: [users.id] }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const classesRelations = relations(classes, ({ many, one }) => ({
  enrollments: many(classEnrollments),
  recordings: many(recordings),
  teacher: one(users, { fields: [classes.teacherId], references: [users.id] }),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({ one }) => ({
  user: one(users, { fields: [classEnrollments.userId], references: [users.id] }),
  class: one(classes, { fields: [classEnrollments.classId], references: [classes.id] }),
}));

export const recordingsRelations = relations(recordings, ({ one }) => ({
  class: one(classes, { fields: [recordings.classId], references: [classes.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type NewClassEnrollment = typeof classEnrollments.$inferInsert;
export type Recording = typeof recordings.$inferSelect;
export type NewRecording = typeof recordings.$inferInsert;
export type Child = typeof children.$inferSelect;
export type NewChild = typeof children.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export enum UserRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
