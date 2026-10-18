import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "solutions" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "funds" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_funds_v" ADD COLUMN "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "projects" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_projects_v" ADD COLUMN "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "people" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_people_v" ADD COLUMN "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "jobs" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_jobs_v" ADD COLUMN "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "insights" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_insights_v" ADD COLUMN "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "categories" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_categories_v" ADD COLUMN "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "research" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_research_v" ADD COLUMN "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "legal_documents" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_legal_documents_v" ADD COLUMN "version_meta_noindex" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "meta_noindex";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "solutions" DROP COLUMN "meta_noindex";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "funds" DROP COLUMN "meta_noindex";
  ALTER TABLE "_funds_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "projects" DROP COLUMN "meta_noindex";
  ALTER TABLE "_projects_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "people" DROP COLUMN "meta_noindex";
  ALTER TABLE "_people_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "jobs" DROP COLUMN "meta_noindex";
  ALTER TABLE "_jobs_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "insights" DROP COLUMN "meta_noindex";
  ALTER TABLE "_insights_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "categories" DROP COLUMN "meta_noindex";
  ALTER TABLE "_categories_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "research" DROP COLUMN "meta_noindex";
  ALTER TABLE "_research_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "legal_documents" DROP COLUMN "meta_noindex";
  ALTER TABLE "_legal_documents_v" DROP COLUMN "version_meta_noindex";`)
}
