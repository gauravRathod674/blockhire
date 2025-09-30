"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../../components/ProtectedRoute"

export default function ProfileIndexRedirect() {
  const router = useRouter()

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/`, {
          credentials: "include",
        })
        const json = await res.json()
        if (res.ok && json.ok && json.profile) {
          // if basic profile fields present, redirect to info
          if (json.profile.firstName || json.profile.lastName || json.profile.documentHash) {
            router.replace("/profile/info")
            return
          } else {
            router.replace("/profile/edit")
            return
          }
        } else {
          // not authenticated or no profile -> go to edit (so user can fill after login)
          router.replace("/profile/edit")
        }
      } catch (err) {
        console.error(err)
        router.replace("/profile/edit")
      }
    }
    check()
  }, [router])

  return (
    <ProtectedRoute>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
        <div className="spinner"></div>
        <span style={{ marginLeft: "0.75rem" }}>Loading profile…</span>
      </div>
    </ProtectedRoute>
  )
}
