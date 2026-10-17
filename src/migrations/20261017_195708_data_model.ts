import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en');
  CREATE TYPE "public"."enum_pages_blocks_hero_ctas_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_pages_blocks_solution_cards_mode" AS ENUM('all', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_filter" AS ENUM('leadership', 'division');
  CREATE TYPE "public"."enum_pages_blocks_office_cards_scope" AS ENUM('all', 'country');
  CREATE TYPE "public"."enum_pages_blocks_award_list_mode" AS ENUM('latest', 'years');
  CREATE TYPE "public"."enum_pages_blocks_insight_cards_mode" AS ENUM('latest', 'category', 'solution');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_button_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_pages_blocks_related_links_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_pages_hero_cta_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_ctas_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__pages_v_blocks_solution_cards_mode" AS ENUM('all', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_filter" AS ENUM('leadership', 'division');
  CREATE TYPE "public"."enum__pages_v_blocks_office_cards_scope" AS ENUM('all', 'country');
  CREATE TYPE "public"."enum__pages_v_blocks_award_list_mode" AS ENUM('latest', 'years');
  CREATE TYPE "public"."enum__pages_v_blocks_insight_cards_mode" AS ENUM('latest', 'category', 'solution');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_button_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__pages_v_blocks_related_links_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__pages_v_version_hero_cta_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_solutions_blocks_hero_ctas_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_solutions_blocks_solution_cards_mode" AS ENUM('all', 'manual');
  CREATE TYPE "public"."enum_solutions_blocks_team_grid_filter" AS ENUM('leadership', 'division');
  CREATE TYPE "public"."enum_solutions_blocks_office_cards_scope" AS ENUM('all', 'country');
  CREATE TYPE "public"."enum_solutions_blocks_award_list_mode" AS ENUM('latest', 'years');
  CREATE TYPE "public"."enum_solutions_blocks_insight_cards_mode" AS ENUM('latest', 'category', 'solution');
  CREATE TYPE "public"."enum_solutions_blocks_cta_band_button_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_solutions_blocks_related_links_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_solutions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__solutions_v_blocks_hero_ctas_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__solutions_v_blocks_solution_cards_mode" AS ENUM('all', 'manual');
  CREATE TYPE "public"."enum__solutions_v_blocks_team_grid_filter" AS ENUM('leadership', 'division');
  CREATE TYPE "public"."enum__solutions_v_blocks_office_cards_scope" AS ENUM('all', 'country');
  CREATE TYPE "public"."enum__solutions_v_blocks_award_list_mode" AS ENUM('latest', 'years');
  CREATE TYPE "public"."enum__solutions_v_blocks_insight_cards_mode" AS ENUM('latest', 'category', 'solution');
  CREATE TYPE "public"."enum__solutions_v_blocks_cta_band_button_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__solutions_v_blocks_related_links_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__solutions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__solutions_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_funds_investor_type" AS ENUM('qualified', 'retail');
  CREATE TYPE "public"."enum_funds_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__funds_v_version_investor_type" AS ENUM('qualified', 'retail');
  CREATE TYPE "public"."enum__funds_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__funds_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_projects_type" AS ENUM('retail', 'office', 'mixed-use', 'residential', 'industrial');
  CREATE TYPE "public"."enum_projects_project_status" AS ENUM('planning', 'under-construction', 'completed');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_type" AS ENUM('retail', 'office', 'mixed-use', 'residential', 'industrial');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_people_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__people_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__people_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_offices_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offices_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offices_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_awards_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__awards_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__awards_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_jobs_contract_type" AS ENUM('permanent', 'fixed-term', 'contract', 'internship');
  CREATE TYPE "public"."enum_jobs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__jobs_v_version_contract_type" AS ENUM('permanent', 'fixed-term', 'contract', 'internship');
  CREATE TYPE "public"."enum__jobs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__jobs_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_insights_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__insights_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__insights_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__categories_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_press_mentions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__press_mentions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__press_mentions_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_research_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__research_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__research_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_documents_type" AS ENUM('factsheet', 'legal', 'report', 'policy', 'other');
  CREATE TYPE "public"."enum_legal_documents_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__legal_documents_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__legal_documents_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor', 'compliance', 'contributor');
  CREATE TYPE "public"."enum_ai_changesets_status" AS ENUM('proposed', 'applied_to_draft', 'rejected', 'published', 'rolled_back', 'failed');
  CREATE TYPE "public"."enum_audit_log_operation" AS ENUM('create', 'update', 'delete', 'publish', 'unpublish');
  CREATE TYPE "public"."enum_audit_log_source" AS ENUM('human', 'ai');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_forms_confirmation_type" AS ENUM('message', 'redirect');
  CREATE TYPE "public"."enum_header_nav_items_children_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_header_utility_cta_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_footer_columns_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_footer_social_links_platform" AS ENUM('linkedin', 'x', 'facebook', 'instagram', 'youtube');
  CREATE TABLE "pages_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_hero_ctas_link_type" DEFAULT 'internal',
  	"link_label" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_intro_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_intro_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_solution_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"mode" "enum_pages_blocks_solution_cards_mode" DEFAULT 'all',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_values_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_values_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" numeric,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_team_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"filter" "enum_pages_blocks_team_grid_filter" DEFAULT 'leadership',
  	"division_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_office_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"scope" "enum_pages_blocks_office_cards_scope" DEFAULT 'all',
  	"country_slug" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_award_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"mode" "enum_pages_blocks_award_list_mode" DEFAULT 'latest',
  	"limit" numeric DEFAULT 6,
  	"from_year" numeric,
  	"to_year" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_press_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"limit" numeric DEFAULT 6,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_insight_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"mode" "enum_pages_blocks_insight_cards_mode" DEFAULT 'latest',
  	"limit" numeric DEFAULT 3,
  	"category_id" integer,
  	"solution_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_fund_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"fund_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_document_downloads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"person_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"button_type" "enum_pages_blocks_cta_band_button_type" DEFAULT 'internal',
  	"button_label" varchar,
  	"button_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"form_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_disclaimer_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_related_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_related_links_links_link_type" DEFAULT 'internal',
  	"link_label" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_related_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_heading" varchar,
  	"hero_subheading" varchar,
  	"hero_image_id" integer,
  	"hero_cta_type" "enum_pages_hero_cta_type" DEFAULT 'internal',
  	"hero_cta_label" varchar,
  	"hero_cta_url" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"path" varchar,
  	"regulated" boolean DEFAULT false,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"solutions_id" integer,
  	"funds_id" integer,
  	"projects_id" integer,
  	"people_id" integer,
  	"insights_id" integer,
  	"categories_id" integer,
  	"research_id" integer,
  	"jobs_id" integer,
  	"legal_documents_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_hero_ctas_link_type" DEFAULT 'internal',
  	"link_label" varchar,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_intro_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_intro_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_solution_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"mode" "enum__pages_v_blocks_solution_cards_mode" DEFAULT 'all',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_values_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_values_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"filter" "enum__pages_v_blocks_team_grid_filter" DEFAULT 'leadership',
  	"division_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_office_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"scope" "enum__pages_v_blocks_office_cards_scope" DEFAULT 'all',
  	"country_slug" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_award_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"mode" "enum__pages_v_blocks_award_list_mode" DEFAULT 'latest',
  	"limit" numeric DEFAULT 6,
  	"from_year" numeric,
  	"to_year" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_press_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"limit" numeric DEFAULT 6,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_insight_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"mode" "enum__pages_v_blocks_insight_cards_mode" DEFAULT 'latest',
  	"limit" numeric DEFAULT 3,
  	"category_id" integer,
  	"solution_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_fund_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"fund_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_document_downloads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"person_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"button_type" "enum__pages_v_blocks_cta_band_button_type" DEFAULT 'internal',
  	"button_label" varchar,
  	"button_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"form_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_disclaimer_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_related_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_related_links_links_link_type" DEFAULT 'internal',
  	"link_label" varchar,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_related_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_version_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_heading" varchar,
  	"version_hero_subheading" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_cta_type" "enum__pages_v_version_hero_cta_type" DEFAULT 'internal',
  	"version_hero_cta_label" varchar,
  	"version_hero_cta_url" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_path" varchar,
  	"version_regulated" boolean DEFAULT false,
  	"version_parent_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"solutions_id" integer,
  	"funds_id" integer,
  	"projects_id" integer,
  	"people_id" integer,
  	"insights_id" integer,
  	"categories_id" integer,
  	"research_id" integer,
  	"jobs_id" integer,
  	"legal_documents_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "solutions_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "solutions_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_solutions_blocks_hero_ctas_link_type" DEFAULT 'internal',
  	"link_label" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "solutions_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_intro_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "solutions_blocks_intro_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_solution_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"mode" "enum_solutions_blocks_solution_cards_mode" DEFAULT 'all',
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_values_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "solutions_blocks_values_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" numeric,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "solutions_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_team_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"filter" "enum_solutions_blocks_team_grid_filter" DEFAULT 'leadership',
  	"division_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_office_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"scope" "enum_solutions_blocks_office_cards_scope" DEFAULT 'all',
  	"country_slug" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_award_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"mode" "enum_solutions_blocks_award_list_mode" DEFAULT 'latest',
  	"limit" numeric DEFAULT 6,
  	"from_year" numeric,
  	"to_year" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_press_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"limit" numeric DEFAULT 6,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_insight_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"mode" "enum_solutions_blocks_insight_cards_mode" DEFAULT 'latest',
  	"limit" numeric DEFAULT 3,
  	"category_id" integer,
  	"solution_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_fund_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"fund_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_document_downloads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"person_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"button_type" "enum_solutions_blocks_cta_band_button_type" DEFAULT 'internal',
  	"button_label" varchar,
  	"button_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "solutions_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"form_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_disclaimer_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions_blocks_related_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_solutions_blocks_related_links_links_link_type" DEFAULT 'internal',
  	"link_label" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "solutions_blocks_related_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "solutions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"short_name" varchar,
  	"summary" varchar,
  	"hero_image_id" integer,
  	"fsp_licence_number" varchar,
  	"disclaimer" jsonb,
  	"contact_person_id" integer,
  	"external_url" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_solutions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "solutions_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "solutions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"solutions_id" integer,
  	"funds_id" integer,
  	"projects_id" integer,
  	"people_id" integer,
  	"insights_id" integer,
  	"categories_id" integer,
  	"research_id" integer,
  	"jobs_id" integer,
  	"legal_documents_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "_solutions_v_version_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__solutions_v_blocks_hero_ctas_link_type" DEFAULT 'internal',
  	"link_label" varchar,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_intro_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_intro_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_solution_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"mode" "enum__solutions_v_blocks_solution_cards_mode" DEFAULT 'all',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_values_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_values_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_team_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"filter" "enum__solutions_v_blocks_team_grid_filter" DEFAULT 'leadership',
  	"division_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_office_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"scope" "enum__solutions_v_blocks_office_cards_scope" DEFAULT 'all',
  	"country_slug" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_award_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"mode" "enum__solutions_v_blocks_award_list_mode" DEFAULT 'latest',
  	"limit" numeric DEFAULT 6,
  	"from_year" numeric,
  	"to_year" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_press_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"limit" numeric DEFAULT 6,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_insight_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"mode" "enum__solutions_v_blocks_insight_cards_mode" DEFAULT 'latest',
  	"limit" numeric DEFAULT 3,
  	"category_id" integer,
  	"solution_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_fund_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"fund_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_document_downloads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"person_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"button_type" "enum__solutions_v_blocks_cta_band_button_type" DEFAULT 'internal',
  	"button_label" varchar,
  	"button_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"form_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_disclaimer_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_related_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__solutions_v_blocks_related_links_links_link_type" DEFAULT 'internal',
  	"link_label" varchar,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_blocks_related_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_solutions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_short_name" varchar,
  	"version_summary" varchar,
  	"version_hero_image_id" integer,
  	"version_fsp_licence_number" varchar,
  	"version_disclaimer" jsonb,
  	"version_contact_person_id" integer,
  	"version_external_url" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__solutions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__solutions_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_solutions_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_solutions_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"solutions_id" integer,
  	"funds_id" integer,
  	"projects_id" integer,
  	"people_id" integer,
  	"insights_id" integer,
  	"categories_id" integer,
  	"research_id" integer,
  	"jobs_id" integer,
  	"legal_documents_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "funds" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"solution_id" integer,
  	"strategy" varchar,
  	"inception_date" timestamp(3) with time zone,
  	"minimum_investment" varchar,
  	"investor_type" "enum_funds_investor_type",
  	"factsheet_id" integer,
  	"summary" varchar,
  	"body" jsonb,
  	"disclaimer" jsonb,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_funds_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "funds_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "funds_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"awards_id" integer
  );
  
  CREATE TABLE "_funds_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_solution_id" integer,
  	"version_strategy" varchar,
  	"version_inception_date" timestamp(3) with time zone,
  	"version_minimum_investment" varchar,
  	"version_investor_type" "enum__funds_v_version_investor_type",
  	"version_factsheet_id" integer,
  	"version_summary" varchar,
  	"version_body" jsonb,
  	"version_disclaimer" jsonb,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__funds_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__funds_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_funds_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_funds_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"awards_id" integer
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"country" varchar,
  	"city" varchar,
  	"type" "enum_projects_type",
  	"status" "enum_projects_project_status",
  	"size_sqm" numeric,
  	"edge_certified" boolean DEFAULT false,
  	"body" jsonb,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_country" varchar,
  	"version_city" varchar,
  	"version_type" "enum__projects_v_version_type",
  	"version_status" "enum_projects_project_status",
  	"version_size_sqm" numeric,
  	"version_edge_certified" boolean DEFAULT false,
  	"version_body" jsonb,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"division_id" integer,
  	"photo_id" integer,
  	"bio" jsonb,
  	"linkedin_url" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"is_leadership" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_people_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "people_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_people_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_role" varchar,
  	"version_division_id" integer,
  	"version_photo_id" integer,
  	"version_bio" jsonb,
  	"version_linkedin_url" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_is_leadership" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__people_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__people_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_people_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "offices_address_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line" varchar
  );
  
  CREATE TABLE "offices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"country" varchar,
  	"city" varchar,
  	"postcode" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"geo_latitude" numeric,
  	"geo_longitude" numeric,
  	"opening_hours" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"country_slug" varchar,
  	"is_head_office" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_offices_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_offices_v_version_address_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"line" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_offices_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_country" varchar,
  	"version_city" varchar,
  	"version_postcode" varchar,
  	"version_phone" varchar,
  	"version_email" varchar,
  	"version_geo_latitude" numeric,
  	"version_geo_longitude" numeric,
  	"version_opening_hours" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_country_slug" varchar,
  	"version_is_head_office" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__offices_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__offices_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "awards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric,
  	"title" varchar,
  	"awarding_body" varchar,
  	"logo_id" integer,
  	"fund_id" integer,
  	"solution_id" integer,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_awards_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_awards_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_year" numeric,
  	"version_title" varchar,
  	"version_awarding_body" varchar,
  	"version_logo_id" integer,
  	"version_fund_id" integer,
  	"version_solution_id" integer,
  	"version_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__awards_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__awards_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"location_id" integer,
  	"department" varchar,
  	"contract_type" "enum_jobs_contract_type",
  	"closing_date" timestamp(3) with time zone,
  	"body" jsonb,
  	"apply_email" varchar,
  	"apply_url" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_jobs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "jobs_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_jobs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_location_id" integer,
  	"version_department" varchar,
  	"version_contract_type" "enum__jobs_v_version_contract_type",
  	"version_closing_date" timestamp(3) with time zone,
  	"version_body" jsonb,
  	"version_apply_email" varchar,
  	"version_apply_url" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__jobs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__jobs_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_jobs_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "insights" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_image_id" integer,
  	"excerpt" varchar,
  	"body" jsonb,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"author_id" integer,
  	"category_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_insights_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "insights_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "insights_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"solutions_id" integer
  );
  
  CREATE TABLE "_insights_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_image_id" integer,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_author_id" integer,
  	"version_category_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__insights_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__insights_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_insights_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_insights_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"solutions_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "categories_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__categories_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_categories_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "press_mentions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"outlet" varchar,
  	"published_at" timestamp(3) with time zone,
  	"url" varchar,
  	"thumbnail_id" integer,
  	"excerpt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_press_mentions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "press_mentions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"people_id" integer
  );
  
  CREATE TABLE "_press_mentions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_headline" varchar,
  	"version_outlet" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_url" varchar,
  	"version_thumbnail_id" integer,
  	"version_excerpt" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__press_mentions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__press_mentions_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_press_mentions_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"people_id" integer
  );
  
  CREATE TABLE "research_key_findings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"finding" varchar
  );
  
  CREATE TABLE "research" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"summary" varchar,
  	"report_id" integer,
  	"body" jsonb,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"year" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_research_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "research_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_research_v_version_key_findings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"finding" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_research_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_report_id" integer,
  	"version_body" jsonb,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_year" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__research_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__research_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_research_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_documents_type" DEFAULT 'other' NOT NULL,
  	"version_date" timestamp(3) with time zone,
  	"owner" varchar,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "legal_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" jsonb,
  	"file_id" integer,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"version_date" timestamp(3) with time zone,
  	"owner" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_legal_documents_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "legal_documents_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_legal_documents_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_body" jsonb,
  	"version_file_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_version_date" timestamp(3) with time zone,
  	"version_owner" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__legal_documents_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__legal_documents_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_legal_documents_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "ai_changesets_affected_docs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"collection" varchar NOT NULL,
  	"doc_id" varchar NOT NULL,
  	"before_version_id" varchar
  );
  
  CREATE TABLE "ai_changesets_flags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" varchar NOT NULL,
  	"detail" varchar
  );
  
  CREATE TABLE "ai_changesets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prompt" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"model" varchar,
  	"status" "enum_ai_changesets_status" DEFAULT 'proposed' NOT NULL,
  	"context" jsonb,
  	"messages" jsonb,
  	"operations" jsonb,
  	"input_tokens" numeric,
  	"output_tokens" numeric,
  	"cost_u_s_d" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"collection" varchar NOT NULL,
  	"doc_id" varchar NOT NULL,
  	"operation" "enum_audit_log_operation" NOT NULL,
  	"user_id" integer,
  	"source" "enum_audit_log_source" DEFAULT 'human' NOT NULL,
  	"changeset_id_id" integer,
  	"diff_summary" varchar,
  	"timestamp" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"type" "enum_redirects_type" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"solutions_id" integer,
  	"funds_id" integer,
  	"projects_id" integer,
  	"people_id" integer,
  	"insights_id" integer,
  	"categories_id" integer,
  	"research_id" integer,
  	"jobs_id" integer,
  	"legal_documents_id" integer
  );
  
  CREATE TABLE "forms_blocks_checkbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"default_value" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_checkbox_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_email" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_email_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_message" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_message_locales" (
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"placeholder" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_select_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_text_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_textarea" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_textarea_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email_to" varchar,
  	"cc" varchar,
  	"bcc" varchar,
  	"reply_to" varchar,
  	"email_from" varchar
  );
  
  CREATE TABLE "forms_emails_locales" (
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"confirmation_type" "enum_forms_confirmation_type" DEFAULT 'message',
  	"redirect_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "forms_locales" (
  	"submit_button_label" varchar,
  	"confirmation_message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "form_submissions_submission_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_nav_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_children_link_type" DEFAULT 'internal',
  	"link_label" varchar NOT NULL,
  	"link_url" varchar
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'internal',
  	"link_label" varchar NOT NULL,
  	"link_url" varchar
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"utility_cta_type" "enum_header_utility_cta_type" DEFAULT 'internal',
  	"utility_cta_label" varchar,
  	"utility_cta_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"solutions_id" integer,
  	"funds_id" integer,
  	"projects_id" integer,
  	"people_id" integer,
  	"insights_id" integer,
  	"categories_id" integer,
  	"research_id" integer,
  	"jobs_id" integer,
  	"legal_documents_id" integer
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_columns_links_link_type" DEFAULT 'internal',
  	"link_label" varchar NOT NULL,
  	"link_url" varchar
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );
  
  CREATE TABLE "footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_footer_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"solutions_id" integer,
  	"funds_id" integer,
  	"projects_id" integer,
  	"people_id" integer,
  	"insights_id" integer,
  	"categories_id" integer,
  	"research_id" integer,
  	"jobs_id" integer,
  	"legal_documents_id" integer,
  	"offices_id" integer
  );
  
  CREATE TABLE "site_settings_organization_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organisation_name" varchar DEFAULT 'Novare' NOT NULL,
  	"logo_id" integer,
  	"default_og_image_id" integer,
  	"default_disclaimer" jsonb,
  	"organization_legal_name" varchar,
  	"organization_founding_year" numeric,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ai_settings_regulated_phrases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pattern" varchar NOT NULL,
  	"is_regex" boolean DEFAULT false
  );
  
  CREATE TABLE "ai_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"model" varchar,
  	"monthly_budget_u_s_d" numeric,
  	"system_prompt_addendum" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users" ADD COLUMN "name" varchar;
  -- Hand-edited: existing accounts predate the name field; start them on their email address.
  UPDATE "users" SET "name" = "email" WHERE "name" IS NULL;
  ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
  -- Hand-edited: accounts that predate roles were created as the site owner; keep them admins.
  INSERT INTO "users_roles" ("order", "parent_id", "value") SELECT 1, "id", 'admin' FROM "users";
  ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT '';
  ALTER TABLE "media" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w400_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w400_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w400_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w400_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w400_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w400_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w800_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w800_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w800_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w800_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w800_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w800_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w1200_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w1200_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w1200_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w1200_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w1200_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w1200_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w1600_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w1600_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w1600_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w1600_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w1600_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w1600_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w2400_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w2400_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w2400_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w2400_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w2400_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w2400_filename" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "solutions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "funds_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "projects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "offices_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "awards_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "jobs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "insights_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "press_mentions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "research_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "documents_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "legal_documents_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ai_changesets_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audit_log_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "forms_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "form_submissions_id" integer;
  ALTER TABLE "pages_blocks_hero_ctas" ADD CONSTRAINT "pages_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_intro_stats_stats" ADD CONSTRAINT "pages_blocks_intro_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_intro_stats" ADD CONSTRAINT "pages_blocks_intro_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_solution_cards" ADD CONSTRAINT "pages_blocks_solution_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_values_list_items" ADD CONSTRAINT "pages_blocks_values_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_values_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_values_list" ADD CONSTRAINT "pages_blocks_values_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_items" ADD CONSTRAINT "pages_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline" ADD CONSTRAINT "pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_grid" ADD CONSTRAINT "pages_blocks_team_grid_division_id_solutions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_grid" ADD CONSTRAINT "pages_blocks_team_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_office_cards" ADD CONSTRAINT "pages_blocks_office_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_award_list" ADD CONSTRAINT "pages_blocks_award_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_press_list" ADD CONSTRAINT "pages_blocks_press_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_insight_cards" ADD CONSTRAINT "pages_blocks_insight_cards_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_insight_cards" ADD CONSTRAINT "pages_blocks_insight_cards_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_insight_cards" ADD CONSTRAINT "pages_blocks_insight_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_fund_facts" ADD CONSTRAINT "pages_blocks_fund_facts_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_fund_facts" ADD CONSTRAINT "pages_blocks_fund_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_document_downloads" ADD CONSTRAINT "pages_blocks_document_downloads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quote" ADD CONSTRAINT "pages_blocks_quote_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_quote" ADD CONSTRAINT "pages_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band" ADD CONSTRAINT "pages_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_form" ADD CONSTRAINT "pages_blocks_contact_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_form" ADD CONSTRAINT "pages_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_disclaimer_strip" ADD CONSTRAINT "pages_blocks_disclaimer_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_related_links_links" ADD CONSTRAINT "pages_blocks_related_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_related_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_related_links" ADD CONSTRAINT "pages_blocks_related_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_breadcrumbs" ADD CONSTRAINT "pages_breadcrumbs_doc_id_pages_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_breadcrumbs" ADD CONSTRAINT "pages_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_funds_fk" FOREIGN KEY ("funds_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_research_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_legal_documents_fk" FOREIGN KEY ("legal_documents_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_ctas" ADD CONSTRAINT "_pages_v_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_intro_stats_stats" ADD CONSTRAINT "_pages_v_blocks_intro_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_intro_stats" ADD CONSTRAINT "_pages_v_blocks_intro_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_solution_cards" ADD CONSTRAINT "_pages_v_blocks_solution_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_values_list_items" ADD CONSTRAINT "_pages_v_blocks_values_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_values_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_values_list" ADD CONSTRAINT "_pages_v_blocks_values_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_items" ADD CONSTRAINT "_pages_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline" ADD CONSTRAINT "_pages_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_grid" ADD CONSTRAINT "_pages_v_blocks_team_grid_division_id_solutions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_grid" ADD CONSTRAINT "_pages_v_blocks_team_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_office_cards" ADD CONSTRAINT "_pages_v_blocks_office_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_award_list" ADD CONSTRAINT "_pages_v_blocks_award_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_press_list" ADD CONSTRAINT "_pages_v_blocks_press_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_insight_cards" ADD CONSTRAINT "_pages_v_blocks_insight_cards_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_insight_cards" ADD CONSTRAINT "_pages_v_blocks_insight_cards_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_insight_cards" ADD CONSTRAINT "_pages_v_blocks_insight_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_fund_facts" ADD CONSTRAINT "_pages_v_blocks_fund_facts_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_fund_facts" ADD CONSTRAINT "_pages_v_blocks_fund_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_document_downloads" ADD CONSTRAINT "_pages_v_blocks_document_downloads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quote" ADD CONSTRAINT "_pages_v_blocks_quote_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quote" ADD CONSTRAINT "_pages_v_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_band" ADD CONSTRAINT "_pages_v_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_form" ADD CONSTRAINT "_pages_v_blocks_contact_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_form" ADD CONSTRAINT "_pages_v_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_disclaimer_strip" ADD CONSTRAINT "_pages_v_blocks_disclaimer_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_related_links_links" ADD CONSTRAINT "_pages_v_blocks_related_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_related_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_related_links" ADD CONSTRAINT "_pages_v_blocks_related_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_breadcrumbs" ADD CONSTRAINT "_pages_v_version_breadcrumbs_doc_id_pages_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_breadcrumbs" ADD CONSTRAINT "_pages_v_version_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_funds_fk" FOREIGN KEY ("funds_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_research_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_legal_documents_fk" FOREIGN KEY ("legal_documents_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_key_facts" ADD CONSTRAINT "solutions_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_hero_ctas" ADD CONSTRAINT "solutions_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_hero" ADD CONSTRAINT "solutions_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_blocks_hero" ADD CONSTRAINT "solutions_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_rich_text" ADD CONSTRAINT "solutions_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_intro_stats_stats" ADD CONSTRAINT "solutions_blocks_intro_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_intro_stats" ADD CONSTRAINT "solutions_blocks_intro_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_solution_cards" ADD CONSTRAINT "solutions_blocks_solution_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_values_list_items" ADD CONSTRAINT "solutions_blocks_values_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions_blocks_values_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_values_list" ADD CONSTRAINT "solutions_blocks_values_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_timeline_items" ADD CONSTRAINT "solutions_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_timeline" ADD CONSTRAINT "solutions_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_team_grid" ADD CONSTRAINT "solutions_blocks_team_grid_division_id_solutions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_blocks_team_grid" ADD CONSTRAINT "solutions_blocks_team_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_office_cards" ADD CONSTRAINT "solutions_blocks_office_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_award_list" ADD CONSTRAINT "solutions_blocks_award_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_press_list" ADD CONSTRAINT "solutions_blocks_press_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_insight_cards" ADD CONSTRAINT "solutions_blocks_insight_cards_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_blocks_insight_cards" ADD CONSTRAINT "solutions_blocks_insight_cards_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_blocks_insight_cards" ADD CONSTRAINT "solutions_blocks_insight_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_fund_facts" ADD CONSTRAINT "solutions_blocks_fund_facts_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_blocks_fund_facts" ADD CONSTRAINT "solutions_blocks_fund_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_document_downloads" ADD CONSTRAINT "solutions_blocks_document_downloads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_quote" ADD CONSTRAINT "solutions_blocks_quote_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_blocks_quote" ADD CONSTRAINT "solutions_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_cta_band" ADD CONSTRAINT "solutions_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_faq_items" ADD CONSTRAINT "solutions_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_faq" ADD CONSTRAINT "solutions_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_contact_form" ADD CONSTRAINT "solutions_blocks_contact_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_blocks_contact_form" ADD CONSTRAINT "solutions_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_disclaimer_strip" ADD CONSTRAINT "solutions_blocks_disclaimer_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_related_links_links" ADD CONSTRAINT "solutions_blocks_related_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions_blocks_related_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_blocks_related_links" ADD CONSTRAINT "solutions_blocks_related_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions" ADD CONSTRAINT "solutions_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions" ADD CONSTRAINT "solutions_contact_person_id_people_id_fk" FOREIGN KEY ("contact_person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_locales" ADD CONSTRAINT "solutions_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_locales" ADD CONSTRAINT "solutions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_funds_fk" FOREIGN KEY ("funds_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_research_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_legal_documents_fk" FOREIGN KEY ("legal_documents_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_key_facts" ADD CONSTRAINT "_solutions_v_version_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_hero_ctas" ADD CONSTRAINT "_solutions_v_blocks_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_hero" ADD CONSTRAINT "_solutions_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_hero" ADD CONSTRAINT "_solutions_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_rich_text" ADD CONSTRAINT "_solutions_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_intro_stats_stats" ADD CONSTRAINT "_solutions_v_blocks_intro_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_intro_stats" ADD CONSTRAINT "_solutions_v_blocks_intro_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_solution_cards" ADD CONSTRAINT "_solutions_v_blocks_solution_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_values_list_items" ADD CONSTRAINT "_solutions_v_blocks_values_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v_blocks_values_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_values_list" ADD CONSTRAINT "_solutions_v_blocks_values_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_timeline_items" ADD CONSTRAINT "_solutions_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_timeline" ADD CONSTRAINT "_solutions_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_team_grid" ADD CONSTRAINT "_solutions_v_blocks_team_grid_division_id_solutions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_team_grid" ADD CONSTRAINT "_solutions_v_blocks_team_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_office_cards" ADD CONSTRAINT "_solutions_v_blocks_office_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_award_list" ADD CONSTRAINT "_solutions_v_blocks_award_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_press_list" ADD CONSTRAINT "_solutions_v_blocks_press_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_insight_cards" ADD CONSTRAINT "_solutions_v_blocks_insight_cards_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_insight_cards" ADD CONSTRAINT "_solutions_v_blocks_insight_cards_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_insight_cards" ADD CONSTRAINT "_solutions_v_blocks_insight_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_fund_facts" ADD CONSTRAINT "_solutions_v_blocks_fund_facts_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_fund_facts" ADD CONSTRAINT "_solutions_v_blocks_fund_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_document_downloads" ADD CONSTRAINT "_solutions_v_blocks_document_downloads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_quote" ADD CONSTRAINT "_solutions_v_blocks_quote_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_quote" ADD CONSTRAINT "_solutions_v_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_cta_band" ADD CONSTRAINT "_solutions_v_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_faq_items" ADD CONSTRAINT "_solutions_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_faq" ADD CONSTRAINT "_solutions_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_contact_form" ADD CONSTRAINT "_solutions_v_blocks_contact_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_contact_form" ADD CONSTRAINT "_solutions_v_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_disclaimer_strip" ADD CONSTRAINT "_solutions_v_blocks_disclaimer_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_related_links_links" ADD CONSTRAINT "_solutions_v_blocks_related_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v_blocks_related_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_blocks_related_links" ADD CONSTRAINT "_solutions_v_blocks_related_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v" ADD CONSTRAINT "_solutions_v_parent_id_solutions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v" ADD CONSTRAINT "_solutions_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v" ADD CONSTRAINT "_solutions_v_version_contact_person_id_people_id_fk" FOREIGN KEY ("version_contact_person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v_locales" ADD CONSTRAINT "_solutions_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v_locales" ADD CONSTRAINT "_solutions_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_funds_fk" FOREIGN KEY ("funds_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_research_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_legal_documents_fk" FOREIGN KEY ("legal_documents_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "funds" ADD CONSTRAINT "funds_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "funds" ADD CONSTRAINT "funds_factsheet_id_documents_id_fk" FOREIGN KEY ("factsheet_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "funds_locales" ADD CONSTRAINT "funds_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "funds_locales" ADD CONSTRAINT "funds_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "funds_rels" ADD CONSTRAINT "funds_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "funds_rels" ADD CONSTRAINT "funds_rels_awards_fk" FOREIGN KEY ("awards_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_funds_v" ADD CONSTRAINT "_funds_v_parent_id_funds_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."funds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_funds_v" ADD CONSTRAINT "_funds_v_version_solution_id_solutions_id_fk" FOREIGN KEY ("version_solution_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_funds_v" ADD CONSTRAINT "_funds_v_version_factsheet_id_documents_id_fk" FOREIGN KEY ("version_factsheet_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_funds_v_locales" ADD CONSTRAINT "_funds_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_funds_v_locales" ADD CONSTRAINT "_funds_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_funds_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_funds_v_rels" ADD CONSTRAINT "_funds_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_funds_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_funds_v_rels" ADD CONSTRAINT "_funds_v_rels_awards_fk" FOREIGN KEY ("awards_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_division_id_solutions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_locales" ADD CONSTRAINT "people_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_locales" ADD CONSTRAINT "people_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_parent_id_people_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_division_id_solutions_id_fk" FOREIGN KEY ("version_division_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v_locales" ADD CONSTRAINT "_people_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v_locales" ADD CONSTRAINT "_people_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_people_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offices_address_lines" ADD CONSTRAINT "offices_address_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offices_v_version_address_lines" ADD CONSTRAINT "_offices_v_version_address_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offices_v" ADD CONSTRAINT "_offices_v_parent_id_offices_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "awards" ADD CONSTRAINT "awards_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "awards" ADD CONSTRAINT "awards_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "awards" ADD CONSTRAINT "awards_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_awards_v" ADD CONSTRAINT "_awards_v_parent_id_awards_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."awards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_awards_v" ADD CONSTRAINT "_awards_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_awards_v" ADD CONSTRAINT "_awards_v_version_fund_id_funds_id_fk" FOREIGN KEY ("version_fund_id") REFERENCES "public"."funds"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_awards_v" ADD CONSTRAINT "_awards_v_version_solution_id_solutions_id_fk" FOREIGN KEY ("version_solution_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_location_id_offices_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jobs_locales" ADD CONSTRAINT "jobs_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jobs_locales" ADD CONSTRAINT "jobs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_parent_id_jobs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_version_location_id_offices_id_fk" FOREIGN KEY ("version_location_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v_locales" ADD CONSTRAINT "_jobs_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v_locales" ADD CONSTRAINT "_jobs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights" ADD CONSTRAINT "insights_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights" ADD CONSTRAINT "insights_author_id_people_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights" ADD CONSTRAINT "insights_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_locales" ADD CONSTRAINT "insights_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_locales" ADD CONSTRAINT "insights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_parent_id_insights_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insights"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_version_author_id_people_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v_locales" ADD CONSTRAINT "_insights_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v_locales" ADD CONSTRAINT "_insights_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_insights_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_insights_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_locales" ADD CONSTRAINT "_categories_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_locales" ADD CONSTRAINT "_categories_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "press_mentions" ADD CONSTRAINT "press_mentions_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "press_mentions_rels" ADD CONSTRAINT "press_mentions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."press_mentions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "press_mentions_rels" ADD CONSTRAINT "press_mentions_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_press_mentions_v" ADD CONSTRAINT "_press_mentions_v_parent_id_press_mentions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."press_mentions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_press_mentions_v" ADD CONSTRAINT "_press_mentions_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_press_mentions_v_rels" ADD CONSTRAINT "_press_mentions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_press_mentions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_press_mentions_v_rels" ADD CONSTRAINT "_press_mentions_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "research_key_findings" ADD CONSTRAINT "research_key_findings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "research" ADD CONSTRAINT "research_report_id_documents_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "research_locales" ADD CONSTRAINT "research_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "research_locales" ADD CONSTRAINT "research_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_research_v_version_key_findings" ADD CONSTRAINT "_research_v_version_key_findings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_research_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_research_v" ADD CONSTRAINT "_research_v_parent_id_research_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."research"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_research_v" ADD CONSTRAINT "_research_v_version_report_id_documents_id_fk" FOREIGN KEY ("version_report_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_research_v_locales" ADD CONSTRAINT "_research_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_research_v_locales" ADD CONSTRAINT "_research_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_research_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_file_id_documents_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_documents_locales" ADD CONSTRAINT "legal_documents_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_documents_locales" ADD CONSTRAINT "legal_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_legal_documents_v" ADD CONSTRAINT "_legal_documents_v_parent_id_legal_documents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."legal_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_documents_v" ADD CONSTRAINT "_legal_documents_v_version_file_id_documents_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_documents_v_locales" ADD CONSTRAINT "_legal_documents_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_documents_v_locales" ADD CONSTRAINT "_legal_documents_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_legal_documents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_changesets_affected_docs" ADD CONSTRAINT "ai_changesets_affected_docs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_changesets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_changesets_flags" ADD CONSTRAINT "ai_changesets_flags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_changesets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_changesets" ADD CONSTRAINT "ai_changesets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_changeset_id_id_ai_changesets_id_fk" FOREIGN KEY ("changeset_id_id") REFERENCES "public"."ai_changesets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_funds_fk" FOREIGN KEY ("funds_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_research_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_legal_documents_fk" FOREIGN KEY ("legal_documents_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox" ADD CONSTRAINT "forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox_locales" ADD CONSTRAINT "forms_blocks_checkbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_checkbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email" ADD CONSTRAINT "forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email_locales" ADD CONSTRAINT "forms_blocks_email_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_email"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message" ADD CONSTRAINT "forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message_locales" ADD CONSTRAINT "forms_blocks_message_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_message"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options" ADD CONSTRAINT "forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options_locales" ADD CONSTRAINT "forms_blocks_select_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select" ADD CONSTRAINT "forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_locales" ADD CONSTRAINT "forms_blocks_select_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text" ADD CONSTRAINT "forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text_locales" ADD CONSTRAINT "forms_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea_locales" ADD CONSTRAINT "forms_blocks_textarea_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_textarea"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails" ADD CONSTRAINT "forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails_locales" ADD CONSTRAINT "forms_emails_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_emails"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_locales" ADD CONSTRAINT "forms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_nav_items_children" ADD CONSTRAINT "header_nav_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_funds_fk" FOREIGN KEY ("funds_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_research_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_legal_documents_fk" FOREIGN KEY ("legal_documents_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_funds_fk" FOREIGN KEY ("funds_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_research_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_legal_documents_fk" FOREIGN KEY ("legal_documents_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_offices_fk" FOREIGN KEY ("offices_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_organization_same_as" ADD CONSTRAINT "site_settings_organization_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ai_settings_regulated_phrases" ADD CONSTRAINT "ai_settings_regulated_phrases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_ctas_order_idx" ON "pages_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_ctas_parent_id_idx" ON "pages_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_intro_stats_stats_order_idx" ON "pages_blocks_intro_stats_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_intro_stats_stats_parent_id_idx" ON "pages_blocks_intro_stats_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_intro_stats_order_idx" ON "pages_blocks_intro_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_intro_stats_parent_id_idx" ON "pages_blocks_intro_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_intro_stats_path_idx" ON "pages_blocks_intro_stats" USING btree ("_path");
  CREATE INDEX "pages_blocks_solution_cards_order_idx" ON "pages_blocks_solution_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_solution_cards_parent_id_idx" ON "pages_blocks_solution_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_solution_cards_path_idx" ON "pages_blocks_solution_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_values_list_items_order_idx" ON "pages_blocks_values_list_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_values_list_items_parent_id_idx" ON "pages_blocks_values_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_values_list_order_idx" ON "pages_blocks_values_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_values_list_parent_id_idx" ON "pages_blocks_values_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_values_list_path_idx" ON "pages_blocks_values_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_timeline_items_order_idx" ON "pages_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_items_parent_id_idx" ON "pages_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_order_idx" ON "pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_parent_id_idx" ON "pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_path_idx" ON "pages_blocks_timeline" USING btree ("_path");
  CREATE INDEX "pages_blocks_team_grid_order_idx" ON "pages_blocks_team_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_grid_parent_id_idx" ON "pages_blocks_team_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_grid_path_idx" ON "pages_blocks_team_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_team_grid_division_idx" ON "pages_blocks_team_grid" USING btree ("division_id");
  CREATE INDEX "pages_blocks_office_cards_order_idx" ON "pages_blocks_office_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_office_cards_parent_id_idx" ON "pages_blocks_office_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_office_cards_path_idx" ON "pages_blocks_office_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_award_list_order_idx" ON "pages_blocks_award_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_award_list_parent_id_idx" ON "pages_blocks_award_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_award_list_path_idx" ON "pages_blocks_award_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_press_list_order_idx" ON "pages_blocks_press_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_press_list_parent_id_idx" ON "pages_blocks_press_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_press_list_path_idx" ON "pages_blocks_press_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_insight_cards_order_idx" ON "pages_blocks_insight_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_insight_cards_parent_id_idx" ON "pages_blocks_insight_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_insight_cards_path_idx" ON "pages_blocks_insight_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_insight_cards_category_idx" ON "pages_blocks_insight_cards" USING btree ("category_id");
  CREATE INDEX "pages_blocks_insight_cards_solution_idx" ON "pages_blocks_insight_cards" USING btree ("solution_id");
  CREATE INDEX "pages_blocks_fund_facts_order_idx" ON "pages_blocks_fund_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_fund_facts_parent_id_idx" ON "pages_blocks_fund_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_fund_facts_path_idx" ON "pages_blocks_fund_facts" USING btree ("_path");
  CREATE INDEX "pages_blocks_fund_facts_fund_idx" ON "pages_blocks_fund_facts" USING btree ("fund_id");
  CREATE INDEX "pages_blocks_document_downloads_order_idx" ON "pages_blocks_document_downloads" USING btree ("_order");
  CREATE INDEX "pages_blocks_document_downloads_parent_id_idx" ON "pages_blocks_document_downloads" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_document_downloads_path_idx" ON "pages_blocks_document_downloads" USING btree ("_path");
  CREATE INDEX "pages_blocks_quote_order_idx" ON "pages_blocks_quote" USING btree ("_order");
  CREATE INDEX "pages_blocks_quote_parent_id_idx" ON "pages_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quote_path_idx" ON "pages_blocks_quote" USING btree ("_path");
  CREATE INDEX "pages_blocks_quote_person_idx" ON "pages_blocks_quote" USING btree ("person_id");
  CREATE INDEX "pages_blocks_cta_band_order_idx" ON "pages_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_band_parent_id_idx" ON "pages_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_band_path_idx" ON "pages_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_form_order_idx" ON "pages_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_form_parent_id_idx" ON "pages_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_form_path_idx" ON "pages_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_form_form_idx" ON "pages_blocks_contact_form" USING btree ("form_id");
  CREATE INDEX "pages_blocks_disclaimer_strip_order_idx" ON "pages_blocks_disclaimer_strip" USING btree ("_order");
  CREATE INDEX "pages_blocks_disclaimer_strip_parent_id_idx" ON "pages_blocks_disclaimer_strip" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_disclaimer_strip_path_idx" ON "pages_blocks_disclaimer_strip" USING btree ("_path");
  CREATE INDEX "pages_blocks_related_links_links_order_idx" ON "pages_blocks_related_links_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_related_links_links_parent_id_idx" ON "pages_blocks_related_links_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_related_links_order_idx" ON "pages_blocks_related_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_related_links_parent_id_idx" ON "pages_blocks_related_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_related_links_path_idx" ON "pages_blocks_related_links" USING btree ("_path");
  CREATE INDEX "pages_breadcrumbs_order_idx" ON "pages_breadcrumbs" USING btree ("_order");
  CREATE INDEX "pages_breadcrumbs_parent_id_idx" ON "pages_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "pages_breadcrumbs_locale_idx" ON "pages_breadcrumbs" USING btree ("_locale");
  CREATE INDEX "pages_breadcrumbs_doc_idx" ON "pages_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "pages_hero_hero_image_idx" ON "pages" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE UNIQUE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_solutions_id_idx" ON "pages_rels" USING btree ("solutions_id");
  CREATE INDEX "pages_rels_funds_id_idx" ON "pages_rels" USING btree ("funds_id");
  CREATE INDEX "pages_rels_projects_id_idx" ON "pages_rels" USING btree ("projects_id");
  CREATE INDEX "pages_rels_people_id_idx" ON "pages_rels" USING btree ("people_id");
  CREATE INDEX "pages_rels_insights_id_idx" ON "pages_rels" USING btree ("insights_id");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "pages_rels_research_id_idx" ON "pages_rels" USING btree ("research_id");
  CREATE INDEX "pages_rels_jobs_id_idx" ON "pages_rels" USING btree ("jobs_id");
  CREATE INDEX "pages_rels_legal_documents_id_idx" ON "pages_rels" USING btree ("legal_documents_id");
  CREATE INDEX "pages_rels_documents_id_idx" ON "pages_rels" USING btree ("documents_id");
  CREATE INDEX "_pages_v_blocks_hero_ctas_order_idx" ON "_pages_v_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_ctas_parent_id_idx" ON "_pages_v_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_intro_stats_stats_order_idx" ON "_pages_v_blocks_intro_stats_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_intro_stats_stats_parent_id_idx" ON "_pages_v_blocks_intro_stats_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_intro_stats_order_idx" ON "_pages_v_blocks_intro_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_intro_stats_parent_id_idx" ON "_pages_v_blocks_intro_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_intro_stats_path_idx" ON "_pages_v_blocks_intro_stats" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_solution_cards_order_idx" ON "_pages_v_blocks_solution_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_solution_cards_parent_id_idx" ON "_pages_v_blocks_solution_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_solution_cards_path_idx" ON "_pages_v_blocks_solution_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_values_list_items_order_idx" ON "_pages_v_blocks_values_list_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_values_list_items_parent_id_idx" ON "_pages_v_blocks_values_list_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_values_list_order_idx" ON "_pages_v_blocks_values_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_values_list_parent_id_idx" ON "_pages_v_blocks_values_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_values_list_path_idx" ON "_pages_v_blocks_values_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_timeline_items_order_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_items_parent_id_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_order_idx" ON "_pages_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_parent_id_idx" ON "_pages_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_path_idx" ON "_pages_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_team_grid_order_idx" ON "_pages_v_blocks_team_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_grid_parent_id_idx" ON "_pages_v_blocks_team_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_grid_path_idx" ON "_pages_v_blocks_team_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_team_grid_division_idx" ON "_pages_v_blocks_team_grid" USING btree ("division_id");
  CREATE INDEX "_pages_v_blocks_office_cards_order_idx" ON "_pages_v_blocks_office_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_office_cards_parent_id_idx" ON "_pages_v_blocks_office_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_office_cards_path_idx" ON "_pages_v_blocks_office_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_award_list_order_idx" ON "_pages_v_blocks_award_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_award_list_parent_id_idx" ON "_pages_v_blocks_award_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_award_list_path_idx" ON "_pages_v_blocks_award_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_press_list_order_idx" ON "_pages_v_blocks_press_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_press_list_parent_id_idx" ON "_pages_v_blocks_press_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_press_list_path_idx" ON "_pages_v_blocks_press_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_insight_cards_order_idx" ON "_pages_v_blocks_insight_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_insight_cards_parent_id_idx" ON "_pages_v_blocks_insight_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_insight_cards_path_idx" ON "_pages_v_blocks_insight_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_insight_cards_category_idx" ON "_pages_v_blocks_insight_cards" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_insight_cards_solution_idx" ON "_pages_v_blocks_insight_cards" USING btree ("solution_id");
  CREATE INDEX "_pages_v_blocks_fund_facts_order_idx" ON "_pages_v_blocks_fund_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_fund_facts_parent_id_idx" ON "_pages_v_blocks_fund_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_fund_facts_path_idx" ON "_pages_v_blocks_fund_facts" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_fund_facts_fund_idx" ON "_pages_v_blocks_fund_facts" USING btree ("fund_id");
  CREATE INDEX "_pages_v_blocks_document_downloads_order_idx" ON "_pages_v_blocks_document_downloads" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_document_downloads_parent_id_idx" ON "_pages_v_blocks_document_downloads" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_document_downloads_path_idx" ON "_pages_v_blocks_document_downloads" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_quote_order_idx" ON "_pages_v_blocks_quote" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_quote_parent_id_idx" ON "_pages_v_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_quote_path_idx" ON "_pages_v_blocks_quote" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_quote_person_idx" ON "_pages_v_blocks_quote" USING btree ("person_id");
  CREATE INDEX "_pages_v_blocks_cta_band_order_idx" ON "_pages_v_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_band_parent_id_idx" ON "_pages_v_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_band_path_idx" ON "_pages_v_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_form_order_idx" ON "_pages_v_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_form_parent_id_idx" ON "_pages_v_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_form_path_idx" ON "_pages_v_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_form_form_idx" ON "_pages_v_blocks_contact_form" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_disclaimer_strip_order_idx" ON "_pages_v_blocks_disclaimer_strip" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_disclaimer_strip_parent_id_idx" ON "_pages_v_blocks_disclaimer_strip" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_disclaimer_strip_path_idx" ON "_pages_v_blocks_disclaimer_strip" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_related_links_links_order_idx" ON "_pages_v_blocks_related_links_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_related_links_links_parent_id_idx" ON "_pages_v_blocks_related_links_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_related_links_order_idx" ON "_pages_v_blocks_related_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_related_links_parent_id_idx" ON "_pages_v_blocks_related_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_related_links_path_idx" ON "_pages_v_blocks_related_links" USING btree ("_path");
  CREATE INDEX "_pages_v_version_breadcrumbs_order_idx" ON "_pages_v_version_breadcrumbs" USING btree ("_order");
  CREATE INDEX "_pages_v_version_breadcrumbs_parent_id_idx" ON "_pages_v_version_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_breadcrumbs_locale_idx" ON "_pages_v_version_breadcrumbs" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_breadcrumbs_doc_idx" ON "_pages_v_version_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_image_idx" ON "_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_path_idx" ON "_pages_v" USING btree ("version_path");
  CREATE INDEX "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_solutions_id_idx" ON "_pages_v_rels" USING btree ("solutions_id");
  CREATE INDEX "_pages_v_rels_funds_id_idx" ON "_pages_v_rels" USING btree ("funds_id");
  CREATE INDEX "_pages_v_rels_projects_id_idx" ON "_pages_v_rels" USING btree ("projects_id");
  CREATE INDEX "_pages_v_rels_people_id_idx" ON "_pages_v_rels" USING btree ("people_id");
  CREATE INDEX "_pages_v_rels_insights_id_idx" ON "_pages_v_rels" USING btree ("insights_id");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_rels_research_id_idx" ON "_pages_v_rels" USING btree ("research_id");
  CREATE INDEX "_pages_v_rels_jobs_id_idx" ON "_pages_v_rels" USING btree ("jobs_id");
  CREATE INDEX "_pages_v_rels_legal_documents_id_idx" ON "_pages_v_rels" USING btree ("legal_documents_id");
  CREATE INDEX "_pages_v_rels_documents_id_idx" ON "_pages_v_rels" USING btree ("documents_id");
  CREATE INDEX "solutions_key_facts_order_idx" ON "solutions_key_facts" USING btree ("_order");
  CREATE INDEX "solutions_key_facts_parent_id_idx" ON "solutions_key_facts" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_hero_ctas_order_idx" ON "solutions_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "solutions_blocks_hero_ctas_parent_id_idx" ON "solutions_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_hero_order_idx" ON "solutions_blocks_hero" USING btree ("_order");
  CREATE INDEX "solutions_blocks_hero_parent_id_idx" ON "solutions_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_hero_path_idx" ON "solutions_blocks_hero" USING btree ("_path");
  CREATE INDEX "solutions_blocks_hero_image_idx" ON "solutions_blocks_hero" USING btree ("image_id");
  CREATE INDEX "solutions_blocks_rich_text_order_idx" ON "solutions_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "solutions_blocks_rich_text_parent_id_idx" ON "solutions_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_rich_text_path_idx" ON "solutions_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "solutions_blocks_intro_stats_stats_order_idx" ON "solutions_blocks_intro_stats_stats" USING btree ("_order");
  CREATE INDEX "solutions_blocks_intro_stats_stats_parent_id_idx" ON "solutions_blocks_intro_stats_stats" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_intro_stats_order_idx" ON "solutions_blocks_intro_stats" USING btree ("_order");
  CREATE INDEX "solutions_blocks_intro_stats_parent_id_idx" ON "solutions_blocks_intro_stats" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_intro_stats_path_idx" ON "solutions_blocks_intro_stats" USING btree ("_path");
  CREATE INDEX "solutions_blocks_solution_cards_order_idx" ON "solutions_blocks_solution_cards" USING btree ("_order");
  CREATE INDEX "solutions_blocks_solution_cards_parent_id_idx" ON "solutions_blocks_solution_cards" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_solution_cards_path_idx" ON "solutions_blocks_solution_cards" USING btree ("_path");
  CREATE INDEX "solutions_blocks_values_list_items_order_idx" ON "solutions_blocks_values_list_items" USING btree ("_order");
  CREATE INDEX "solutions_blocks_values_list_items_parent_id_idx" ON "solutions_blocks_values_list_items" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_values_list_order_idx" ON "solutions_blocks_values_list" USING btree ("_order");
  CREATE INDEX "solutions_blocks_values_list_parent_id_idx" ON "solutions_blocks_values_list" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_values_list_path_idx" ON "solutions_blocks_values_list" USING btree ("_path");
  CREATE INDEX "solutions_blocks_timeline_items_order_idx" ON "solutions_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "solutions_blocks_timeline_items_parent_id_idx" ON "solutions_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_timeline_order_idx" ON "solutions_blocks_timeline" USING btree ("_order");
  CREATE INDEX "solutions_blocks_timeline_parent_id_idx" ON "solutions_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_timeline_path_idx" ON "solutions_blocks_timeline" USING btree ("_path");
  CREATE INDEX "solutions_blocks_team_grid_order_idx" ON "solutions_blocks_team_grid" USING btree ("_order");
  CREATE INDEX "solutions_blocks_team_grid_parent_id_idx" ON "solutions_blocks_team_grid" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_team_grid_path_idx" ON "solutions_blocks_team_grid" USING btree ("_path");
  CREATE INDEX "solutions_blocks_team_grid_division_idx" ON "solutions_blocks_team_grid" USING btree ("division_id");
  CREATE INDEX "solutions_blocks_office_cards_order_idx" ON "solutions_blocks_office_cards" USING btree ("_order");
  CREATE INDEX "solutions_blocks_office_cards_parent_id_idx" ON "solutions_blocks_office_cards" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_office_cards_path_idx" ON "solutions_blocks_office_cards" USING btree ("_path");
  CREATE INDEX "solutions_blocks_award_list_order_idx" ON "solutions_blocks_award_list" USING btree ("_order");
  CREATE INDEX "solutions_blocks_award_list_parent_id_idx" ON "solutions_blocks_award_list" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_award_list_path_idx" ON "solutions_blocks_award_list" USING btree ("_path");
  CREATE INDEX "solutions_blocks_press_list_order_idx" ON "solutions_blocks_press_list" USING btree ("_order");
  CREATE INDEX "solutions_blocks_press_list_parent_id_idx" ON "solutions_blocks_press_list" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_press_list_path_idx" ON "solutions_blocks_press_list" USING btree ("_path");
  CREATE INDEX "solutions_blocks_insight_cards_order_idx" ON "solutions_blocks_insight_cards" USING btree ("_order");
  CREATE INDEX "solutions_blocks_insight_cards_parent_id_idx" ON "solutions_blocks_insight_cards" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_insight_cards_path_idx" ON "solutions_blocks_insight_cards" USING btree ("_path");
  CREATE INDEX "solutions_blocks_insight_cards_category_idx" ON "solutions_blocks_insight_cards" USING btree ("category_id");
  CREATE INDEX "solutions_blocks_insight_cards_solution_idx" ON "solutions_blocks_insight_cards" USING btree ("solution_id");
  CREATE INDEX "solutions_blocks_fund_facts_order_idx" ON "solutions_blocks_fund_facts" USING btree ("_order");
  CREATE INDEX "solutions_blocks_fund_facts_parent_id_idx" ON "solutions_blocks_fund_facts" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_fund_facts_path_idx" ON "solutions_blocks_fund_facts" USING btree ("_path");
  CREATE INDEX "solutions_blocks_fund_facts_fund_idx" ON "solutions_blocks_fund_facts" USING btree ("fund_id");
  CREATE INDEX "solutions_blocks_document_downloads_order_idx" ON "solutions_blocks_document_downloads" USING btree ("_order");
  CREATE INDEX "solutions_blocks_document_downloads_parent_id_idx" ON "solutions_blocks_document_downloads" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_document_downloads_path_idx" ON "solutions_blocks_document_downloads" USING btree ("_path");
  CREATE INDEX "solutions_blocks_quote_order_idx" ON "solutions_blocks_quote" USING btree ("_order");
  CREATE INDEX "solutions_blocks_quote_parent_id_idx" ON "solutions_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_quote_path_idx" ON "solutions_blocks_quote" USING btree ("_path");
  CREATE INDEX "solutions_blocks_quote_person_idx" ON "solutions_blocks_quote" USING btree ("person_id");
  CREATE INDEX "solutions_blocks_cta_band_order_idx" ON "solutions_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "solutions_blocks_cta_band_parent_id_idx" ON "solutions_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_cta_band_path_idx" ON "solutions_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "solutions_blocks_faq_items_order_idx" ON "solutions_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "solutions_blocks_faq_items_parent_id_idx" ON "solutions_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_faq_order_idx" ON "solutions_blocks_faq" USING btree ("_order");
  CREATE INDEX "solutions_blocks_faq_parent_id_idx" ON "solutions_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_faq_path_idx" ON "solutions_blocks_faq" USING btree ("_path");
  CREATE INDEX "solutions_blocks_contact_form_order_idx" ON "solutions_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "solutions_blocks_contact_form_parent_id_idx" ON "solutions_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_contact_form_path_idx" ON "solutions_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "solutions_blocks_contact_form_form_idx" ON "solutions_blocks_contact_form" USING btree ("form_id");
  CREATE INDEX "solutions_blocks_disclaimer_strip_order_idx" ON "solutions_blocks_disclaimer_strip" USING btree ("_order");
  CREATE INDEX "solutions_blocks_disclaimer_strip_parent_id_idx" ON "solutions_blocks_disclaimer_strip" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_disclaimer_strip_path_idx" ON "solutions_blocks_disclaimer_strip" USING btree ("_path");
  CREATE INDEX "solutions_blocks_related_links_links_order_idx" ON "solutions_blocks_related_links_links" USING btree ("_order");
  CREATE INDEX "solutions_blocks_related_links_links_parent_id_idx" ON "solutions_blocks_related_links_links" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_related_links_order_idx" ON "solutions_blocks_related_links" USING btree ("_order");
  CREATE INDEX "solutions_blocks_related_links_parent_id_idx" ON "solutions_blocks_related_links" USING btree ("_parent_id");
  CREATE INDEX "solutions_blocks_related_links_path_idx" ON "solutions_blocks_related_links" USING btree ("_path");
  CREATE INDEX "solutions_hero_image_idx" ON "solutions" USING btree ("hero_image_id");
  CREATE INDEX "solutions_contact_person_idx" ON "solutions" USING btree ("contact_person_id");
  CREATE UNIQUE INDEX "solutions_slug_idx" ON "solutions" USING btree ("slug");
  CREATE INDEX "solutions_updated_at_idx" ON "solutions" USING btree ("updated_at");
  CREATE INDEX "solutions_created_at_idx" ON "solutions" USING btree ("created_at");
  CREATE INDEX "solutions__status_idx" ON "solutions" USING btree ("_status");
  CREATE INDEX "solutions_meta_meta_image_idx" ON "solutions_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "solutions_locales_locale_parent_id_unique" ON "solutions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "solutions_locales_parent_id_idx" ON "solutions_locales" USING btree ("_parent_id");
  CREATE INDEX "solutions_rels_order_idx" ON "solutions_rels" USING btree ("order");
  CREATE INDEX "solutions_rels_parent_idx" ON "solutions_rels" USING btree ("parent_id");
  CREATE INDEX "solutions_rels_path_idx" ON "solutions_rels" USING btree ("path");
  CREATE INDEX "solutions_rels_pages_id_idx" ON "solutions_rels" USING btree ("pages_id");
  CREATE INDEX "solutions_rels_solutions_id_idx" ON "solutions_rels" USING btree ("solutions_id");
  CREATE INDEX "solutions_rels_funds_id_idx" ON "solutions_rels" USING btree ("funds_id");
  CREATE INDEX "solutions_rels_projects_id_idx" ON "solutions_rels" USING btree ("projects_id");
  CREATE INDEX "solutions_rels_people_id_idx" ON "solutions_rels" USING btree ("people_id");
  CREATE INDEX "solutions_rels_insights_id_idx" ON "solutions_rels" USING btree ("insights_id");
  CREATE INDEX "solutions_rels_categories_id_idx" ON "solutions_rels" USING btree ("categories_id");
  CREATE INDEX "solutions_rels_research_id_idx" ON "solutions_rels" USING btree ("research_id");
  CREATE INDEX "solutions_rels_jobs_id_idx" ON "solutions_rels" USING btree ("jobs_id");
  CREATE INDEX "solutions_rels_legal_documents_id_idx" ON "solutions_rels" USING btree ("legal_documents_id");
  CREATE INDEX "solutions_rels_documents_id_idx" ON "solutions_rels" USING btree ("documents_id");
  CREATE INDEX "_solutions_v_version_key_facts_order_idx" ON "_solutions_v_version_key_facts" USING btree ("_order");
  CREATE INDEX "_solutions_v_version_key_facts_parent_id_idx" ON "_solutions_v_version_key_facts" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_hero_ctas_order_idx" ON "_solutions_v_blocks_hero_ctas" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_hero_ctas_parent_id_idx" ON "_solutions_v_blocks_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_hero_order_idx" ON "_solutions_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_hero_parent_id_idx" ON "_solutions_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_hero_path_idx" ON "_solutions_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_hero_image_idx" ON "_solutions_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_solutions_v_blocks_rich_text_order_idx" ON "_solutions_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_rich_text_parent_id_idx" ON "_solutions_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_rich_text_path_idx" ON "_solutions_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_intro_stats_stats_order_idx" ON "_solutions_v_blocks_intro_stats_stats" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_intro_stats_stats_parent_id_idx" ON "_solutions_v_blocks_intro_stats_stats" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_intro_stats_order_idx" ON "_solutions_v_blocks_intro_stats" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_intro_stats_parent_id_idx" ON "_solutions_v_blocks_intro_stats" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_intro_stats_path_idx" ON "_solutions_v_blocks_intro_stats" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_solution_cards_order_idx" ON "_solutions_v_blocks_solution_cards" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_solution_cards_parent_id_idx" ON "_solutions_v_blocks_solution_cards" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_solution_cards_path_idx" ON "_solutions_v_blocks_solution_cards" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_values_list_items_order_idx" ON "_solutions_v_blocks_values_list_items" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_values_list_items_parent_id_idx" ON "_solutions_v_blocks_values_list_items" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_values_list_order_idx" ON "_solutions_v_blocks_values_list" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_values_list_parent_id_idx" ON "_solutions_v_blocks_values_list" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_values_list_path_idx" ON "_solutions_v_blocks_values_list" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_timeline_items_order_idx" ON "_solutions_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_timeline_items_parent_id_idx" ON "_solutions_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_timeline_order_idx" ON "_solutions_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_timeline_parent_id_idx" ON "_solutions_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_timeline_path_idx" ON "_solutions_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_team_grid_order_idx" ON "_solutions_v_blocks_team_grid" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_team_grid_parent_id_idx" ON "_solutions_v_blocks_team_grid" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_team_grid_path_idx" ON "_solutions_v_blocks_team_grid" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_team_grid_division_idx" ON "_solutions_v_blocks_team_grid" USING btree ("division_id");
  CREATE INDEX "_solutions_v_blocks_office_cards_order_idx" ON "_solutions_v_blocks_office_cards" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_office_cards_parent_id_idx" ON "_solutions_v_blocks_office_cards" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_office_cards_path_idx" ON "_solutions_v_blocks_office_cards" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_award_list_order_idx" ON "_solutions_v_blocks_award_list" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_award_list_parent_id_idx" ON "_solutions_v_blocks_award_list" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_award_list_path_idx" ON "_solutions_v_blocks_award_list" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_press_list_order_idx" ON "_solutions_v_blocks_press_list" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_press_list_parent_id_idx" ON "_solutions_v_blocks_press_list" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_press_list_path_idx" ON "_solutions_v_blocks_press_list" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_insight_cards_order_idx" ON "_solutions_v_blocks_insight_cards" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_insight_cards_parent_id_idx" ON "_solutions_v_blocks_insight_cards" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_insight_cards_path_idx" ON "_solutions_v_blocks_insight_cards" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_insight_cards_category_idx" ON "_solutions_v_blocks_insight_cards" USING btree ("category_id");
  CREATE INDEX "_solutions_v_blocks_insight_cards_solution_idx" ON "_solutions_v_blocks_insight_cards" USING btree ("solution_id");
  CREATE INDEX "_solutions_v_blocks_fund_facts_order_idx" ON "_solutions_v_blocks_fund_facts" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_fund_facts_parent_id_idx" ON "_solutions_v_blocks_fund_facts" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_fund_facts_path_idx" ON "_solutions_v_blocks_fund_facts" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_fund_facts_fund_idx" ON "_solutions_v_blocks_fund_facts" USING btree ("fund_id");
  CREATE INDEX "_solutions_v_blocks_document_downloads_order_idx" ON "_solutions_v_blocks_document_downloads" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_document_downloads_parent_id_idx" ON "_solutions_v_blocks_document_downloads" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_document_downloads_path_idx" ON "_solutions_v_blocks_document_downloads" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_quote_order_idx" ON "_solutions_v_blocks_quote" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_quote_parent_id_idx" ON "_solutions_v_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_quote_path_idx" ON "_solutions_v_blocks_quote" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_quote_person_idx" ON "_solutions_v_blocks_quote" USING btree ("person_id");
  CREATE INDEX "_solutions_v_blocks_cta_band_order_idx" ON "_solutions_v_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_cta_band_parent_id_idx" ON "_solutions_v_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_cta_band_path_idx" ON "_solutions_v_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_faq_items_order_idx" ON "_solutions_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_faq_items_parent_id_idx" ON "_solutions_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_faq_order_idx" ON "_solutions_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_faq_parent_id_idx" ON "_solutions_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_faq_path_idx" ON "_solutions_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_contact_form_order_idx" ON "_solutions_v_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_contact_form_parent_id_idx" ON "_solutions_v_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_contact_form_path_idx" ON "_solutions_v_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_contact_form_form_idx" ON "_solutions_v_blocks_contact_form" USING btree ("form_id");
  CREATE INDEX "_solutions_v_blocks_disclaimer_strip_order_idx" ON "_solutions_v_blocks_disclaimer_strip" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_disclaimer_strip_parent_id_idx" ON "_solutions_v_blocks_disclaimer_strip" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_disclaimer_strip_path_idx" ON "_solutions_v_blocks_disclaimer_strip" USING btree ("_path");
  CREATE INDEX "_solutions_v_blocks_related_links_links_order_idx" ON "_solutions_v_blocks_related_links_links" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_related_links_links_parent_id_idx" ON "_solutions_v_blocks_related_links_links" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_related_links_order_idx" ON "_solutions_v_blocks_related_links" USING btree ("_order");
  CREATE INDEX "_solutions_v_blocks_related_links_parent_id_idx" ON "_solutions_v_blocks_related_links" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_blocks_related_links_path_idx" ON "_solutions_v_blocks_related_links" USING btree ("_path");
  CREATE INDEX "_solutions_v_parent_idx" ON "_solutions_v" USING btree ("parent_id");
  CREATE INDEX "_solutions_v_version_version_hero_image_idx" ON "_solutions_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_solutions_v_version_version_contact_person_idx" ON "_solutions_v" USING btree ("version_contact_person_id");
  CREATE INDEX "_solutions_v_version_version_slug_idx" ON "_solutions_v" USING btree ("version_slug");
  CREATE INDEX "_solutions_v_version_version_updated_at_idx" ON "_solutions_v" USING btree ("version_updated_at");
  CREATE INDEX "_solutions_v_version_version_created_at_idx" ON "_solutions_v" USING btree ("version_created_at");
  CREATE INDEX "_solutions_v_version_version__status_idx" ON "_solutions_v" USING btree ("version__status");
  CREATE INDEX "_solutions_v_created_at_idx" ON "_solutions_v" USING btree ("created_at");
  CREATE INDEX "_solutions_v_updated_at_idx" ON "_solutions_v" USING btree ("updated_at");
  CREATE INDEX "_solutions_v_snapshot_idx" ON "_solutions_v" USING btree ("snapshot");
  CREATE INDEX "_solutions_v_published_locale_idx" ON "_solutions_v" USING btree ("published_locale");
  CREATE INDEX "_solutions_v_latest_idx" ON "_solutions_v" USING btree ("latest");
  CREATE INDEX "_solutions_v_autosave_idx" ON "_solutions_v" USING btree ("autosave");
  CREATE INDEX "_solutions_v_version_meta_version_meta_image_idx" ON "_solutions_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_solutions_v_locales_locale_parent_id_unique" ON "_solutions_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_solutions_v_locales_parent_id_idx" ON "_solutions_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_rels_order_idx" ON "_solutions_v_rels" USING btree ("order");
  CREATE INDEX "_solutions_v_rels_parent_idx" ON "_solutions_v_rels" USING btree ("parent_id");
  CREATE INDEX "_solutions_v_rels_path_idx" ON "_solutions_v_rels" USING btree ("path");
  CREATE INDEX "_solutions_v_rels_pages_id_idx" ON "_solutions_v_rels" USING btree ("pages_id");
  CREATE INDEX "_solutions_v_rels_solutions_id_idx" ON "_solutions_v_rels" USING btree ("solutions_id");
  CREATE INDEX "_solutions_v_rels_funds_id_idx" ON "_solutions_v_rels" USING btree ("funds_id");
  CREATE INDEX "_solutions_v_rels_projects_id_idx" ON "_solutions_v_rels" USING btree ("projects_id");
  CREATE INDEX "_solutions_v_rels_people_id_idx" ON "_solutions_v_rels" USING btree ("people_id");
  CREATE INDEX "_solutions_v_rels_insights_id_idx" ON "_solutions_v_rels" USING btree ("insights_id");
  CREATE INDEX "_solutions_v_rels_categories_id_idx" ON "_solutions_v_rels" USING btree ("categories_id");
  CREATE INDEX "_solutions_v_rels_research_id_idx" ON "_solutions_v_rels" USING btree ("research_id");
  CREATE INDEX "_solutions_v_rels_jobs_id_idx" ON "_solutions_v_rels" USING btree ("jobs_id");
  CREATE INDEX "_solutions_v_rels_legal_documents_id_idx" ON "_solutions_v_rels" USING btree ("legal_documents_id");
  CREATE INDEX "_solutions_v_rels_documents_id_idx" ON "_solutions_v_rels" USING btree ("documents_id");
  CREATE INDEX "funds_solution_idx" ON "funds" USING btree ("solution_id");
  CREATE INDEX "funds_factsheet_idx" ON "funds" USING btree ("factsheet_id");
  CREATE UNIQUE INDEX "funds_slug_idx" ON "funds" USING btree ("slug");
  CREATE INDEX "funds_updated_at_idx" ON "funds" USING btree ("updated_at");
  CREATE INDEX "funds_created_at_idx" ON "funds" USING btree ("created_at");
  CREATE INDEX "funds__status_idx" ON "funds" USING btree ("_status");
  CREATE INDEX "funds_meta_meta_image_idx" ON "funds_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "funds_locales_locale_parent_id_unique" ON "funds_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "funds_locales_parent_id_idx" ON "funds_locales" USING btree ("_parent_id");
  CREATE INDEX "funds_rels_order_idx" ON "funds_rels" USING btree ("order");
  CREATE INDEX "funds_rels_parent_idx" ON "funds_rels" USING btree ("parent_id");
  CREATE INDEX "funds_rels_path_idx" ON "funds_rels" USING btree ("path");
  CREATE INDEX "funds_rels_awards_id_idx" ON "funds_rels" USING btree ("awards_id");
  CREATE INDEX "_funds_v_parent_idx" ON "_funds_v" USING btree ("parent_id");
  CREATE INDEX "_funds_v_version_version_solution_idx" ON "_funds_v" USING btree ("version_solution_id");
  CREATE INDEX "_funds_v_version_version_factsheet_idx" ON "_funds_v" USING btree ("version_factsheet_id");
  CREATE INDEX "_funds_v_version_version_slug_idx" ON "_funds_v" USING btree ("version_slug");
  CREATE INDEX "_funds_v_version_version_updated_at_idx" ON "_funds_v" USING btree ("version_updated_at");
  CREATE INDEX "_funds_v_version_version_created_at_idx" ON "_funds_v" USING btree ("version_created_at");
  CREATE INDEX "_funds_v_version_version__status_idx" ON "_funds_v" USING btree ("version__status");
  CREATE INDEX "_funds_v_created_at_idx" ON "_funds_v" USING btree ("created_at");
  CREATE INDEX "_funds_v_updated_at_idx" ON "_funds_v" USING btree ("updated_at");
  CREATE INDEX "_funds_v_snapshot_idx" ON "_funds_v" USING btree ("snapshot");
  CREATE INDEX "_funds_v_published_locale_idx" ON "_funds_v" USING btree ("published_locale");
  CREATE INDEX "_funds_v_latest_idx" ON "_funds_v" USING btree ("latest");
  CREATE INDEX "_funds_v_autosave_idx" ON "_funds_v" USING btree ("autosave");
  CREATE INDEX "_funds_v_version_meta_version_meta_image_idx" ON "_funds_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_funds_v_locales_locale_parent_id_unique" ON "_funds_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_funds_v_locales_parent_id_idx" ON "_funds_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_funds_v_rels_order_idx" ON "_funds_v_rels" USING btree ("order");
  CREATE INDEX "_funds_v_rels_parent_idx" ON "_funds_v_rels" USING btree ("parent_id");
  CREATE INDEX "_funds_v_rels_path_idx" ON "_funds_v_rels" USING btree ("path");
  CREATE INDEX "_funds_v_rels_awards_id_idx" ON "_funds_v_rels" USING btree ("awards_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "projects_meta_meta_image_idx" ON "projects_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_locales_parent_id_idx" ON "projects_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_media_id_idx" ON "projects_rels" USING btree ("media_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE INDEX "_projects_v_version_meta_version_meta_image_idx" ON "_projects_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_locales_parent_id_idx" ON "_projects_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_media_id_idx" ON "_projects_v_rels" USING btree ("media_id");
  CREATE INDEX "people_division_idx" ON "people" USING btree ("division_id");
  CREATE INDEX "people_photo_idx" ON "people" USING btree ("photo_id");
  CREATE UNIQUE INDEX "people_slug_idx" ON "people" USING btree ("slug");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "people__status_idx" ON "people" USING btree ("_status");
  CREATE INDEX "people_meta_meta_image_idx" ON "people_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "people_locales_locale_parent_id_unique" ON "people_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "people_locales_parent_id_idx" ON "people_locales" USING btree ("_parent_id");
  CREATE INDEX "_people_v_parent_idx" ON "_people_v" USING btree ("parent_id");
  CREATE INDEX "_people_v_version_version_division_idx" ON "_people_v" USING btree ("version_division_id");
  CREATE INDEX "_people_v_version_version_photo_idx" ON "_people_v" USING btree ("version_photo_id");
  CREATE INDEX "_people_v_version_version_slug_idx" ON "_people_v" USING btree ("version_slug");
  CREATE INDEX "_people_v_version_version_updated_at_idx" ON "_people_v" USING btree ("version_updated_at");
  CREATE INDEX "_people_v_version_version_created_at_idx" ON "_people_v" USING btree ("version_created_at");
  CREATE INDEX "_people_v_version_version__status_idx" ON "_people_v" USING btree ("version__status");
  CREATE INDEX "_people_v_created_at_idx" ON "_people_v" USING btree ("created_at");
  CREATE INDEX "_people_v_updated_at_idx" ON "_people_v" USING btree ("updated_at");
  CREATE INDEX "_people_v_snapshot_idx" ON "_people_v" USING btree ("snapshot");
  CREATE INDEX "_people_v_published_locale_idx" ON "_people_v" USING btree ("published_locale");
  CREATE INDEX "_people_v_latest_idx" ON "_people_v" USING btree ("latest");
  CREATE INDEX "_people_v_autosave_idx" ON "_people_v" USING btree ("autosave");
  CREATE INDEX "_people_v_version_meta_version_meta_image_idx" ON "_people_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_people_v_locales_locale_parent_id_unique" ON "_people_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_people_v_locales_parent_id_idx" ON "_people_v_locales" USING btree ("_parent_id");
  CREATE INDEX "offices_address_lines_order_idx" ON "offices_address_lines" USING btree ("_order");
  CREATE INDEX "offices_address_lines_parent_id_idx" ON "offices_address_lines" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "offices_slug_idx" ON "offices" USING btree ("slug");
  CREATE INDEX "offices_country_slug_idx" ON "offices" USING btree ("country_slug");
  CREATE INDEX "offices_updated_at_idx" ON "offices" USING btree ("updated_at");
  CREATE INDEX "offices_created_at_idx" ON "offices" USING btree ("created_at");
  CREATE INDEX "offices__status_idx" ON "offices" USING btree ("_status");
  CREATE INDEX "_offices_v_version_address_lines_order_idx" ON "_offices_v_version_address_lines" USING btree ("_order");
  CREATE INDEX "_offices_v_version_address_lines_parent_id_idx" ON "_offices_v_version_address_lines" USING btree ("_parent_id");
  CREATE INDEX "_offices_v_parent_idx" ON "_offices_v" USING btree ("parent_id");
  CREATE INDEX "_offices_v_version_version_slug_idx" ON "_offices_v" USING btree ("version_slug");
  CREATE INDEX "_offices_v_version_version_country_slug_idx" ON "_offices_v" USING btree ("version_country_slug");
  CREATE INDEX "_offices_v_version_version_updated_at_idx" ON "_offices_v" USING btree ("version_updated_at");
  CREATE INDEX "_offices_v_version_version_created_at_idx" ON "_offices_v" USING btree ("version_created_at");
  CREATE INDEX "_offices_v_version_version__status_idx" ON "_offices_v" USING btree ("version__status");
  CREATE INDEX "_offices_v_created_at_idx" ON "_offices_v" USING btree ("created_at");
  CREATE INDEX "_offices_v_updated_at_idx" ON "_offices_v" USING btree ("updated_at");
  CREATE INDEX "_offices_v_snapshot_idx" ON "_offices_v" USING btree ("snapshot");
  CREATE INDEX "_offices_v_published_locale_idx" ON "_offices_v" USING btree ("published_locale");
  CREATE INDEX "_offices_v_latest_idx" ON "_offices_v" USING btree ("latest");
  CREATE INDEX "_offices_v_autosave_idx" ON "_offices_v" USING btree ("autosave");
  CREATE INDEX "awards_logo_idx" ON "awards" USING btree ("logo_id");
  CREATE INDEX "awards_fund_idx" ON "awards" USING btree ("fund_id");
  CREATE INDEX "awards_solution_idx" ON "awards" USING btree ("solution_id");
  CREATE INDEX "awards_updated_at_idx" ON "awards" USING btree ("updated_at");
  CREATE INDEX "awards_created_at_idx" ON "awards" USING btree ("created_at");
  CREATE INDEX "awards__status_idx" ON "awards" USING btree ("_status");
  CREATE INDEX "_awards_v_parent_idx" ON "_awards_v" USING btree ("parent_id");
  CREATE INDEX "_awards_v_version_version_logo_idx" ON "_awards_v" USING btree ("version_logo_id");
  CREATE INDEX "_awards_v_version_version_fund_idx" ON "_awards_v" USING btree ("version_fund_id");
  CREATE INDEX "_awards_v_version_version_solution_idx" ON "_awards_v" USING btree ("version_solution_id");
  CREATE INDEX "_awards_v_version_version_updated_at_idx" ON "_awards_v" USING btree ("version_updated_at");
  CREATE INDEX "_awards_v_version_version_created_at_idx" ON "_awards_v" USING btree ("version_created_at");
  CREATE INDEX "_awards_v_version_version__status_idx" ON "_awards_v" USING btree ("version__status");
  CREATE INDEX "_awards_v_created_at_idx" ON "_awards_v" USING btree ("created_at");
  CREATE INDEX "_awards_v_updated_at_idx" ON "_awards_v" USING btree ("updated_at");
  CREATE INDEX "_awards_v_snapshot_idx" ON "_awards_v" USING btree ("snapshot");
  CREATE INDEX "_awards_v_published_locale_idx" ON "_awards_v" USING btree ("published_locale");
  CREATE INDEX "_awards_v_latest_idx" ON "_awards_v" USING btree ("latest");
  CREATE INDEX "_awards_v_autosave_idx" ON "_awards_v" USING btree ("autosave");
  CREATE INDEX "jobs_location_idx" ON "jobs" USING btree ("location_id");
  CREATE UNIQUE INDEX "jobs_slug_idx" ON "jobs" USING btree ("slug");
  CREATE INDEX "jobs_updated_at_idx" ON "jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");
  CREATE INDEX "jobs__status_idx" ON "jobs" USING btree ("_status");
  CREATE INDEX "jobs_meta_meta_image_idx" ON "jobs_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "jobs_locales_locale_parent_id_unique" ON "jobs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "jobs_locales_parent_id_idx" ON "jobs_locales" USING btree ("_parent_id");
  CREATE INDEX "_jobs_v_parent_idx" ON "_jobs_v" USING btree ("parent_id");
  CREATE INDEX "_jobs_v_version_version_location_idx" ON "_jobs_v" USING btree ("version_location_id");
  CREATE INDEX "_jobs_v_version_version_slug_idx" ON "_jobs_v" USING btree ("version_slug");
  CREATE INDEX "_jobs_v_version_version_updated_at_idx" ON "_jobs_v" USING btree ("version_updated_at");
  CREATE INDEX "_jobs_v_version_version_created_at_idx" ON "_jobs_v" USING btree ("version_created_at");
  CREATE INDEX "_jobs_v_version_version__status_idx" ON "_jobs_v" USING btree ("version__status");
  CREATE INDEX "_jobs_v_created_at_idx" ON "_jobs_v" USING btree ("created_at");
  CREATE INDEX "_jobs_v_updated_at_idx" ON "_jobs_v" USING btree ("updated_at");
  CREATE INDEX "_jobs_v_snapshot_idx" ON "_jobs_v" USING btree ("snapshot");
  CREATE INDEX "_jobs_v_published_locale_idx" ON "_jobs_v" USING btree ("published_locale");
  CREATE INDEX "_jobs_v_latest_idx" ON "_jobs_v" USING btree ("latest");
  CREATE INDEX "_jobs_v_autosave_idx" ON "_jobs_v" USING btree ("autosave");
  CREATE INDEX "_jobs_v_version_meta_version_meta_image_idx" ON "_jobs_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_jobs_v_locales_locale_parent_id_unique" ON "_jobs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_jobs_v_locales_parent_id_idx" ON "_jobs_v_locales" USING btree ("_parent_id");
  CREATE INDEX "insights_hero_image_idx" ON "insights" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "insights_slug_idx" ON "insights" USING btree ("slug");
  CREATE INDEX "insights_author_idx" ON "insights" USING btree ("author_id");
  CREATE INDEX "insights_category_idx" ON "insights" USING btree ("category_id");
  CREATE INDEX "insights_updated_at_idx" ON "insights" USING btree ("updated_at");
  CREATE INDEX "insights_created_at_idx" ON "insights" USING btree ("created_at");
  CREATE INDEX "insights__status_idx" ON "insights" USING btree ("_status");
  CREATE INDEX "insights_meta_meta_image_idx" ON "insights_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "insights_locales_locale_parent_id_unique" ON "insights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "insights_locales_parent_id_idx" ON "insights_locales" USING btree ("_parent_id");
  CREATE INDEX "insights_rels_order_idx" ON "insights_rels" USING btree ("order");
  CREATE INDEX "insights_rels_parent_idx" ON "insights_rels" USING btree ("parent_id");
  CREATE INDEX "insights_rels_path_idx" ON "insights_rels" USING btree ("path");
  CREATE INDEX "insights_rels_solutions_id_idx" ON "insights_rels" USING btree ("solutions_id");
  CREATE INDEX "_insights_v_parent_idx" ON "_insights_v" USING btree ("parent_id");
  CREATE INDEX "_insights_v_version_version_hero_image_idx" ON "_insights_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_insights_v_version_version_slug_idx" ON "_insights_v" USING btree ("version_slug");
  CREATE INDEX "_insights_v_version_version_author_idx" ON "_insights_v" USING btree ("version_author_id");
  CREATE INDEX "_insights_v_version_version_category_idx" ON "_insights_v" USING btree ("version_category_id");
  CREATE INDEX "_insights_v_version_version_updated_at_idx" ON "_insights_v" USING btree ("version_updated_at");
  CREATE INDEX "_insights_v_version_version_created_at_idx" ON "_insights_v" USING btree ("version_created_at");
  CREATE INDEX "_insights_v_version_version__status_idx" ON "_insights_v" USING btree ("version__status");
  CREATE INDEX "_insights_v_created_at_idx" ON "_insights_v" USING btree ("created_at");
  CREATE INDEX "_insights_v_updated_at_idx" ON "_insights_v" USING btree ("updated_at");
  CREATE INDEX "_insights_v_snapshot_idx" ON "_insights_v" USING btree ("snapshot");
  CREATE INDEX "_insights_v_published_locale_idx" ON "_insights_v" USING btree ("published_locale");
  CREATE INDEX "_insights_v_latest_idx" ON "_insights_v" USING btree ("latest");
  CREATE INDEX "_insights_v_autosave_idx" ON "_insights_v" USING btree ("autosave");
  CREATE INDEX "_insights_v_version_meta_version_meta_image_idx" ON "_insights_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_insights_v_locales_locale_parent_id_unique" ON "_insights_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_insights_v_locales_parent_id_idx" ON "_insights_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_insights_v_rels_order_idx" ON "_insights_v_rels" USING btree ("order");
  CREATE INDEX "_insights_v_rels_parent_idx" ON "_insights_v_rels" USING btree ("parent_id");
  CREATE INDEX "_insights_v_rels_path_idx" ON "_insights_v_rels" USING btree ("path");
  CREATE INDEX "_insights_v_rels_solutions_id_idx" ON "_insights_v_rels" USING btree ("solutions_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "categories__status_idx" ON "categories" USING btree ("_status");
  CREATE INDEX "categories_meta_meta_image_idx" ON "categories_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_locales_parent_id_idx" ON "categories_locales" USING btree ("_parent_id");
  CREATE INDEX "_categories_v_parent_idx" ON "_categories_v" USING btree ("parent_id");
  CREATE INDEX "_categories_v_version_version_slug_idx" ON "_categories_v" USING btree ("version_slug");
  CREATE INDEX "_categories_v_version_version_updated_at_idx" ON "_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_categories_v_version_version_created_at_idx" ON "_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_categories_v_version_version__status_idx" ON "_categories_v" USING btree ("version__status");
  CREATE INDEX "_categories_v_created_at_idx" ON "_categories_v" USING btree ("created_at");
  CREATE INDEX "_categories_v_updated_at_idx" ON "_categories_v" USING btree ("updated_at");
  CREATE INDEX "_categories_v_snapshot_idx" ON "_categories_v" USING btree ("snapshot");
  CREATE INDEX "_categories_v_published_locale_idx" ON "_categories_v" USING btree ("published_locale");
  CREATE INDEX "_categories_v_latest_idx" ON "_categories_v" USING btree ("latest");
  CREATE INDEX "_categories_v_autosave_idx" ON "_categories_v" USING btree ("autosave");
  CREATE INDEX "_categories_v_version_meta_version_meta_image_idx" ON "_categories_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_categories_v_locales_locale_parent_id_unique" ON "_categories_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_categories_v_locales_parent_id_idx" ON "_categories_v_locales" USING btree ("_parent_id");
  CREATE INDEX "press_mentions_thumbnail_idx" ON "press_mentions" USING btree ("thumbnail_id");
  CREATE INDEX "press_mentions_updated_at_idx" ON "press_mentions" USING btree ("updated_at");
  CREATE INDEX "press_mentions_created_at_idx" ON "press_mentions" USING btree ("created_at");
  CREATE INDEX "press_mentions__status_idx" ON "press_mentions" USING btree ("_status");
  CREATE INDEX "press_mentions_rels_order_idx" ON "press_mentions_rels" USING btree ("order");
  CREATE INDEX "press_mentions_rels_parent_idx" ON "press_mentions_rels" USING btree ("parent_id");
  CREATE INDEX "press_mentions_rels_path_idx" ON "press_mentions_rels" USING btree ("path");
  CREATE INDEX "press_mentions_rels_people_id_idx" ON "press_mentions_rels" USING btree ("people_id");
  CREATE INDEX "_press_mentions_v_parent_idx" ON "_press_mentions_v" USING btree ("parent_id");
  CREATE INDEX "_press_mentions_v_version_version_thumbnail_idx" ON "_press_mentions_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_press_mentions_v_version_version_updated_at_idx" ON "_press_mentions_v" USING btree ("version_updated_at");
  CREATE INDEX "_press_mentions_v_version_version_created_at_idx" ON "_press_mentions_v" USING btree ("version_created_at");
  CREATE INDEX "_press_mentions_v_version_version__status_idx" ON "_press_mentions_v" USING btree ("version__status");
  CREATE INDEX "_press_mentions_v_created_at_idx" ON "_press_mentions_v" USING btree ("created_at");
  CREATE INDEX "_press_mentions_v_updated_at_idx" ON "_press_mentions_v" USING btree ("updated_at");
  CREATE INDEX "_press_mentions_v_snapshot_idx" ON "_press_mentions_v" USING btree ("snapshot");
  CREATE INDEX "_press_mentions_v_published_locale_idx" ON "_press_mentions_v" USING btree ("published_locale");
  CREATE INDEX "_press_mentions_v_latest_idx" ON "_press_mentions_v" USING btree ("latest");
  CREATE INDEX "_press_mentions_v_autosave_idx" ON "_press_mentions_v" USING btree ("autosave");
  CREATE INDEX "_press_mentions_v_rels_order_idx" ON "_press_mentions_v_rels" USING btree ("order");
  CREATE INDEX "_press_mentions_v_rels_parent_idx" ON "_press_mentions_v_rels" USING btree ("parent_id");
  CREATE INDEX "_press_mentions_v_rels_path_idx" ON "_press_mentions_v_rels" USING btree ("path");
  CREATE INDEX "_press_mentions_v_rels_people_id_idx" ON "_press_mentions_v_rels" USING btree ("people_id");
  CREATE INDEX "research_key_findings_order_idx" ON "research_key_findings" USING btree ("_order");
  CREATE INDEX "research_key_findings_parent_id_idx" ON "research_key_findings" USING btree ("_parent_id");
  CREATE INDEX "research_report_idx" ON "research" USING btree ("report_id");
  CREATE UNIQUE INDEX "research_slug_idx" ON "research" USING btree ("slug");
  CREATE INDEX "research_updated_at_idx" ON "research" USING btree ("updated_at");
  CREATE INDEX "research_created_at_idx" ON "research" USING btree ("created_at");
  CREATE INDEX "research__status_idx" ON "research" USING btree ("_status");
  CREATE INDEX "research_meta_meta_image_idx" ON "research_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "research_locales_locale_parent_id_unique" ON "research_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "research_locales_parent_id_idx" ON "research_locales" USING btree ("_parent_id");
  CREATE INDEX "_research_v_version_key_findings_order_idx" ON "_research_v_version_key_findings" USING btree ("_order");
  CREATE INDEX "_research_v_version_key_findings_parent_id_idx" ON "_research_v_version_key_findings" USING btree ("_parent_id");
  CREATE INDEX "_research_v_parent_idx" ON "_research_v" USING btree ("parent_id");
  CREATE INDEX "_research_v_version_version_report_idx" ON "_research_v" USING btree ("version_report_id");
  CREATE INDEX "_research_v_version_version_slug_idx" ON "_research_v" USING btree ("version_slug");
  CREATE INDEX "_research_v_version_version_updated_at_idx" ON "_research_v" USING btree ("version_updated_at");
  CREATE INDEX "_research_v_version_version_created_at_idx" ON "_research_v" USING btree ("version_created_at");
  CREATE INDEX "_research_v_version_version__status_idx" ON "_research_v" USING btree ("version__status");
  CREATE INDEX "_research_v_created_at_idx" ON "_research_v" USING btree ("created_at");
  CREATE INDEX "_research_v_updated_at_idx" ON "_research_v" USING btree ("updated_at");
  CREATE INDEX "_research_v_snapshot_idx" ON "_research_v" USING btree ("snapshot");
  CREATE INDEX "_research_v_published_locale_idx" ON "_research_v" USING btree ("published_locale");
  CREATE INDEX "_research_v_latest_idx" ON "_research_v" USING btree ("latest");
  CREATE INDEX "_research_v_autosave_idx" ON "_research_v" USING btree ("autosave");
  CREATE INDEX "_research_v_version_meta_version_meta_image_idx" ON "_research_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_research_v_locales_locale_parent_id_unique" ON "_research_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_research_v_locales_parent_id_idx" ON "_research_v_locales" USING btree ("_parent_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE INDEX "legal_documents_file_idx" ON "legal_documents" USING btree ("file_id");
  CREATE UNIQUE INDEX "legal_documents_slug_idx" ON "legal_documents" USING btree ("slug");
  CREATE INDEX "legal_documents_updated_at_idx" ON "legal_documents" USING btree ("updated_at");
  CREATE INDEX "legal_documents_created_at_idx" ON "legal_documents" USING btree ("created_at");
  CREATE INDEX "legal_documents__status_idx" ON "legal_documents" USING btree ("_status");
  CREATE INDEX "legal_documents_meta_meta_image_idx" ON "legal_documents_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "legal_documents_locales_locale_parent_id_unique" ON "legal_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "legal_documents_locales_parent_id_idx" ON "legal_documents_locales" USING btree ("_parent_id");
  CREATE INDEX "_legal_documents_v_parent_idx" ON "_legal_documents_v" USING btree ("parent_id");
  CREATE INDEX "_legal_documents_v_version_version_file_idx" ON "_legal_documents_v" USING btree ("version_file_id");
  CREATE INDEX "_legal_documents_v_version_version_slug_idx" ON "_legal_documents_v" USING btree ("version_slug");
  CREATE INDEX "_legal_documents_v_version_version_updated_at_idx" ON "_legal_documents_v" USING btree ("version_updated_at");
  CREATE INDEX "_legal_documents_v_version_version_created_at_idx" ON "_legal_documents_v" USING btree ("version_created_at");
  CREATE INDEX "_legal_documents_v_version_version__status_idx" ON "_legal_documents_v" USING btree ("version__status");
  CREATE INDEX "_legal_documents_v_created_at_idx" ON "_legal_documents_v" USING btree ("created_at");
  CREATE INDEX "_legal_documents_v_updated_at_idx" ON "_legal_documents_v" USING btree ("updated_at");
  CREATE INDEX "_legal_documents_v_snapshot_idx" ON "_legal_documents_v" USING btree ("snapshot");
  CREATE INDEX "_legal_documents_v_published_locale_idx" ON "_legal_documents_v" USING btree ("published_locale");
  CREATE INDEX "_legal_documents_v_latest_idx" ON "_legal_documents_v" USING btree ("latest");
  CREATE INDEX "_legal_documents_v_autosave_idx" ON "_legal_documents_v" USING btree ("autosave");
  CREATE INDEX "_legal_documents_v_version_meta_version_meta_image_idx" ON "_legal_documents_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_legal_documents_v_locales_locale_parent_id_unique" ON "_legal_documents_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_legal_documents_v_locales_parent_id_idx" ON "_legal_documents_v_locales" USING btree ("_parent_id");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "ai_changesets_affected_docs_order_idx" ON "ai_changesets_affected_docs" USING btree ("_order");
  CREATE INDEX "ai_changesets_affected_docs_parent_id_idx" ON "ai_changesets_affected_docs" USING btree ("_parent_id");
  CREATE INDEX "ai_changesets_flags_order_idx" ON "ai_changesets_flags" USING btree ("_order");
  CREATE INDEX "ai_changesets_flags_parent_id_idx" ON "ai_changesets_flags" USING btree ("_parent_id");
  CREATE INDEX "ai_changesets_user_idx" ON "ai_changesets" USING btree ("user_id");
  CREATE INDEX "ai_changesets_updated_at_idx" ON "ai_changesets" USING btree ("updated_at");
  CREATE INDEX "ai_changesets_created_at_idx" ON "ai_changesets" USING btree ("created_at");
  CREATE INDEX "audit_log_collection_idx" ON "audit_log" USING btree ("collection");
  CREATE INDEX "audit_log_doc_id_idx" ON "audit_log" USING btree ("doc_id");
  CREATE INDEX "audit_log_user_idx" ON "audit_log" USING btree ("user_id");
  CREATE INDEX "audit_log_changeset_id_idx" ON "audit_log" USING btree ("changeset_id_id");
  CREATE INDEX "audit_log_timestamp_idx" ON "audit_log" USING btree ("timestamp");
  CREATE INDEX "audit_log_updated_at_idx" ON "audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_solutions_id_idx" ON "redirects_rels" USING btree ("solutions_id");
  CREATE INDEX "redirects_rels_funds_id_idx" ON "redirects_rels" USING btree ("funds_id");
  CREATE INDEX "redirects_rels_projects_id_idx" ON "redirects_rels" USING btree ("projects_id");
  CREATE INDEX "redirects_rels_people_id_idx" ON "redirects_rels" USING btree ("people_id");
  CREATE INDEX "redirects_rels_insights_id_idx" ON "redirects_rels" USING btree ("insights_id");
  CREATE INDEX "redirects_rels_categories_id_idx" ON "redirects_rels" USING btree ("categories_id");
  CREATE INDEX "redirects_rels_research_id_idx" ON "redirects_rels" USING btree ("research_id");
  CREATE INDEX "redirects_rels_jobs_id_idx" ON "redirects_rels" USING btree ("jobs_id");
  CREATE INDEX "redirects_rels_legal_documents_id_idx" ON "redirects_rels" USING btree ("legal_documents_id");
  CREATE INDEX "forms_blocks_checkbox_order_idx" ON "forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX "forms_blocks_checkbox_parent_id_idx" ON "forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_checkbox_path_idx" ON "forms_blocks_checkbox" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_checkbox_locales_locale_parent_id_unique" ON "forms_blocks_checkbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_checkbox_locales_parent_id_idx" ON "forms_blocks_checkbox_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_order_idx" ON "forms_blocks_email" USING btree ("_order");
  CREATE INDEX "forms_blocks_email_parent_id_idx" ON "forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_path_idx" ON "forms_blocks_email" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_email_locales_locale_parent_id_unique" ON "forms_blocks_email_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_email_locales_parent_id_idx" ON "forms_blocks_email_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_order_idx" ON "forms_blocks_message" USING btree ("_order");
  CREATE INDEX "forms_blocks_message_parent_id_idx" ON "forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_path_idx" ON "forms_blocks_message" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_message_locales_locale_parent_id_unique" ON "forms_blocks_message_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_message_locales_parent_id_idx" ON "forms_blocks_message_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_options_order_idx" ON "forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_options_parent_id_idx" ON "forms_blocks_select_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_select_options_locales_locale_parent_id_unique" ON "forms_blocks_select_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_select_options_locales_parent_id_idx" ON "forms_blocks_select_options_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_order_idx" ON "forms_blocks_select" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_parent_id_idx" ON "forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_path_idx" ON "forms_blocks_select" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_select_locales_locale_parent_id_unique" ON "forms_blocks_select_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_select_locales_parent_id_idx" ON "forms_blocks_select_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_order_idx" ON "forms_blocks_text" USING btree ("_order");
  CREATE INDEX "forms_blocks_text_parent_id_idx" ON "forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_path_idx" ON "forms_blocks_text" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_text_locales_locale_parent_id_unique" ON "forms_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_text_locales_parent_id_idx" ON "forms_blocks_text_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_order_idx" ON "forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX "forms_blocks_textarea_parent_id_idx" ON "forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_path_idx" ON "forms_blocks_textarea" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_textarea_locales_locale_parent_id_unique" ON "forms_blocks_textarea_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_textarea_locales_parent_id_idx" ON "forms_blocks_textarea_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_emails_order_idx" ON "forms_emails" USING btree ("_order");
  CREATE INDEX "forms_emails_parent_id_idx" ON "forms_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_emails_locales_locale_parent_id_unique" ON "forms_emails_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_emails_locales_parent_id_idx" ON "forms_emails_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE UNIQUE INDEX "forms_locales_locale_parent_id_unique" ON "forms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_locales_parent_id_idx" ON "forms_locales" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_submission_data_order_idx" ON "form_submissions_submission_data" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_data_parent_id_idx" ON "form_submissions_submission_data" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "header_nav_items_children_order_idx" ON "header_nav_items_children" USING btree ("_order");
  CREATE INDEX "header_nav_items_children_parent_id_idx" ON "header_nav_items_children" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_solutions_id_idx" ON "header_rels" USING btree ("solutions_id");
  CREATE INDEX "header_rels_funds_id_idx" ON "header_rels" USING btree ("funds_id");
  CREATE INDEX "header_rels_projects_id_idx" ON "header_rels" USING btree ("projects_id");
  CREATE INDEX "header_rels_people_id_idx" ON "header_rels" USING btree ("people_id");
  CREATE INDEX "header_rels_insights_id_idx" ON "header_rels" USING btree ("insights_id");
  CREATE INDEX "header_rels_categories_id_idx" ON "header_rels" USING btree ("categories_id");
  CREATE INDEX "header_rels_research_id_idx" ON "header_rels" USING btree ("research_id");
  CREATE INDEX "header_rels_jobs_id_idx" ON "header_rels" USING btree ("jobs_id");
  CREATE INDEX "header_rels_legal_documents_id_idx" ON "header_rels" USING btree ("legal_documents_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "footer_social_links_order_idx" ON "footer_social_links" USING btree ("_order");
  CREATE INDEX "footer_social_links_parent_id_idx" ON "footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_solutions_id_idx" ON "footer_rels" USING btree ("solutions_id");
  CREATE INDEX "footer_rels_funds_id_idx" ON "footer_rels" USING btree ("funds_id");
  CREATE INDEX "footer_rels_projects_id_idx" ON "footer_rels" USING btree ("projects_id");
  CREATE INDEX "footer_rels_people_id_idx" ON "footer_rels" USING btree ("people_id");
  CREATE INDEX "footer_rels_insights_id_idx" ON "footer_rels" USING btree ("insights_id");
  CREATE INDEX "footer_rels_categories_id_idx" ON "footer_rels" USING btree ("categories_id");
  CREATE INDEX "footer_rels_research_id_idx" ON "footer_rels" USING btree ("research_id");
  CREATE INDEX "footer_rels_jobs_id_idx" ON "footer_rels" USING btree ("jobs_id");
  CREATE INDEX "footer_rels_legal_documents_id_idx" ON "footer_rels" USING btree ("legal_documents_id");
  CREATE INDEX "footer_rels_offices_id_idx" ON "footer_rels" USING btree ("offices_id");
  CREATE INDEX "site_settings_organization_same_as_order_idx" ON "site_settings_organization_same_as" USING btree ("_order");
  CREATE INDEX "site_settings_organization_same_as_parent_id_idx" ON "site_settings_organization_same_as" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_default_og_image_idx" ON "site_settings" USING btree ("default_og_image_id");
  CREATE INDEX "ai_settings_regulated_phrases_order_idx" ON "ai_settings_regulated_phrases" USING btree ("_order");
  CREATE INDEX "ai_settings_regulated_phrases_parent_id_idx" ON "ai_settings_regulated_phrases" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_funds_fk" FOREIGN KEY ("funds_id") REFERENCES "public"."funds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offices_fk" FOREIGN KEY ("offices_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_awards_fk" FOREIGN KEY ("awards_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_press_mentions_fk" FOREIGN KEY ("press_mentions_id") REFERENCES "public"."press_mentions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_research_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_documents_fk" FOREIGN KEY ("legal_documents_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ai_changesets_fk" FOREIGN KEY ("ai_changesets_id") REFERENCES "public"."ai_changesets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_sizes_w400_sizes_w400_filename_idx" ON "media" USING btree ("sizes_w400_filename");
  CREATE INDEX "media_sizes_w800_sizes_w800_filename_idx" ON "media" USING btree ("sizes_w800_filename");
  CREATE INDEX "media_sizes_w1200_sizes_w1200_filename_idx" ON "media" USING btree ("sizes_w1200_filename");
  CREATE INDEX "media_sizes_w1600_sizes_w1600_filename_idx" ON "media" USING btree ("sizes_w1600_filename");
  CREATE INDEX "media_sizes_w2400_sizes_w2400_filename_idx" ON "media" USING btree ("sizes_w2400_filename");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_solutions_id_idx" ON "payload_locked_documents_rels" USING btree ("solutions_id");
  CREATE INDEX "payload_locked_documents_rels_funds_id_idx" ON "payload_locked_documents_rels" USING btree ("funds_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_offices_id_idx" ON "payload_locked_documents_rels" USING btree ("offices_id");
  CREATE INDEX "payload_locked_documents_rels_awards_id_idx" ON "payload_locked_documents_rels" USING btree ("awards_id");
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("jobs_id");
  CREATE INDEX "payload_locked_documents_rels_insights_id_idx" ON "payload_locked_documents_rels" USING btree ("insights_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_press_mentions_id_idx" ON "payload_locked_documents_rels" USING btree ("press_mentions_id");
  CREATE INDEX "payload_locked_documents_rels_research_id_idx" ON "payload_locked_documents_rels" USING btree ("research_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_legal_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("legal_documents_id");
  CREATE INDEX "payload_locked_documents_rels_ai_changesets_id_idx" ON "payload_locked_documents_rels" USING btree ("ai_changesets_id");
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_log_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_hero_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_intro_stats_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_intro_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_solution_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_values_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_values_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_team_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_office_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_award_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_press_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_insight_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_fund_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_document_downloads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_disclaimer_strip" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_related_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_related_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_intro_stats_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_intro_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_solution_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_values_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_values_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_team_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_office_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_award_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_press_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_insight_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_fund_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_document_downloads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_disclaimer_strip" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_related_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_related_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_key_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_hero_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_intro_stats_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_intro_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_solution_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_values_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_values_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_team_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_office_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_award_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_press_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_insight_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_fund_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_document_downloads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_contact_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_disclaimer_strip" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_related_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_blocks_related_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_version_key_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_hero_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_intro_stats_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_intro_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_solution_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_values_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_values_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_team_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_office_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_award_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_press_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_insight_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_fund_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_document_downloads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_contact_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_disclaimer_strip" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_related_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_blocks_related_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "funds" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "funds_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "funds_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_funds_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_funds_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_funds_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_people_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_people_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offices_address_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_offices_v_version_address_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_offices_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "awards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_awards_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "jobs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insights_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insights_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insights_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insights_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insights_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_categories_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_categories_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "press_mentions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "press_mentions_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_press_mentions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_press_mentions_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "research_key_findings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "research" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "research_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_research_v_version_key_findings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_research_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_research_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "legal_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "legal_documents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_legal_documents_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_legal_documents_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ai_changesets_affected_docs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ai_changesets_flags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ai_changesets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audit_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_checkbox" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_checkbox_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_email" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_email_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_message" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_message_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_select_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_select_options_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_select" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_select_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_textarea" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_textarea_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_emails" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_emails_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "form_submissions_submission_data" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "form_submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_nav_items_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_organization_same_as" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ai_settings_regulated_phrases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ai_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_hero_ctas" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_intro_stats_stats" CASCADE;
  DROP TABLE "pages_blocks_intro_stats" CASCADE;
  DROP TABLE "pages_blocks_solution_cards" CASCADE;
  DROP TABLE "pages_blocks_values_list_items" CASCADE;
  DROP TABLE "pages_blocks_values_list" CASCADE;
  DROP TABLE "pages_blocks_timeline_items" CASCADE;
  DROP TABLE "pages_blocks_timeline" CASCADE;
  DROP TABLE "pages_blocks_team_grid" CASCADE;
  DROP TABLE "pages_blocks_office_cards" CASCADE;
  DROP TABLE "pages_blocks_award_list" CASCADE;
  DROP TABLE "pages_blocks_press_list" CASCADE;
  DROP TABLE "pages_blocks_insight_cards" CASCADE;
  DROP TABLE "pages_blocks_fund_facts" CASCADE;
  DROP TABLE "pages_blocks_document_downloads" CASCADE;
  DROP TABLE "pages_blocks_quote" CASCADE;
  DROP TABLE "pages_blocks_cta_band" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_contact_form" CASCADE;
  DROP TABLE "pages_blocks_disclaimer_strip" CASCADE;
  DROP TABLE "pages_blocks_related_links_links" CASCADE;
  DROP TABLE "pages_blocks_related_links" CASCADE;
  DROP TABLE "pages_breadcrumbs" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_ctas" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_intro_stats_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_intro_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_solution_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_values_list_items" CASCADE;
  DROP TABLE "_pages_v_blocks_values_list" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline" CASCADE;
  DROP TABLE "_pages_v_blocks_team_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_office_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_award_list" CASCADE;
  DROP TABLE "_pages_v_blocks_press_list" CASCADE;
  DROP TABLE "_pages_v_blocks_insight_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_fund_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_document_downloads" CASCADE;
  DROP TABLE "_pages_v_blocks_quote" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_band" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_form" CASCADE;
  DROP TABLE "_pages_v_blocks_disclaimer_strip" CASCADE;
  DROP TABLE "_pages_v_blocks_related_links_links" CASCADE;
  DROP TABLE "_pages_v_blocks_related_links" CASCADE;
  DROP TABLE "_pages_v_version_breadcrumbs" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "solutions_key_facts" CASCADE;
  DROP TABLE "solutions_blocks_hero_ctas" CASCADE;
  DROP TABLE "solutions_blocks_hero" CASCADE;
  DROP TABLE "solutions_blocks_rich_text" CASCADE;
  DROP TABLE "solutions_blocks_intro_stats_stats" CASCADE;
  DROP TABLE "solutions_blocks_intro_stats" CASCADE;
  DROP TABLE "solutions_blocks_solution_cards" CASCADE;
  DROP TABLE "solutions_blocks_values_list_items" CASCADE;
  DROP TABLE "solutions_blocks_values_list" CASCADE;
  DROP TABLE "solutions_blocks_timeline_items" CASCADE;
  DROP TABLE "solutions_blocks_timeline" CASCADE;
  DROP TABLE "solutions_blocks_team_grid" CASCADE;
  DROP TABLE "solutions_blocks_office_cards" CASCADE;
  DROP TABLE "solutions_blocks_award_list" CASCADE;
  DROP TABLE "solutions_blocks_press_list" CASCADE;
  DROP TABLE "solutions_blocks_insight_cards" CASCADE;
  DROP TABLE "solutions_blocks_fund_facts" CASCADE;
  DROP TABLE "solutions_blocks_document_downloads" CASCADE;
  DROP TABLE "solutions_blocks_quote" CASCADE;
  DROP TABLE "solutions_blocks_cta_band" CASCADE;
  DROP TABLE "solutions_blocks_faq_items" CASCADE;
  DROP TABLE "solutions_blocks_faq" CASCADE;
  DROP TABLE "solutions_blocks_contact_form" CASCADE;
  DROP TABLE "solutions_blocks_disclaimer_strip" CASCADE;
  DROP TABLE "solutions_blocks_related_links_links" CASCADE;
  DROP TABLE "solutions_blocks_related_links" CASCADE;
  DROP TABLE "solutions" CASCADE;
  DROP TABLE "solutions_locales" CASCADE;
  DROP TABLE "solutions_rels" CASCADE;
  DROP TABLE "_solutions_v_version_key_facts" CASCADE;
  DROP TABLE "_solutions_v_blocks_hero_ctas" CASCADE;
  DROP TABLE "_solutions_v_blocks_hero" CASCADE;
  DROP TABLE "_solutions_v_blocks_rich_text" CASCADE;
  DROP TABLE "_solutions_v_blocks_intro_stats_stats" CASCADE;
  DROP TABLE "_solutions_v_blocks_intro_stats" CASCADE;
  DROP TABLE "_solutions_v_blocks_solution_cards" CASCADE;
  DROP TABLE "_solutions_v_blocks_values_list_items" CASCADE;
  DROP TABLE "_solutions_v_blocks_values_list" CASCADE;
  DROP TABLE "_solutions_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_solutions_v_blocks_timeline" CASCADE;
  DROP TABLE "_solutions_v_blocks_team_grid" CASCADE;
  DROP TABLE "_solutions_v_blocks_office_cards" CASCADE;
  DROP TABLE "_solutions_v_blocks_award_list" CASCADE;
  DROP TABLE "_solutions_v_blocks_press_list" CASCADE;
  DROP TABLE "_solutions_v_blocks_insight_cards" CASCADE;
  DROP TABLE "_solutions_v_blocks_fund_facts" CASCADE;
  DROP TABLE "_solutions_v_blocks_document_downloads" CASCADE;
  DROP TABLE "_solutions_v_blocks_quote" CASCADE;
  DROP TABLE "_solutions_v_blocks_cta_band" CASCADE;
  DROP TABLE "_solutions_v_blocks_faq_items" CASCADE;
  DROP TABLE "_solutions_v_blocks_faq" CASCADE;
  DROP TABLE "_solutions_v_blocks_contact_form" CASCADE;
  DROP TABLE "_solutions_v_blocks_disclaimer_strip" CASCADE;
  DROP TABLE "_solutions_v_blocks_related_links_links" CASCADE;
  DROP TABLE "_solutions_v_blocks_related_links" CASCADE;
  DROP TABLE "_solutions_v" CASCADE;
  DROP TABLE "_solutions_v_locales" CASCADE;
  DROP TABLE "_solutions_v_rels" CASCADE;
  DROP TABLE "funds" CASCADE;
  DROP TABLE "funds_locales" CASCADE;
  DROP TABLE "funds_rels" CASCADE;
  DROP TABLE "_funds_v" CASCADE;
  DROP TABLE "_funds_v_locales" CASCADE;
  DROP TABLE "_funds_v_rels" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "people_locales" CASCADE;
  DROP TABLE "_people_v" CASCADE;
  DROP TABLE "_people_v_locales" CASCADE;
  DROP TABLE "offices_address_lines" CASCADE;
  DROP TABLE "offices" CASCADE;
  DROP TABLE "_offices_v_version_address_lines" CASCADE;
  DROP TABLE "_offices_v" CASCADE;
  DROP TABLE "awards" CASCADE;
  DROP TABLE "_awards_v" CASCADE;
  DROP TABLE "jobs" CASCADE;
  DROP TABLE "jobs_locales" CASCADE;
  DROP TABLE "_jobs_v" CASCADE;
  DROP TABLE "_jobs_v_locales" CASCADE;
  DROP TABLE "insights" CASCADE;
  DROP TABLE "insights_locales" CASCADE;
  DROP TABLE "insights_rels" CASCADE;
  DROP TABLE "_insights_v" CASCADE;
  DROP TABLE "_insights_v_locales" CASCADE;
  DROP TABLE "_insights_v_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "_categories_v" CASCADE;
  DROP TABLE "_categories_v_locales" CASCADE;
  DROP TABLE "press_mentions" CASCADE;
  DROP TABLE "press_mentions_rels" CASCADE;
  DROP TABLE "_press_mentions_v" CASCADE;
  DROP TABLE "_press_mentions_v_rels" CASCADE;
  DROP TABLE "research_key_findings" CASCADE;
  DROP TABLE "research" CASCADE;
  DROP TABLE "research_locales" CASCADE;
  DROP TABLE "_research_v_version_key_findings" CASCADE;
  DROP TABLE "_research_v" CASCADE;
  DROP TABLE "_research_v_locales" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "legal_documents" CASCADE;
  DROP TABLE "legal_documents_locales" CASCADE;
  DROP TABLE "_legal_documents_v" CASCADE;
  DROP TABLE "_legal_documents_v_locales" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "ai_changesets_affected_docs" CASCADE;
  DROP TABLE "ai_changesets_flags" CASCADE;
  DROP TABLE "ai_changesets" CASCADE;
  DROP TABLE "audit_log" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "forms_blocks_checkbox" CASCADE;
  DROP TABLE "forms_blocks_checkbox_locales" CASCADE;
  DROP TABLE "forms_blocks_email" CASCADE;
  DROP TABLE "forms_blocks_email_locales" CASCADE;
  DROP TABLE "forms_blocks_message" CASCADE;
  DROP TABLE "forms_blocks_message_locales" CASCADE;
  DROP TABLE "forms_blocks_select_options" CASCADE;
  DROP TABLE "forms_blocks_select_options_locales" CASCADE;
  DROP TABLE "forms_blocks_select" CASCADE;
  DROP TABLE "forms_blocks_select_locales" CASCADE;
  DROP TABLE "forms_blocks_text" CASCADE;
  DROP TABLE "forms_blocks_text_locales" CASCADE;
  DROP TABLE "forms_blocks_textarea" CASCADE;
  DROP TABLE "forms_blocks_textarea_locales" CASCADE;
  DROP TABLE "forms_emails" CASCADE;
  DROP TABLE "forms_emails_locales" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "forms_locales" CASCADE;
  DROP TABLE "form_submissions_submission_data" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "header_nav_items_children" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_social_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "site_settings_organization_same_as" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "ai_settings_regulated_phrases" CASCADE;
  DROP TABLE "ai_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_solutions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_funds_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_projects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_people_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_offices_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_awards_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_jobs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_insights_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_press_mentions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_research_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_documents_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_legal_documents_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ai_changesets_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audit_log_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_redirects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_forms_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_form_submissions_fk";
  
  DROP INDEX "media_sizes_w400_sizes_w400_filename_idx";
  DROP INDEX "media_sizes_w800_sizes_w800_filename_idx";
  DROP INDEX "media_sizes_w1200_sizes_w1200_filename_idx";
  DROP INDEX "media_sizes_w1600_sizes_w1600_filename_idx";
  DROP INDEX "media_sizes_w2400_sizes_w2400_filename_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_solutions_id_idx";
  DROP INDEX "payload_locked_documents_rels_funds_id_idx";
  DROP INDEX "payload_locked_documents_rels_projects_id_idx";
  DROP INDEX "payload_locked_documents_rels_people_id_idx";
  DROP INDEX "payload_locked_documents_rels_offices_id_idx";
  DROP INDEX "payload_locked_documents_rels_awards_id_idx";
  DROP INDEX "payload_locked_documents_rels_jobs_id_idx";
  DROP INDEX "payload_locked_documents_rels_insights_id_idx";
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_press_mentions_id_idx";
  DROP INDEX "payload_locked_documents_rels_research_id_idx";
  DROP INDEX "payload_locked_documents_rels_documents_id_idx";
  DROP INDEX "payload_locked_documents_rels_legal_documents_id_idx";
  DROP INDEX "payload_locked_documents_rels_ai_changesets_id_idx";
  DROP INDEX "payload_locked_documents_rels_audit_log_id_idx";
  DROP INDEX "payload_locked_documents_rels_redirects_id_idx";
  DROP INDEX "payload_locked_documents_rels_forms_id_idx";
  DROP INDEX "payload_locked_documents_rels_form_submissions_id_idx";
  ALTER TABLE "media" DROP COLUMN "prefix";
  ALTER TABLE "media" DROP COLUMN "_objectkey";
  ALTER TABLE "media" DROP COLUMN "sizes_w400_url";
  ALTER TABLE "media" DROP COLUMN "sizes_w400_width";
  ALTER TABLE "media" DROP COLUMN "sizes_w400_height";
  ALTER TABLE "media" DROP COLUMN "sizes_w400_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_w400_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_w400_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_w800_url";
  ALTER TABLE "media" DROP COLUMN "sizes_w800_width";
  ALTER TABLE "media" DROP COLUMN "sizes_w800_height";
  ALTER TABLE "media" DROP COLUMN "sizes_w800_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_w800_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_w800_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_w1200_url";
  ALTER TABLE "media" DROP COLUMN "sizes_w1200_width";
  ALTER TABLE "media" DROP COLUMN "sizes_w1200_height";
  ALTER TABLE "media" DROP COLUMN "sizes_w1200_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_w1200_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_w1200_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_w1600_url";
  ALTER TABLE "media" DROP COLUMN "sizes_w1600_width";
  ALTER TABLE "media" DROP COLUMN "sizes_w1600_height";
  ALTER TABLE "media" DROP COLUMN "sizes_w1600_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_w1600_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_w1600_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_w2400_url";
  ALTER TABLE "media" DROP COLUMN "sizes_w2400_width";
  ALTER TABLE "media" DROP COLUMN "sizes_w2400_height";
  ALTER TABLE "media" DROP COLUMN "sizes_w2400_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_w2400_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_w2400_filename";
  ALTER TABLE "users" DROP COLUMN "name";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "solutions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "funds_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "projects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "people_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "offices_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "awards_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "jobs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "insights_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "press_mentions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "research_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "documents_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "legal_documents_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ai_changesets_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audit_log_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "forms_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "form_submissions_id";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_blocks_hero_ctas_link_type";
  DROP TYPE "public"."enum_pages_blocks_solution_cards_mode";
  DROP TYPE "public"."enum_pages_blocks_team_grid_filter";
  DROP TYPE "public"."enum_pages_blocks_office_cards_scope";
  DROP TYPE "public"."enum_pages_blocks_award_list_mode";
  DROP TYPE "public"."enum_pages_blocks_insight_cards_mode";
  DROP TYPE "public"."enum_pages_blocks_cta_band_button_type";
  DROP TYPE "public"."enum_pages_blocks_related_links_links_link_type";
  DROP TYPE "public"."enum_pages_hero_cta_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_ctas_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_solution_cards_mode";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_filter";
  DROP TYPE "public"."enum__pages_v_blocks_office_cards_scope";
  DROP TYPE "public"."enum__pages_v_blocks_award_list_mode";
  DROP TYPE "public"."enum__pages_v_blocks_insight_cards_mode";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_button_type";
  DROP TYPE "public"."enum__pages_v_blocks_related_links_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_cta_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_solutions_blocks_hero_ctas_link_type";
  DROP TYPE "public"."enum_solutions_blocks_solution_cards_mode";
  DROP TYPE "public"."enum_solutions_blocks_team_grid_filter";
  DROP TYPE "public"."enum_solutions_blocks_office_cards_scope";
  DROP TYPE "public"."enum_solutions_blocks_award_list_mode";
  DROP TYPE "public"."enum_solutions_blocks_insight_cards_mode";
  DROP TYPE "public"."enum_solutions_blocks_cta_band_button_type";
  DROP TYPE "public"."enum_solutions_blocks_related_links_links_link_type";
  DROP TYPE "public"."enum_solutions_status";
  DROP TYPE "public"."enum__solutions_v_blocks_hero_ctas_link_type";
  DROP TYPE "public"."enum__solutions_v_blocks_solution_cards_mode";
  DROP TYPE "public"."enum__solutions_v_blocks_team_grid_filter";
  DROP TYPE "public"."enum__solutions_v_blocks_office_cards_scope";
  DROP TYPE "public"."enum__solutions_v_blocks_award_list_mode";
  DROP TYPE "public"."enum__solutions_v_blocks_insight_cards_mode";
  DROP TYPE "public"."enum__solutions_v_blocks_cta_band_button_type";
  DROP TYPE "public"."enum__solutions_v_blocks_related_links_links_link_type";
  DROP TYPE "public"."enum__solutions_v_version_status";
  DROP TYPE "public"."enum__solutions_v_published_locale";
  DROP TYPE "public"."enum_funds_investor_type";
  DROP TYPE "public"."enum_funds_status";
  DROP TYPE "public"."enum__funds_v_version_investor_type";
  DROP TYPE "public"."enum__funds_v_version_status";
  DROP TYPE "public"."enum__funds_v_published_locale";
  DROP TYPE "public"."enum_projects_type";
  DROP TYPE "public"."enum_projects_project_status";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_type";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum_people_status";
  DROP TYPE "public"."enum__people_v_version_status";
  DROP TYPE "public"."enum__people_v_published_locale";
  DROP TYPE "public"."enum_offices_status";
  DROP TYPE "public"."enum__offices_v_version_status";
  DROP TYPE "public"."enum__offices_v_published_locale";
  DROP TYPE "public"."enum_awards_status";
  DROP TYPE "public"."enum__awards_v_version_status";
  DROP TYPE "public"."enum__awards_v_published_locale";
  DROP TYPE "public"."enum_jobs_contract_type";
  DROP TYPE "public"."enum_jobs_status";
  DROP TYPE "public"."enum__jobs_v_version_contract_type";
  DROP TYPE "public"."enum__jobs_v_version_status";
  DROP TYPE "public"."enum__jobs_v_published_locale";
  DROP TYPE "public"."enum_insights_status";
  DROP TYPE "public"."enum__insights_v_version_status";
  DROP TYPE "public"."enum__insights_v_published_locale";
  DROP TYPE "public"."enum_categories_status";
  DROP TYPE "public"."enum__categories_v_version_status";
  DROP TYPE "public"."enum__categories_v_published_locale";
  DROP TYPE "public"."enum_press_mentions_status";
  DROP TYPE "public"."enum__press_mentions_v_version_status";
  DROP TYPE "public"."enum__press_mentions_v_published_locale";
  DROP TYPE "public"."enum_research_status";
  DROP TYPE "public"."enum__research_v_version_status";
  DROP TYPE "public"."enum__research_v_published_locale";
  DROP TYPE "public"."enum_documents_type";
  DROP TYPE "public"."enum_legal_documents_status";
  DROP TYPE "public"."enum__legal_documents_v_version_status";
  DROP TYPE "public"."enum__legal_documents_v_published_locale";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_ai_changesets_status";
  DROP TYPE "public"."enum_audit_log_operation";
  DROP TYPE "public"."enum_audit_log_source";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_forms_confirmation_type";
  DROP TYPE "public"."enum_header_nav_items_children_link_type";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_header_utility_cta_type";
  DROP TYPE "public"."enum_footer_columns_links_link_type";
  DROP TYPE "public"."enum_footer_social_links_platform";`)
}
