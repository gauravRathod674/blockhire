"use client";

import type React from "react";
import Layout from "../../../components/Layout";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  mobile: string;
  email: string;
  address: string;
  jobDesignation: string;
  department: string;
  employeeId: string;
  userHash: string;
  documentHash?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function ProfileEditPage() {
  const [step, setStep] = useState<"personal" | "contact" | "employment">(
    "personal"
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [txStatus, setTxStatus] = useState<string>("");
  const router = useRouter();

 useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${API}/profile/`, {
          credentials: "include",
        });
        const json = await res.json();
        if (res.ok && json.ok) {
          setProfile(json.profile);
          // REMOVED: alert("Profile saved successfully!");
          // REMOVED: router.push("/");
        } else {
          setProfile({
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            mobile: "",
            email: "",
            address: "",
            jobDesignation: "",
            department: "",
            employeeId: "",
            userHash: "",
            documentHash: "",
          });
        }
      } catch (err) {
        console.error("Profile load error", err);
      }
    }
    loadProfile();
  }, []); // The dependency array should be empty to run only once on mount.

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((p) => (p ? { ...p, [name]: value } : p));
  };

  const onNext = () => {
    if (step === "personal") setStep("contact");
    else if (step === "contact") setStep("employment");
  };

  const onSave = async () => {
    if (!profile) return;
    try {
      const res = await fetch(`${API}/profile/`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setProfile(json.profile);
        alert("Profile saved successfully!");
      } else {
        alert(json.error || "Error saving profile");
      }
    } catch (e) {
      alert("Error saving profile");
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }
    setSelectedFile(file);
    setIsHashing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API}/documents/`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setProfile((p) => (p ? { ...p, documentHash: json.documentHash } : p));
        alert("Document uploaded successfully!");
      } else {
        alert(json.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing file");
    } finally {
      setIsHashing(false);
    }
  };

  if (!profile) {
    return (
      <ProtectedRoute>
        <Layout>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            Loading profile…
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div
          className="container"
          style={{ maxWidth: "800px", margin: "2rem auto" }}
        >
          <div className="card">
            <h1 style={{ marginBottom: "1rem" }}>Edit Profile</h1>

            <div style={{ marginBottom: "1rem" }}>
              <strong>User Hash (immutable)</strong>
              <div
                style={{
                  marginTop: ".5rem",
                  display: "flex",
                  gap: ".5rem",
                  alignItems: "center",
                }}
              >
                <code
                  style={{
                    padding: ".5rem",
                    background: "#f7fafc",
                    wordBreak: "break-all",
                  }}
                >
                  {profile.userHash}
                </code>
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(profile.userHash);
                      alert("User hash copied");
                    } catch {
                      alert("Unable to copy");
                    }
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${step === "personal" ? "active" : ""}`}
                onClick={() => setStep("personal")}
              >
                Personal
              </button>
              <button
                className={`tab ${step === "contact" ? "active" : ""}`}
                onClick={() => setStep("contact")}
              >
                Contact
              </button>
              <button
                className={`tab ${step === "employment" ? "active" : ""}`}
                onClick={() => setStep("employment")}
              >
                Employment
              </button>
            </div>

            {step === "personal" && (
              <div>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    name="firstName"
                    value={profile.firstName}
                    onChange={onChange}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    value={profile.lastName}
                    onChange={onChange}
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profile.dateOfBirth}
                    onChange={onChange}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: ".5rem",
                  }}
                >
                  <button className="btn btn-primary" onClick={onNext}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === "contact" && (
              <div>
                <div className="form-group">
                  <label>Mobile No.</label>
                  <input
                    name="mobile"
                    value={profile.mobile}
                    onChange={onChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={onChange}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    name="address"
                    value={profile.address}
                    onChange={onChange}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: ".5rem",
                  }}
                >
                  <button className="btn" onClick={() => setStep("personal")}>
                    Back
                  </button>
                  <button className="btn btn-primary" onClick={onNext}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === "employment" && (
              <div>
                <div className="form-group">
                  <label>Job Designation</label>
                  <input
                    name="jobDesignation"
                    value={profile.jobDesignation}
                    onChange={onChange}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    name="department"
                    value={profile.department}
                    onChange={onChange}
                  />
                </div>
                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    name="employeeId"
                    value={profile.employeeId}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group">
                  <label>Upload Employment Document (PDF)</label>
                  <input type="file" accept=".pdf" onChange={onFile} />
                </div>

                {isHashing && (
                  <div style={{ margin: "1rem 0" }}>
                    <span className="spinner"></span> Uploading and hashing...
                  </div>
                )}

                {profile.documentHash && (
                  <div style={{ margin: "1rem 0" }}>
                    <strong>Document Hash:</strong>
                    <code
                      style={{
                        background: "#f7fafc",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        wordBreak: "break-all",
                        display: "block",
                        marginTop: ".5rem",
                      }}
                    >
                      {profile.documentHash}
                    </code>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: ".5rem",
                    marginTop: "1rem",
                  }}
                >
                  <button className="btn" onClick={() => setStep("contact")}>
                    Back
                  </button>
                  <button className="btn btn-primary" onClick={onSave}>
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
