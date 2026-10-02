CREATE TYPE "public"."recurring_frequency" AS ENUM('weekly', 'monthly');--> statement-breakpoint
CREATE TABLE "debt_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"debt_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"date" date NOT NULL,
	"note" text,
	"transaction_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goal_contributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"goal_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"date" date NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reconciliations" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"actual_balance" integer NOT NULL,
	"date" date NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recurring_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"account_id" integer NOT NULL,
	"destination_account_id" integer,
	"frequency" "recurring_frequency" DEFAULT 'monthly' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"last_executed_date" date,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "rollover_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_debt_id_debts_id_fk" FOREIGN KEY ("debt_id") REFERENCES "public"."debts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_contributions" ADD CONSTRAINT "goal_contributions_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_contributions" ADD CONSTRAINT "goal_contributions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_destination_account_id_accounts_id_fk" FOREIGN KEY ("destination_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;