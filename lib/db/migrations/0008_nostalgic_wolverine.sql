ALTER TABLE "recordings" ALTER COLUMN "play_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recordings" ADD COLUMN "status" varchar(20) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "recordings" ADD COLUMN "r2_key" text;--> statement-breakpoint
ALTER TABLE "recordings" ADD COLUMN "size_bytes" bigint;--> statement-breakpoint
ALTER TABLE "recordings" ADD COLUMN "zoom_download_url" text;--> statement-breakpoint
ALTER TABLE "recordings" ADD COLUMN "zoom_download_token" text;--> statement-breakpoint
ALTER TABLE "recordings" ADD COLUMN "transfer_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "recordings" ADD COLUMN "expires_at" timestamp;