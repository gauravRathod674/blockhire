"use client"

import Layout from "../../../components/Layout"
import ProtectedRoute from "../../../components/ProtectedRoute"
import Link from "next/link"
import { useEffect, useState } from "react"

interface UserProfile {
  firstName: string
  lastName: string
  dateOfBirth: string
  mobile: string
  email: string
  address: string
  jobDesignation: string
  department: string
  employeeId: string
  userHash: string
  documentHash?: string
}

const API = process.env.NEXT_PUBLIC_API_URL

export default function ProfileInfoPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${API}/profile/`, { credentials: "include" })
        const json = await res.json()
        if (res.ok && json.ok) {
          setProfile(json.profile)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error("Profile load error", err)
        setProfile(null)
      }
    }
    loadProfile()
  }, [])

  const copyValue = async (val: string) => {
    try {
      await navigator.clipboard.writeText(val)
      alert("Copied to clipboard")
    } catch {
      alert("Unable to copy")
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container" style={{ maxWidth: "900px", margin: "2rem auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h1>Your Profile</h1>
            <Link href="/profile/edit" className="btn btn-secondary">
              Edit
            </Link>
          </div>

          {!profile ? (
            <div className="card" style={{ textAlign: "center" }}>
              <h2>No profile found</h2>
              <p>Please login and complete your profile to view your information.</p>
              <Link href="/profile/edit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                Add Details
              </Link>
            </div>
          ) : (
            <>
              <div className="card">
                <h2 style={{ marginBottom: "1rem" }}>Personal</h2>
                <div className="features" style={{ margin: 0, gap: "1rem" }}>
                  <div className="feature-card">
                    <strong>First Name</strong>
                    <p>{profile.firstName || "-"}</p>
                  </div>
                  <div className="feature-card">
                    <strong>Last Name</strong>
                    <p>{profile.lastName || "-"}</p>
                  </div>
                  <div className="feature-card">
                    <strong>DOB</strong>
                    <p>{profile.dateOfBirth || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 style={{ marginBottom: "1rem" }}>Contact</h2>
                <div className="features" style={{ margin: 0, gap: "1rem" }}>
                  <div className="feature-card">
                    <strong>Mobile</strong>
                    <p>{profile.mobile || "-"}</p>
                  </div>
                  <div className="feature-card">
                    <strong>Email</strong>
                    <p>{profile.email || "-"}</p>
                  </div>
                  <div className="feature-card">
                    <strong>Address</strong>
                    <p>{profile.address || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 style={{ marginBottom: "1rem" }}>Employment</h2>
                <div className="features" style={{ margin: 0, gap: "1rem" }}>
                  <div className="feature-card">
                    <strong>Designation</strong>
                    <p>{profile.jobDesignation || "-"}</p>
                  </div>
                  <div className="feature-card">
                    <strong>Department</strong>
                    <p>{profile.department || "-"}</p>
                  </div>
                  <div className="feature-card">
                    <strong>Employee ID</strong>
                    <p>{profile.employeeId || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2>Immutable Identifiers</h2>
                <div style={{ marginBottom: "1rem" }}>
                  <strong>User Hash</strong>
                  <code
                    style={{
                      background: "#f7fafc",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      display: "block",
                      wordBreak: "break-all",
                    }}
                  >
                    {profile.userHash}
                  </code>
                  <button
                    className="btn btn-secondary"
                    style={{ marginTop: "0.75rem" }}
                    onClick={() => copyValue(profile.userHash)}
                  >
                    Copy User Hash
                  </button>
                </div>

                {profile.documentHash && (
                  <div>
                    <strong>Document Hash</strong>
                    <code
                      style={{
                        background: "#f7fafc",
                        padding: "0.75rem",
                        borderRadius: "6px",
                        display: "block",
                        wordBreak: "break-all",
                      }}
                    >
                      {profile.documentHash}
                    </code>
                    <button
                      className="btn btn-secondary"
                      style={{ marginTop: "0.75rem" }}
                      onClick={() => copyValue(profile.documentHash!)}
                    >
                      Copy Document Hash
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
