CREATE TABLE "enquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"grade_level" integer,
	"interest" varchar(20),
	"message" text,
	"handled" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
