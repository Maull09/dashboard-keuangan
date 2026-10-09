CREATE TABLE "api_cache_revisions" (
	"scope" text PRIMARY KEY NOT NULL,
	"revision" uuid DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_cache_revisions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "cache_read" ON "api_cache_revisions" AS PERMISSIVE FOR SELECT TO "finance_user" USING (scope = 'market' or scope = nullif(current_setting('app.user_id', true), ''));
--> statement-breakpoint
REVOKE ALL ON public.api_cache_revisions FROM PUBLIC;
GRANT SELECT ON public.api_cache_revisions TO finance_user;
--> statement-breakpoint
CREATE FUNCTION public.invalidate_private_api_cache() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  owners uuid[];
  affected_owner uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    owners := ARRAY[NEW.user_id];
  ELSIF TG_OP = 'DELETE' THEN
    owners := ARRAY[OLD.user_id];
  ELSE
    owners := ARRAY[OLD.user_id, NEW.user_id];
  END IF;
  FOR affected_owner IN SELECT DISTINCT value FROM unnest(owners) AS value WHERE value IS NOT NULL LOOP
    INSERT INTO public.api_cache_revisions(scope) VALUES (affected_owner::text)
    ON CONFLICT (scope) DO UPDATE SET revision = pg_catalog.gen_random_uuid();
  END LOOP;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.invalidate_private_api_cache() FROM PUBLIC;
--> statement-breakpoint
CREATE FUNCTION public.invalidate_market_api_cache() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.api_cache_revisions(scope) VALUES ('market')
  ON CONFLICT (scope) DO UPDATE SET revision = pg_catalog.gen_random_uuid();
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.invalidate_market_api_cache() FROM PUBLIC;
--> statement-breakpoint
DO $$
DECLARE
  role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON public.api_cache_revisions FROM %I', role_name);
      EXECUTE format('REVOKE ALL ON FUNCTION public.invalidate_private_api_cache() FROM %I', role_name);
      EXECUTE format('REVOKE ALL ON FUNCTION public.invalidate_market_api_cache() FROM %I', role_name);
    END IF;
  END LOOP;
END;
$$;
--> statement-breakpoint
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'accounts', 'budgets', 'debts', 'goals', 'transactions',
    'recurring_transactions', 'goal_contributions', 'debt_payments',
    'reconciliations', 'stock_trades', 'stock_watchlist',
    'sinking_funds', 'sinking_fund_entries'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER invalidate_api_cache AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.invalidate_private_api_cache()',
      table_name
    );
    EXECUTE format(
      'CREATE TRIGGER invalidate_api_cache_truncate AFTER TRUNCATE ON public.%I FOR EACH STATEMENT EXECUTE FUNCTION public.invalidate_market_api_cache()',
      table_name
    );
  END LOOP;
  FOREACH table_name IN ARRAY ARRAY['stock_instruments', 'stock_prices'] LOOP
    EXECUTE format(
      'CREATE TRIGGER invalidate_api_cache AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.%I FOR EACH STATEMENT EXECUTE FUNCTION public.invalidate_market_api_cache()',
      table_name
    );
  END LOOP;
END;
$$;
