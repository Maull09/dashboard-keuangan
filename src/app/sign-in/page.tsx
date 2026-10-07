import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { createClient } from "@/lib/supabase/server"
import { safeNextPath } from "@/lib/auth"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect(safeNextPath(params.next))
  return (
    <AuthForm
      mode="sign-in"
      next={params.next}
      invalidLink={params.error === "confirmation"}
    />
  )
}
