CREATE TYPE "public"."digital_asset_category" AS ENUM('webpage', 'design_system', 'tool', 'document', 'brand_asset', 'other');--> statement-breakpoint
CREATE TYPE "public"."impact" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."learning_type" AS ENUM('learning', 'obstacle', 'win');--> statement-breakpoint
CREATE TYPE "public"."milestone_category" AS ENUM('strategy', 'implementation', 'training', 'automation', 'content', 'analytics', 'other');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('completed', 'in_progress', 'pending');--> statement-breakpoint
CREATE TYPE "public"."okr_status" AS ENUM('on_track', 'at_risk', 'off_track', 'completed');--> statement-breakpoint
CREATE TYPE "public"."phase_status" AS ENUM('completed', 'in_progress', 'pending');--> statement-breakpoint
CREATE TYPE "public"."resource_category" AS ENUM('document', 'template', 'script', 'training', 'guide', 'other');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."trend" AS ENUM('up', 'down', 'stable');--> statement-breakpoint
CREATE TYPE "public"."update_category" AS ENUM('session', 'result', 'delivery', 'insight', 'blocker', 'win', 'general');--> statement-breakpoint
CREATE TYPE "public"."update_status" AS ENUM('on_track', 'at_risk', 'blocked', 'completed');--> statement-breakpoint
CREATE TABLE "backlog_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "backlog_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(32) DEFAULT 'idea' NOT NULL,
	"priority" varchar(16) DEFAULT 'media' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_access" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "client_access_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"clientId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clients_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"logoUrl" text,
	"coverImageUrl" text,
	"branding" json,
	"consultorName" varchar(255),
	"startDate" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	"visibleSections" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clients_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "digital_assets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "digital_assets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" "digital_asset_category" DEFAULT 'other' NOT NULL,
	"externalUrl" text,
	"fileUrl" text,
	"notes" text,
	"isPublic" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learnings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "learnings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"phaseId" integer,
	"type" "learning_type" DEFAULT 'learning' NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"resolution" text,
	"date" timestamp NOT NULL,
	"isResolved" boolean DEFAULT false NOT NULL,
	"sortOrder" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metrics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "metrics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"value" varchar(128) NOT NULL,
	"previousValue" varchar(128),
	"unit" varchar(64),
	"trend" "trend" DEFAULT 'stable' NOT NULL,
	"description" text,
	"period" varchar(64),
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "milestones_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"phaseId" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"date" timestamp NOT NULL,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"category" "milestone_category" DEFAULT 'other' NOT NULL,
	"impact" "impact" DEFAULT 'medium' NOT NULL,
	"resultType" "update_category",
	"sortOrder" integer,
	"isPaused" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "okrs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "okrs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"phaseId" integer,
	"objective" text NOT NULL,
	"keyResult" text NOT NULL,
	"targetValue" varchar(128),
	"currentValue" varchar(128),
	"unit" varchar(64),
	"progressPct" integer DEFAULT 0 NOT NULL,
	"status" "okr_status" DEFAULT 'on_track' NOT NULL,
	"period" varchar(64),
	"notes" text,
	"sortOrder" integer,
	"isPaused" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_phases" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "project_phases_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "phase_status" DEFAULT 'pending' NOT NULL,
	"startDate" timestamp,
	"endDate" timestamp,
	"order" integer DEFAULT 0 NOT NULL,
	"color" varchar(32),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_updates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "project_updates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"phaseId" integer,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"category" "update_category" DEFAULT 'general' NOT NULL,
	"status" "update_status" DEFAULT 'on_track' NOT NULL,
	"impact" "impact" DEFAULT 'medium' NOT NULL,
	"isPublic" boolean DEFAULT true NOT NULL,
	"date" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" "resource_category" DEFAULT 'other' NOT NULL,
	"fileUrl" text,
	"externalUrl" text,
	"content" text,
	"isPublic" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scope_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "scope_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"inScope" boolean DEFAULT true NOT NULL,
	"category" varchar(128),
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"passwordHash" varchar(255),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
