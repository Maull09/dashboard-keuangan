"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/browser"
import { clearRemoteResourceCache } from "@/lib/remote-resource-cache"

type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const client = createClient()
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, nextSession) => {
      clearRemoteResourceCache()
      setSession(nextSession)
      setLoading(false)
      if (event === "SIGNED_OUT") {
        router.replace("/sign-in")
        router.refresh()
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  async function signOut() {
    const { error } = await createClient().auth.signOut({ scope: "local" })
    if (error) throw error
    clearRemoteResourceCache()
    setSession(null)
    router.replace("/sign-in")
    router.refresh()
  }

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
