CREATE INDEX "accounts_user_order_idx" ON "accounts" USING btree ("user_id","id");--> statement-breakpoint
CREATE INDEX "debt_payments_user_debt_date_idx" ON "debt_payments" USING btree ("user_id","debt_id","date","id");--> statement-breakpoint
CREATE INDEX "debt_payments_user_account_idx" ON "debt_payments" USING btree ("user_id","account_id");--> statement-breakpoint
CREATE INDEX "debts_user_due_date_idx" ON "debts" USING btree ("user_id","due_date");--> statement-breakpoint
CREATE INDEX "goal_contributions_user_goal_date_idx" ON "goal_contributions" USING btree ("user_id","goal_id","date","id");--> statement-breakpoint
CREATE INDEX "goal_contributions_user_account_idx" ON "goal_contributions" USING btree ("user_id","account_id");--> statement-breakpoint
CREATE INDEX "goals_user_order_idx" ON "goals" USING btree ("user_id","id");--> statement-breakpoint
CREATE INDEX "reconciliations_user_account_date_idx" ON "reconciliations" USING btree ("user_id","account_id","date" desc);--> statement-breakpoint
CREATE INDEX "recurring_user_start_date_idx" ON "recurring_transactions" USING btree ("user_id","start_date");--> statement-breakpoint
CREATE INDEX "recurring_user_account_idx" ON "recurring_transactions" USING btree ("user_id","account_id");--> statement-breakpoint
CREATE INDEX "recurring_user_destination_idx" ON "recurring_transactions" USING btree ("user_id","destination_account_id");--> statement-breakpoint
CREATE INDEX "sinking_fund_entries_user_fund_order_idx" ON "sinking_fund_entries" USING btree ("user_id","fund_id","id" desc);--> statement-breakpoint
CREATE INDEX "sinking_funds_user_target_date_idx" ON "sinking_funds" USING btree ("user_id","target_date");--> statement-breakpoint
CREATE INDEX "sinking_funds_user_account_idx" ON "sinking_funds" USING btree ("user_id","account_id");--> statement-breakpoint
CREATE INDEX "stock_trades_user_account_date_idx" ON "stock_trades" USING btree ("user_id","account_id","date" desc,"id" desc);--> statement-breakpoint
CREATE INDEX "transactions_user_type_date_idx" ON "transactions" USING btree ("user_id","type","date");--> statement-breakpoint
CREATE INDEX "transactions_user_account_date_idx" ON "transactions" USING btree ("user_id","account_id","date");--> statement-breakpoint
CREATE INDEX "transactions_user_destination_date_idx" ON "transactions" USING btree ("user_id","destination_account_id","date");