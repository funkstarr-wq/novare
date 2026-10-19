import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'delete-old-submissions');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'delete-old-submissions');
  CREATE TABLE "forms_routing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic" varchar NOT NULL,
  	"email_to" varchar NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"meta" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "form_submissions" ADD COLUMN "consent_given" boolean;
  ALTER TABLE "form_submissions" ADD COLUMN "consent_text" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "consent_at" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN "cookie_banner_enabled" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "cookie_banner_message" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "cookie_banner_policy_id" integer;
  ALTER TABLE "forms_routing" ADD CONSTRAINT "forms_routing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "forms_routing_order_idx" ON "forms_routing" USING btree ("_order");
  CREATE INDEX "forms_routing_parent_id_idx" ON "forms_routing" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_cookie_banner_policy_id_legal_documents_id_fk" FOREIGN KEY ("cookie_banner_policy_id") REFERENCES "public"."legal_documents"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_cookie_banner_cookie_banner_policy_idx" ON "site_settings" USING btree ("cookie_banner_policy_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "forms_routing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "forms_routing" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_cookie_banner_policy_id_legal_documents_id_fk";
  
  DROP INDEX "site_settings_cookie_banner_cookie_banner_policy_idx";
  ALTER TABLE "form_submissions" DROP COLUMN "consent_given";
  ALTER TABLE "form_submissions" DROP COLUMN "consent_text";
  ALTER TABLE "form_submissions" DROP COLUMN "consent_at";
  ALTER TABLE "site_settings" DROP COLUMN "cookie_banner_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "cookie_banner_message";
  ALTER TABLE "site_settings" DROP COLUMN "cookie_banner_policy_id";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
