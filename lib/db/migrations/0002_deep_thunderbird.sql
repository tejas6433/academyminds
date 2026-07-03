CREATE TABLE "recordings" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"play_url" text NOT NULL,
	"download_url" text,
	"passcode" varchar(50),
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"zoom_meeting_id" varchar(50),
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"published" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "teacher_id" integer;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "zoom_meeting_id" varchar(50);--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "zoom_start_url" text;--> statement-breakpoint
ALTER TABLE "recordings" ADD CONSTRAINT "recordings_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;