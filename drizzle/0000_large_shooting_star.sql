CREATE TYPE "public"."budget_period" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"budget" integer NOT NULL,
	"spent" integer DEFAULT 0 NOT NULL,
	"period" "budget_period" DEFAULT 'monthly' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_amount" integer NOT NULL,
	"current_amount" integer DEFAULT 0 NOT NULL,
	"target_date" date NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now()
);
