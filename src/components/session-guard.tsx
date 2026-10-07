"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { useLanguage } from "./language-provider"

export function SessionGuard({
  userId,
  children,
}: {
  userId: string
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  useEffect(() => {
    if (loading) return
    if (!user) router.replace("/sign-in")
    else if (user.id !== userId) router.refresh()
  }, [loading, user, userId, router])
  if (loading || user?.id !== userId)
    return (
      <p role="status" className="p-8">
        {t("authSessionLoading")}
      </p>
    )
  return <div key={user.id}>{children}</div>
}
