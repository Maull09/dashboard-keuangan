ALTER TABLE "stock_trades" DROP CONSTRAINT "stock_trades_positive_shares";--> statement-breakpoint
ALTER TABLE "stock_trades" ALTER COLUMN "shares" SET DATA TYPE numeric(16, 4);--> statement-breakpoint
ALTER TABLE "stock_trades" ALTER COLUMN "price" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "stock_trades" ADD CONSTRAINT "stock_trades_positive_shares" CHECK ("stock_trades"."shares" > 0 and "stock_trades"."shares" <= 10000000);