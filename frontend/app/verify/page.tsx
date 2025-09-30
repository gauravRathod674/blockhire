"use client"

import type React from "react"

import { useState } from "react"
import Layout from "../../components/Layout"
import ProtectedRoute from "../../components/ProtectedRoute"

export default function VerifyPage() {
  const [formData, setFormData] = useState({
    employeeId: "",
    hash: "",
  })
  const [verificationResult, setVerificationResult] = useState<{
    status: "success" | "error" | null
    message: string
  }>({ status: null, message: "" })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setVerificationResult({ status: null, message: "" })

    // Simulate verification process
    setTimeout(() => {
      // Get stored records
      const records = JSON.parse(localStorage.getItem("blockchainRecords") || "{}")
      const storedHash = records[formData.employeeId]

      if (!storedHash) {
        setVerificationResult({
          status: "error",
          message: `No record found for Employee ID: ${formData.employeeId}`,
        })
      } else if (storedHash === formData.hash) {
        setVerificationResult({
          status: "success",
          message: "✅ Document is UNTAMPERED - Hash matches blockchain record",
        })
      } else {
        setVerificationResult({
          status: "error",
          message: "❌ Document has been TAMPERED - Hash does not match blockchain record",
        })
      }

      setLoading(false)
    }, 2000)
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container" style={{ maxWidth: "600px", margin: "2rem auto" }}>
          <h1>Verify Employment Record</h1>

          <div className="card">
            <h2>Step 1: Enter Verification Details</h2>
            <form onSubmit={handleVerify}>
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
                <label htmlFor="hash">Document Hash</label>
                <input
                  type="text"
                  id="hash"
                  name="hash"
                  value={formData.hash}
                  onChange={handleInputChange}
                  placeholder="Enter document hash (0x...)"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                {loading && <span className="spinner"></span>}
                Check Record
              </button>
            </form>
          </div>

          {verificationResult.status && (
            <div className="card">
              <h2>Step 2: Verification Result</h2>
              <div className={`alert ${verificationResult.status === "success" ? "alert-success" : "alert-error"}`}>
                {verificationResult.message}
              </div>

              {verificationResult.status === "success" && (
                <div style={{ marginTop: "2rem" }}>
                  <h3>Verification Details:</h3>
                  <p>
                    <strong>Employee ID:</strong> {formData.employeeId}
                  </p>
                  <p>
                    <strong>Document Hash:</strong> <code>{formData.hash}</code>
                  </p>
                  <p>
                    <strong>Status:</strong> Verified ✅
                  </p>
                  <p>
                    <strong>Blockchain Network:</strong> Ethereum Mainnet (Simulated)
                  </p>
                  <p>
                    <strong>Verification Time:</strong> {new Date().toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="card">
            <h3>How Verification Works</h3>
            <ol style={{ paddingLeft: "1.5rem" }}>
              <li>Enter the employee ID and document hash you want to verify</li>
              <li>Our system checks the hash against the blockchain record</li>
              <li>If hashes match, the document is verified as untampered</li>
              <li>If hashes don't match, the document may have been altered</li>
            </ol>

            <div style={{ marginTop: "2rem", padding: "1rem", background: "#f7fafc", borderRadius: "4px" }}>
              <p>
                <strong>Note:</strong> This is a demonstration version. In production, verification would query actual
                blockchain networks.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
