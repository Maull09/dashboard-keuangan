CREATE TABLE "ai_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid NOT NULL,
	"title" text NOT NULL,
	"busy_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"receipt_id" uuid,
	"data" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"transaction_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_drafts_valid_status" CHECK ("ai_drafts"."status" in ('pending', 'confirmed', 'rejected')),
	CONSTRAINT "ai_drafts_confirmation_link" CHECK (("ai_drafts"."status" = 'confirmed') = ("ai_drafts"."transaction_id" is not null))
);
--> statement-breakpoint
ALTER TABLE "ai_drafts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_messages_valid_role" CHECK ("ai_messages"."role" in ('user', 'assistant'))
);
--> statement-breakpoint
ALTER TABLE "ai_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid DEFAULT nullif(current_setting('app.user_id', true), '')::uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_receipts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ai_drafts" ADD CONSTRAINT "ai_drafts_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_drafts" ADD CONSTRAINT "ai_drafts_message_id_ai_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."ai_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_drafts" ADD CONSTRAINT "ai_drafts_receipt_id_ai_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."ai_receipts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_drafts" ADD CONSTRAINT "ai_drafts_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_receipts" ADD CONSTRAINT "ai_receipts_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_conversations_user_created_idx" ON "ai_conversations" USING btree ("user_id","created_at" desc);--> statement-breakpoint
CREATE INDEX "ai_drafts_conversation_idx" ON "ai_drafts" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "ai_messages_conversation_created_idx" ON "ai_messages" USING btree ("conversation_id","created_at","id");--> statement-breakpoint
CREATE INDEX "ai_messages_user_created_idx" ON "ai_messages" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_receipts_conversation_idx" ON "ai_receipts" USING btree ("conversation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_receipts_storage_path_idx" ON "ai_receipts" USING btree ("storage_path");--> statement-breakpoint
CREATE POLICY "app_access" ON "ai_conversations" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "owner_access" ON "ai_conversations" AS RESTRICTIVE FOR ALL TO "finance_user" USING (ai_conversations.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (ai_conversations.user_id = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "app_access" ON "ai_drafts" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "owner_access" ON "ai_drafts" AS RESTRICTIVE FOR ALL TO "finance_user" USING (ai_drafts.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (ai_drafts.user_id = nullif(current_setting('app.user_id', true), '')::uuid and (ai_drafts.conversation_id is null or exists (select 1 from public.ai_conversations where ai_conversations.id = ai_drafts.conversation_id)) and (ai_drafts.message_id is null or exists (select 1 from public.ai_messages where ai_messages.id = ai_drafts.message_id)) and (ai_drafts.receipt_id is null or exists (select 1 from public.ai_receipts where ai_receipts.id = ai_drafts.receipt_id)) and (ai_drafts.transaction_id is null or exists (select 1 from public.transactions where transactions.id = ai_drafts.transaction_id)));--> statement-breakpoint
CREATE POLICY "app_access" ON "ai_messages" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "owner_access" ON "ai_messages" AS RESTRICTIVE FOR ALL TO "finance_user" USING (ai_messages.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (ai_messages.user_id = nullif(current_setting('app.user_id', true), '')::uuid and (ai_messages.conversation_id is null or exists (select 1 from public.ai_conversations where ai_conversations.id = ai_messages.conversation_id)));--> statement-breakpoint
CREATE POLICY "app_access" ON "ai_receipts" AS PERMISSIVE FOR ALL TO "finance_user" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "owner_access" ON "ai_receipts" AS RESTRICTIVE FOR ALL TO "finance_user" USING (ai_receipts.user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (ai_receipts.user_id = nullif(current_setting('app.user_id', true), '')::uuid and (ai_receipts.conversation_id is null or exists (select 1 from public.ai_conversations where ai_conversations.id = ai_receipts.conversation_id)));
--> statement-breakpoint
REVOKE ALL ON public.ai_conversations, public.ai_messages, public.ai_receipts, public.ai_drafts FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations, public.ai_messages, public.ai_receipts, public.ai_drafts TO finance_user;
--> statement-breakpoint
DO $$
DECLARE role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON public.ai_conversations, public.ai_messages, public.ai_receipts, public.ai_drafts FROM %I', role_name);
    END IF;
  END LOOP;
END;
$$;
