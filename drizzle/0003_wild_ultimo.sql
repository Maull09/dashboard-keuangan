CREATE TABLE "sinking_fund_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"fund_id" integer NOT NULL,
	"kind" text NOT NULL,
	"amount" bigint NOT NULL,
	"date" date NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"transaction_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sinking_fund_entries_valid_kind" CHECK ("sinking_fund_entries"."kind" in ('allocate', 'release', 'spend')),
	CONSTRAINT "sinking_fund_entries_positive_amount" CHECK ("sinking_fund_entries"."amount" > 0),
	CONSTRAINT "sinking_fund_entries_linked_spend" CHECK (("sinking_fund_entries"."kind" = 'spend') = ("sinking_fund_entries"."transaction_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "sinking_funds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"account_id" integer NOT NULL,
	"target_amount" bigint NOT NULL,
	"target_date" date NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sinking_funds_positive_target" CHECK ("sinking_funds"."target_amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "stock_instruments" (
	"symbol" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"price" bigint NOT NULL,
	"date" date NOT NULL,
	"source" text DEFAULT 'Twelve Data' NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_prices_positive_price" CHECK ("stock_prices"."price" > 0)
);
--> statement-breakpoint
CREATE TABLE "stock_trades" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"account_id" integer NOT NULL,
	"side" text NOT NULL,
	"shares" integer NOT NULL,
	"price" bigint NOT NULL,
	"fees" bigint DEFAULT 0 NOT NULL,
	"date" date NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_trades_valid_side" CHECK ("stock_trades"."side" in ('buy', 'sell')),
	CONSTRAINT "stock_trades_positive_shares" CHECK ("stock_trades"."shares" > 0 and "stock_trades"."shares" % 100 = 0),
	CONSTRAINT "stock_trades_valid_money" CHECK ("stock_trades"."price" > 0 and "stock_trades"."fees" >= 0)
);
--> statement-breakpoint
CREATE TABLE "stock_watchlist" (
	"symbol" text PRIMARY KEY NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sinking_fund_entries" ADD CONSTRAINT "sinking_fund_entries_fund_id_sinking_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."sinking_funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sinking_fund_entries" ADD CONSTRAINT "sinking_fund_entries_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sinking_funds" ADD CONSTRAINT "sinking_funds_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_prices" ADD CONSTRAINT "stock_prices_symbol_stock_instruments_symbol_fk" FOREIGN KEY ("symbol") REFERENCES "public"."stock_instruments"("symbol") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_trades" ADD CONSTRAINT "stock_trades_symbol_stock_instruments_symbol_fk" FOREIGN KEY ("symbol") REFERENCES "public"."stock_instruments"("symbol") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_trades" ADD CONSTRAINT "stock_trades_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_watchlist" ADD CONSTRAINT "stock_watchlist_symbol_stock_instruments_symbol_fk" FOREIGN KEY ("symbol") REFERENCES "public"."stock_instruments"("symbol") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sinking_fund_entries_fund_idx" ON "sinking_fund_entries" USING btree ("fund_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sinking_fund_entries_transaction_idx" ON "sinking_fund_entries" USING btree ("transaction_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_prices_symbol_date_idx" ON "stock_prices" USING btree ("symbol","date");--> statement-breakpoint
CREATE INDEX "stock_trades_account_symbol_date_idx" ON "stock_trades" USING btree ("account_id","symbol","date");