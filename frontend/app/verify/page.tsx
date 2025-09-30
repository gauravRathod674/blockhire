"use client"

import type React from "react"
import { useState } from "react"
import Layout from "../../components/Layout"
import ProtectedRoute from "../../components/ProtectedRoute"

const API = process.env.NEXT_PUBLIC_API_URL;

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

    // [+] NEW: Call the backend for verification
    if (!API) {
      setVerificationResult({ status: 'error', message: 'API URL is not configured.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setVerificationResult({ status: "success", message: data.message });
      } else {
        setVerificationResult({ status: "error", message: data.error || "Verification failed." });
      }

    } catch (error) {
      setVerificationResult({ status: 'error', message: 'Failed to connect to the verification service.' });
    } finally {
      setLoading(false);
    }
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
              <li>Our system checks the hash against the record in our secure database</li>
              <li>If hashes match, the document is verified as untampered</li>
              <li>If hashes don't match, the document may have been altered</li>
            </ol>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
