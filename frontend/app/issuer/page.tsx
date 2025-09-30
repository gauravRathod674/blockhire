"use client"

import type React from "react"

import { useState } from "react"
import Layout from "../../components/Layout"
import ProtectedRoute from "../../components/ProtectedRoute"
import { useAuth } from "../../contexts/AuthContext"

export default function IssuerPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    employeeId: "",
    documentHash: "",
  })
  const [txStatus, setTxStatus] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleIssueRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTxStatus("Initiating blockchain transaction...")

    // Simulate blockchain transaction
    setTimeout(() => {
      const txHash = "0x" + Math.random().toString(16).substr(2, 64)

      // Store the record
      const records = JSON.parse(localStorage.getItem("blockchainRecords") || "{}")
      records[formData.employeeId] = formData.documentHash
      localStorage.setItem("blockchainRecords", JSON.stringify(records))

      setTxStatus(`Record issued successfully! Transaction Hash: ${txHash}`)
      setLoading(false)

      // Clear form
      setFormData({ employeeId: "", documentHash: "" })
    }, 3000)
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container" style={{ maxWidth: "600px", margin: "2rem auto" }}>
          <h1>Issuer Dashboard</h1>

          <div className="alert alert-success">
            <strong>Authorized Issuer:</strong> {user?.email}
          </div>

          <div className="card">
            <h2>Issue New Employment Record</h2>
            <p>Issue a new employment record to the blockchain. This action is irreversible.</p>

            <form onSubmit={handleIssueRecord}>
              <div className="form-group">
                <label htmlFor="employeeId">Employee ID</label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="Enter employee ID"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="documentHash">Document Hash</label>
                <input
                  type="text"
                  id="documentHash"
                  name="documentHash"
                  value={formData.documentHash}
                  onChange={handleInputChange}
                  placeholder="Enter document hash (0x...)"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                {loading && <span className="spinner"></span>}
                Record Issue
              </button>
            </form>

            {txStatus && (
              <div
                className={`alert ${txStatus.includes("successfully") ? "alert-success" : "alert-error"}`}
                style={{ marginTop: "1rem" }}
              >
                {txStatus}
              </div>
            )}
          </div>

          <div className="card">
            <h3>Issuer Guidelines</h3>
            <ul style={{ paddingLeft: "1.5rem" }}>
              <li>Verify employee identity before issuing records</li>
              <li>Ensure document hash is computed correctly using SHA-256</li>
              <li>Double-check employee ID for accuracy</li>
              <li>Keep transaction records for audit purposes</li>
            </ul>

            <div
              style={{
                marginTop: "2rem",
                padding: "1rem",
                background: "#fed7d7",
                borderRadius: "4px",
                border: "1px solid #feb2b2",
              }}
            >
              <p>
                <strong>Warning:</strong> Blockchain records are immutable. Once issued, they cannot be modified or
                deleted.
              </p>
            </div>
          </div>

          <div className="card">
            <h3>Recent Transactions</h3>
            <div style={{ padding: "2rem", textAlign: "center", background: "#f7fafc", borderRadius: "4px" }}>
              <p>No recent transactions</p>
              <p style={{ color: "#718096", fontSize: "0.9rem" }}>
                Transaction history will appear here once records are issued
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
