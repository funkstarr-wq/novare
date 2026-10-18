import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ai_changesets" ADD COLUMN "reply" varchar;
  ALTER TABLE "ai_changesets" ADD COLUMN "error" varchar;
  ALTER TABLE "ai_changesets" ADD COLUMN "applied_at" timestamp(3) with time zone;
  ALTER TABLE "ai_changesets" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "ai_changesets" ADD COLUMN "rolled_back_at" timestamp(3) with time zone;
  ALTER TABLE "ai_changesets" ADD COLUMN "superseded_by_id" integer;
  ALTER TABLE "ai_changesets" ADD CONSTRAINT "ai_changesets_superseded_by_id_ai_changesets_id_fk" FOREIGN KEY ("superseded_by_id") REFERENCES "public"."ai_changesets"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "ai_changesets_superseded_by_idx" ON "ai_changesets" USING btree ("superseded_by_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ai_changesets" DROP CONSTRAINT "ai_changesets_superseded_by_id_ai_changesets_id_fk";
  
  DROP INDEX "ai_changesets_superseded_by_idx";
  ALTER TABLE "ai_changesets" DROP COLUMN "reply";
  ALTER TABLE "ai_changesets" DROP COLUMN "error";
  ALTER TABLE "ai_changesets" DROP COLUMN "applied_at";
  ALTER TABLE "ai_changesets" DROP COLUMN "published_at";
  ALTER TABLE "ai_changesets" DROP COLUMN "rolled_back_at";
  ALTER TABLE "ai_changesets" DROP COLUMN "superseded_by_id";`)
}
