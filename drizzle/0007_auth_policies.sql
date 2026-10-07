CREATE ROLE finance_user NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS;--> statement-breakpoint
GRANT finance_user TO CURRENT_USER;--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO finance_user;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON accounts, budgets, debt_payments, debts, goal_contributions, goals, reconciliations, recurring_transactions, sinking_fund_entries, sinking_funds, stock_trades, stock_watchlist, transactions TO finance_user;--> statement-breakpoint
GRANT SELECT, INSERT ON stock_instruments TO finance_user;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON stock_prices TO finance_user;--> statement-breakpoint
GRANT USAGE ON SEQUENCE accounts_id_seq, budgets_id_seq, debt_payments_id_seq, debts_id_seq, goal_contributions_id_seq, goals_id_seq, reconciliations_id_seq, recurring_transactions_id_seq, sinking_fund_entries_id_seq, sinking_funds_id_seq, stock_trades_id_seq, stock_watchlist_id_seq, transactions_id_seq, stock_prices_id_seq TO finance_user;--> statement-breakpoint
REVOKE ALL ON accounts, budgets, debt_payments, debts, goal_contributions, goals, reconciliations, recurring_transactions, sinking_fund_entries, sinking_funds, stock_trades, stock_watchlist, transactions, stock_instruments, stock_prices FROM PUBLIC;--> statement-breakpoint
DO $$
DECLARE role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON accounts, budgets, debt_payments, debts, goal_contributions, goals, reconciliations, recurring_transactions, sinking_fund_entries, sinking_funds, stock_trades, stock_watchlist, transactions, stock_instruments, stock_prices FROM %I', role_name);
    END IF;
  END LOOP;
