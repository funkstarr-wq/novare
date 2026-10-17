import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_review_review_status" AS ENUM('draft', 'in_review', 'approved', 'changes_requested');
  CREATE TYPE "public"."enum__pages_v_version_review_review_status" AS ENUM('draft', 'in_review', 'approved', 'changes_requested');
  CREATE TYPE "public"."enum_solutions_review_review_status" AS ENUM('draft', 'in_review', 'approved', 'changes_requested');
  CREATE TYPE "public"."enum__solutions_v_version_review_review_status" AS ENUM('draft', 'in_review', 'approved', 'changes_requested');
  CREATE TYPE "public"."enum_funds_review_review_status" AS ENUM('draft', 'in_review', 'approved', 'changes_requested');
  CREATE TYPE "public"."enum__funds_v_version_review_review_status" AS ENUM('draft', 'in_review', 'approved', 'changes_requested');
  CREATE TYPE "public"."enum_legal_documents_review_review_status" AS ENUM('draft', 'in_review', 'approved', 'changes_requested');
  CREATE TYPE "public"."enum__legal_documents_v_version_review_review_status" AS ENUM('draft', 'in_review', 'approved', 'changes_requested');
  ALTER TABLE "pages" ADD COLUMN "review_review_status" "enum_pages_review_review_status" DEFAULT 'draft';
  ALTER TABLE "pages" ADD COLUMN "review_review_note" varchar;
  ALTER TABLE "pages" ADD COLUMN "review_reviewed_by_id" integer;
  ALTER TABLE "pages" ADD COLUMN "review_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_review_review_status" "enum__pages_v_version_review_review_status" DEFAULT 'draft';
  ALTER TABLE "_pages_v" ADD COLUMN "version_review_review_note" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_review_reviewed_by_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_review_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "solutions" ADD COLUMN "review_review_status" "enum_solutions_review_review_status" DEFAULT 'draft';
  ALTER TABLE "solutions" ADD COLUMN "review_review_note" varchar;
  ALTER TABLE "solutions" ADD COLUMN "review_reviewed_by_id" integer;
  ALTER TABLE "solutions" ADD COLUMN "review_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_review_review_status" "enum__solutions_v_version_review_review_status" DEFAULT 'draft';
  ALTER TABLE "_solutions_v" ADD COLUMN "version_review_review_note" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_review_reviewed_by_id" integer;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_review_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "funds" ADD COLUMN "review_review_status" "enum_funds_review_review_status" DEFAULT 'draft';
  ALTER TABLE "funds" ADD COLUMN "review_review_note" varchar;
  ALTER TABLE "funds" ADD COLUMN "review_reviewed_by_id" integer;
  ALTER TABLE "funds" ADD COLUMN "review_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_funds_v" ADD COLUMN "version_review_review_status" "enum__funds_v_version_review_review_status" DEFAULT 'draft';
  ALTER TABLE "_funds_v" ADD COLUMN "version_review_review_note" varchar;
  ALTER TABLE "_funds_v" ADD COLUMN "version_review_reviewed_by_id" integer;
  ALTER TABLE "_funds_v" ADD COLUMN "version_review_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "legal_documents" ADD COLUMN "review_review_status" "enum_legal_documents_review_review_status" DEFAULT 'draft';
  ALTER TABLE "legal_documents" ADD COLUMN "review_review_note" varchar;
  ALTER TABLE "legal_documents" ADD COLUMN "review_reviewed_by_id" integer;
  ALTER TABLE "legal_documents" ADD COLUMN "review_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_legal_documents_v" ADD COLUMN "version_review_review_status" "enum__legal_documents_v_version_review_review_status" DEFAULT 'draft';
  ALTER TABLE "_legal_documents_v" ADD COLUMN "version_review_review_note" varchar;
  ALTER TABLE "_legal_documents_v" ADD COLUMN "version_review_reviewed_by_id" integer;
  ALTER TABLE "_legal_documents_v" ADD COLUMN "version_review_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_review_reviewed_by_id_users_id_fk" FOREIGN KEY ("review_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_review_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_review_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions" ADD CONSTRAINT "solutions_review_reviewed_by_id_users_id_fk" FOREIGN KEY ("review_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v" ADD CONSTRAINT "_solutions_v_version_review_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_review_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "funds" ADD CONSTRAINT "funds_review_reviewed_by_id_users_id_fk" FOREIGN KEY ("review_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_funds_v" ADD CONSTRAINT "_funds_v_version_review_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_review_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_review_reviewed_by_id_users_id_fk" FOREIGN KEY ("review_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_documents_v" ADD CONSTRAINT "_legal_documents_v_version_review_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_review_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_review_review_reviewed_by_idx" ON "pages" USING btree ("review_reviewed_by_id");
  CREATE INDEX "_pages_v_version_review_version_review_reviewed_by_idx" ON "_pages_v" USING btree ("version_review_reviewed_by_id");
  CREATE INDEX "solutions_review_review_reviewed_by_idx" ON "solutions" USING btree ("review_reviewed_by_id");
  CREATE INDEX "_solutions_v_version_review_version_review_reviewed_by_idx" ON "_solutions_v" USING btree ("version_review_reviewed_by_id");
  CREATE INDEX "funds_review_review_reviewed_by_idx" ON "funds" USING btree ("review_reviewed_by_id");
  CREATE INDEX "_funds_v_version_review_version_review_reviewed_by_idx" ON "_funds_v" USING btree ("version_review_reviewed_by_id");
  CREATE INDEX "legal_documents_review_review_reviewed_by_idx" ON "legal_documents" USING btree ("review_reviewed_by_id");
  CREATE INDEX "_legal_documents_v_version_review_version_review_reviewe_idx" ON "_legal_documents_v" USING btree ("version_review_reviewed_by_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP CONSTRAINT "pages_review_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_review_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "solutions" DROP CONSTRAINT "solutions_review_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "_solutions_v" DROP CONSTRAINT "_solutions_v_version_review_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "funds" DROP CONSTRAINT "funds_review_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "_funds_v" DROP CONSTRAINT "_funds_v_version_review_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "legal_documents" DROP CONSTRAINT "legal_documents_review_reviewed_by_id_users_id_fk";
  
  ALTER TABLE "_legal_documents_v" DROP CONSTRAINT "_legal_documents_v_version_review_reviewed_by_id_users_id_fk";
  
  DROP INDEX "pages_review_review_reviewed_by_idx";
  DROP INDEX "_pages_v_version_review_version_review_reviewed_by_idx";
  DROP INDEX "solutions_review_review_reviewed_by_idx";
  DROP INDEX "_solutions_v_version_review_version_review_reviewed_by_idx";
  DROP INDEX "funds_review_review_reviewed_by_idx";
  DROP INDEX "_funds_v_version_review_version_review_reviewed_by_idx";
  DROP INDEX "legal_documents_review_review_reviewed_by_idx";
  DROP INDEX "_legal_documents_v_version_review_version_review_reviewe_idx";
  ALTER TABLE "pages" DROP COLUMN "review_review_status";
  ALTER TABLE "pages" DROP COLUMN "review_review_note";
  ALTER TABLE "pages" DROP COLUMN "review_reviewed_by_id";
  ALTER TABLE "pages" DROP COLUMN "review_reviewed_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_review_review_status";
  ALTER TABLE "_pages_v" DROP COLUMN "version_review_review_note";
  ALTER TABLE "_pages_v" DROP COLUMN "version_review_reviewed_by_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_review_reviewed_at";
  ALTER TABLE "solutions" DROP COLUMN "review_review_status";
  ALTER TABLE "solutions" DROP COLUMN "review_review_note";
  ALTER TABLE "solutions" DROP COLUMN "review_reviewed_by_id";
  ALTER TABLE "solutions" DROP COLUMN "review_reviewed_at";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_review_review_status";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_review_review_note";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_review_reviewed_by_id";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_review_reviewed_at";
  ALTER TABLE "funds" DROP COLUMN "review_review_status";
  ALTER TABLE "funds" DROP COLUMN "review_review_note";
  ALTER TABLE "funds" DROP COLUMN "review_reviewed_by_id";
  ALTER TABLE "funds" DROP COLUMN "review_reviewed_at";
  ALTER TABLE "_funds_v" DROP COLUMN "version_review_review_status";
  ALTER TABLE "_funds_v" DROP COLUMN "version_review_review_note";
  ALTER TABLE "_funds_v" DROP COLUMN "version_review_reviewed_by_id";
  ALTER TABLE "_funds_v" DROP COLUMN "version_review_reviewed_at";
  ALTER TABLE "legal_documents" DROP COLUMN "review_review_status";
  ALTER TABLE "legal_documents" DROP COLUMN "review_review_note";
  ALTER TABLE "legal_documents" DROP COLUMN "review_reviewed_by_id";
  ALTER TABLE "legal_documents" DROP COLUMN "review_reviewed_at";
  ALTER TABLE "_legal_documents_v" DROP COLUMN "version_review_review_status";
  ALTER TABLE "_legal_documents_v" DROP COLUMN "version_review_review_note";
  ALTER TABLE "_legal_documents_v" DROP COLUMN "version_review_reviewed_by_id";
  ALTER TABLE "_legal_documents_v" DROP COLUMN "version_review_reviewed_at";
  DROP TYPE "public"."enum_pages_review_review_status";
  DROP TYPE "public"."enum__pages_v_version_review_review_status";
  DROP TYPE "public"."enum_solutions_review_review_status";
  DROP TYPE "public"."enum__solutions_v_version_review_review_status";
  DROP TYPE "public"."enum_funds_review_review_status";
  DROP TYPE "public"."enum__funds_v_version_review_review_status";
  DROP TYPE "public"."enum_legal_documents_review_review_status";
  DROP TYPE "public"."enum__legal_documents_v_version_review_review_status";`)
}
