CREATE TABLE "class_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"subject" varchar(20) NOT NULL,
	"grade_level" integer NOT NULL,
	"teacher_name" varchar(100) NOT NULL,
	"teacher_title" varchar(200),
	"day_of_week" integer NOT NULL,
	"start_time_utc" varchar(8) NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"join_url" text,
	"rrule" varchar(100) DEFAULT 'FREQ=WEEKLY',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;