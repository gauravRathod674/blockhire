"use client"
import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
        <div className="spinner" />
        <span style={{ marginLeft: "0.75rem" }}>Checking authentication…</span>
      </div>
    )
  }

  return <>{children}</>
}
