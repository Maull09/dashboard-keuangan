import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AuthProvider } from "@/components/auth-provider"
import { SessionGuard } from "@/components/session-guard"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) redirect("/sign-in")
  return (
    <AuthProvider>
      <SessionGuard userId={user.id}>{children}</SessionGuard>
    </AuthProvider>
  )
}
