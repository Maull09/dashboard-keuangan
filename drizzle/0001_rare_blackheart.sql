CREATE TYPE "public"."account_type" AS ENUM('cash', 'bank', 'investment', 'ewallet', 'other');--> statement-breakpoint
CREATE TYPE "public"."debt_status" AS ENUM('unpaid', 'paid');--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'transfer';--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "account_type" NOT NULL,
	"initial_balance" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "debts" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"status" "debt_status" DEFAULT 'unpaid' NOT NULL,
	"due_date" date,
	"paid_date" date,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "period_start" date;--> statement-breakpoint
UPDATE "budgets" SET "period_start" = date_trunc('month', COALESCE("created_at", now()))::date WHERE "period_start" IS NULL;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "period_start" SET NOT NULL;--> statement-breakpoint
INSERT INTO "accounts" ("name", "type", "description")
SELECT 'Akun belum dikategorikan', 'other', 'Dibuat otomatis untuk transaksi sebelum akun tersedia'
WHERE EXISTS (SELECT 1 FROM "transactions");--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "account_id" integer;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "destination_account_id" integer;--> statement-breakpoint
UPDATE "transactions"
SET "account_id" = (SELECT "id" FROM "accounts" WHERE "name" = 'Akun belum dikategorikan' ORDER BY "id" LIMIT 1)
WHERE "account_id" IS NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "account_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destination_account_id_accounts_id_fk" FOREIGN KEY ("destination_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