END $$;--> statement-breakpoint
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "budgets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "debt_payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "debts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "goal_contributions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "goals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reconciliations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sinking_fund_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sinking_funds" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "stock_instruments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "stock_prices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "stock_trades" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "stock_watchlist" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "budgets_user_id_idx" ON "budgets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "debt_payments_user_id_idx" ON "debt_payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "debts_user_id_idx" ON "debts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goal_contributions_user_id_idx" ON "goal_contributions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goals_user_id_idx" ON "goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reconciliations_user_id_idx" ON "reconciliations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recurring_transactions_user_id_idx" ON "recurring_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sinking_fund_entries_user_id_idx" ON "sinking_fund_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sinking_funds_user_id_idx" ON "sinking_funds" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "stock_trades_user_id_idx" ON "stock_trades" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "stock_watchlist_user_id_idx" ON "stock_watchlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "owner_access" ON "accounts" AS RESTRICTIVE FOR ALL TO "finance_user" USING (accounts.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (accounts.user_id = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "owner_access" ON "budgets" AS RESTRICTIVE FOR ALL TO "finance_user" USING (budgets.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (budgets.user_id = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "owner_access" ON "debt_payments" AS RESTRICTIVE FOR ALL TO "finance_user" USING (debt_payments.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (debt_payments.user_id = nullif(current_setting('app.user_id', true), '')::uuid and (debt_payments.debt_id is null or exists (select 1 from public.debts where debts.id = debt_payments.debt_id)) and (debt_payments.account_id is null or exists (select 1 from public.accounts where accounts.id = debt_payments.account_id)) and (debt_payments.transaction_id is null or exists (select 1 from public.transactions where transactions.id = debt_payments.transaction_id)));--> statement-breakpoint
CREATE POLICY "owner_access" ON "debts" AS RESTRICTIVE FOR ALL TO "finance_user" USING (debts.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (debts.user_id = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "owner_access" ON "goal_contributions" AS RESTRICTIVE FOR ALL TO "finance_user" USING (goal_contributions.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (goal_contributions.user_id = nullif(current_setting('app.user_id', true), '')::uuid and (goal_contributions.goal_id is null or exists (select 1 from public.goals where goals.id = goal_contributions.goal_id)) and (goal_contributions.account_id is null or exists (select 1 from public.accounts where accounts.id = goal_contributions.account_id)));--> statement-breakpoint
CREATE POLICY "owner_access" ON "goals" AS RESTRICTIVE FOR ALL TO "finance_user" USING (goals.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (goals.user_id = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "owner_access" ON "reconciliations" AS RESTRICTIVE FOR ALL TO "finance_user" USING (reconciliations.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (reconciliations.user_id = nullif(current_setting('app.user_id', true), '')::uuid and (reconciliations.account_id is null or exists (select 1 from public.accounts where accounts.id = reconciliations.account_id)));--> statement-breakpoint
CREATE POLICY "owner_access" ON "recurring_transactions" AS RESTRICTIVE FOR ALL TO "finance_user" USING (recurring_transactions.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (recurring_transactions.user_id = nullif(current_setting('app.user_id', true), '')::uuid and (recurring_transactions.account_id is null or exists (select 1 from public.accounts where accounts.id = recurring_transactions.account_id)) and (recurring_transactions.destination_account_id is null or exists (select 1 from public.accounts where accounts.id = recurring_transactions.destination_account_id)));--> statement-breakpoint
CREATE POLICY "owner_access" ON "sinking_fund_entries" AS RESTRICTIVE FOR ALL TO "finance_user" USING (sinking_fund_entries.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (sinking_fund_entries.user_id = nullif(current_setting('app.user_id', true), '')::uuid and (sinking_fund_entries.fund_id is null or exists (select 1 from public.sinking_funds where sinking_funds.id = sinking_fund_entries.fund_id)) and (sinking_fund_entries.transaction_id is null or exists (select 1 from public.transactions where transactions.id = sinking_fund_entries.transaction_id)));--> statement-breakpoint
CREATE POLICY "owner_access" ON "sinking_funds" AS RESTRICTIVE FOR ALL TO "finance_user" USING (sinking_funds.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (sinking_funds.user_id = nullif(current_setting('app.user_id', true), '')::uuid and (sinking_funds.account_id is null or exists (select 1 from public.accounts where accounts.id = sinking_funds.account_id)));--> statement-breakpoint
CREATE POLICY "market_read" ON "stock_instruments" AS PERMISSIVE FOR SELECT TO "finance_user" USING (true);--> statement-breakpoint
CREATE POLICY "market_insert" ON "stock_instruments" AS PERMISSIVE FOR INSERT TO "finance_user" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "market_read" ON "stock_prices" AS PERMISSIVE FOR SELECT TO "finance_user" USING (true);--> statement-breakpoint
CREATE POLICY "market_insert" ON "stock_prices" AS PERMISSIVE FOR INSERT TO "finance_user" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "market_update" ON "stock_prices" AS PERMISSIVE FOR UPDATE TO "finance_user" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "owner_access" ON "stock_trades" AS RESTRICTIVE FOR ALL TO "finance_user" USING (stock_trades.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (stock_trades.user_id = nullif(current_setting('app.user_id', true), '')::uuid and (stock_trades.account_id is null or exists (select 1 from public.accounts where accounts.id = stock_trades.account_id)));--> statement-breakpoint
CREATE POLICY "owner_access" ON "stock_watchlist" AS RESTRICTIVE FOR ALL TO "finance_user" USING (stock_watchlist.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (stock_watchlist.user_id = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "owner_access" ON "transactions" AS RESTRICTIVE FOR ALL TO "finance_user" USING (transactions.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (transactions.user_id = nullif(current_setting('app.user_id', true), '')::uuid and (transactions.account_id is null or exists (select 1 from public.accounts where accounts.id = transactions.account_id)) and (transactions.destination_account_id is null or exists (select 1 from public.accounts where accounts.id = transactions.destination_account_id)));

--> statement-breakpoint
CREATE POLICY "app_access" ON "accounts" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "app_access" ON "budgets" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "app_access" ON "debt_payments" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "app_access" ON "debts" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "app_access" ON "goal_contributions" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "app_access" ON "goals" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "app_access" ON "reconciliations" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "app_access" ON "recurring_transactions" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "app_access" ON "sinking_fund_entries" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "app_access" ON "sinking_funds" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "app_access" ON "stock_trades" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "app_access" ON "stock_watchlist" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "app_access" ON "transactions" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);
