import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "offices" ADD COLUMN "source_url" varchar;
  ALTER TABLE "_offices_v" ADD COLUMN "version_source_url" varchar;
  ALTER TABLE "awards" ADD COLUMN "source_url" varchar;
  ALTER TABLE "_awards_v" ADD COLUMN "version_source_url" varchar;
  ALTER TABLE "jobs" ADD COLUMN "source_url" varchar;
  ALTER TABLE "_jobs_v" ADD COLUMN "version_source_url" varchar;
  ALTER TABLE "insights" ADD COLUMN "source_url" varchar;
  ALTER TABLE "_insights_v" ADD COLUMN "version_source_url" varchar;
  ALTER TABLE "press_mentions" ADD COLUMN "source_url" varchar;
  ALTER TABLE "_press_mentions_v" ADD COLUMN "version_source_url" varchar;
  ALTER TABLE "legal_documents" ADD COLUMN "source_url" varchar;
  ALTER TABLE "_legal_documents_v" ADD COLUMN "version_source_url" varchar;
  ALTER TABLE "media" ADD COLUMN "source_url" varchar;
  ALTER TABLE "documents" ADD COLUMN "source_url" varchar;
  CREATE INDEX "offices_source_url_idx" ON "offices" USING btree ("source_url");
  CREATE INDEX "_offices_v_version_version_source_url_idx" ON "_offices_v" USING btree ("version_source_url");
  CREATE INDEX "awards_source_url_idx" ON "awards" USING btree ("source_url");
  CREATE INDEX "_awards_v_version_version_source_url_idx" ON "_awards_v" USING btree ("version_source_url");
  CREATE INDEX "jobs_source_url_idx" ON "jobs" USING btree ("source_url");
  CREATE INDEX "_jobs_v_version_version_source_url_idx" ON "_jobs_v" USING btree ("version_source_url");
  CREATE INDEX "insights_source_url_idx" ON "insights" USING btree ("source_url");
  CREATE INDEX "_insights_v_version_version_source_url_idx" ON "_insights_v" USING btree ("version_source_url");
  CREATE INDEX "press_mentions_source_url_idx" ON "press_mentions" USING btree ("source_url");
  CREATE INDEX "_press_mentions_v_version_version_source_url_idx" ON "_press_mentions_v" USING btree ("version_source_url");
  CREATE INDEX "legal_documents_source_url_idx" ON "legal_documents" USING btree ("source_url");
  CREATE INDEX "_legal_documents_v_version_version_source_url_idx" ON "_legal_documents_v" USING btree ("version_source_url");
  CREATE INDEX "media_source_url_idx" ON "media" USING btree ("source_url");
  CREATE INDEX "documents_source_url_idx" ON "documents" USING btree ("source_url");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "offices_source_url_idx";
  DROP INDEX "_offices_v_version_version_source_url_idx";
  DROP INDEX "awards_source_url_idx";
  DROP INDEX "_awards_v_version_version_source_url_idx";
  DROP INDEX "jobs_source_url_idx";
  DROP INDEX "_jobs_v_version_version_source_url_idx";
  DROP INDEX "insights_source_url_idx";
  DROP INDEX "_insights_v_version_version_source_url_idx";
  DROP INDEX "press_mentions_source_url_idx";
  DROP INDEX "_press_mentions_v_version_version_source_url_idx";
  DROP INDEX "legal_documents_source_url_idx";
  DROP INDEX "_legal_documents_v_version_version_source_url_idx";
  DROP INDEX "media_source_url_idx";
  DROP INDEX "documents_source_url_idx";
  ALTER TABLE "offices" DROP COLUMN "source_url";
  ALTER TABLE "_offices_v" DROP COLUMN "version_source_url";
  ALTER TABLE "awards" DROP COLUMN "source_url";
  ALTER TABLE "_awards_v" DROP COLUMN "version_source_url";
  ALTER TABLE "jobs" DROP COLUMN "source_url";
  ALTER TABLE "_jobs_v" DROP COLUMN "version_source_url";
  ALTER TABLE "insights" DROP COLUMN "source_url";
  ALTER TABLE "_insights_v" DROP COLUMN "version_source_url";
  ALTER TABLE "press_mentions" DROP COLUMN "source_url";
  ALTER TABLE "_press_mentions_v" DROP COLUMN "version_source_url";
  ALTER TABLE "legal_documents" DROP COLUMN "source_url";
  ALTER TABLE "_legal_documents_v" DROP COLUMN "version_source_url";
  ALTER TABLE "media" DROP COLUMN "source_url";
  ALTER TABLE "documents" DROP COLUMN "source_url";`)
}
