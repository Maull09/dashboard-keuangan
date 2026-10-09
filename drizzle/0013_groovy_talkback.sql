ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "group_name" text;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.transactions'::regclass
      AND conname = 'transactions_valid_group_name'
  ) THEN
    ALTER TABLE "transactions" ADD CONSTRAINT "transactions_valid_group_name"
      CHECK ("group_name" IS NULL OR ("group_name" = btrim("group_name") AND char_length("group_name") BETWEEN 1 AND 100));
  END IF;
END $$;
