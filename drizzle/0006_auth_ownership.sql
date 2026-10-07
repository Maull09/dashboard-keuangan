ALTER TABLE "stock_watchlist" DROP CONSTRAINT "stock_watchlist_pkey";--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
ALTER TABLE "debt_payments" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
ALTER TABLE "goal_contributions" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
ALTER TABLE "reconciliations" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
ALTER TABLE "sinking_fund_entries" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
ALTER TABLE "sinking_funds" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
ALTER TABLE "stock_trades" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
ALTER TABLE "stock_watchlist" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_watchlist" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "stock_watchlist_user_symbol_idx" ON "stock_watchlist" USING btree ("user_id","symbol");