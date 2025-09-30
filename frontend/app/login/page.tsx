"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Layout from "../../components/Layout";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (activeTab === "register") {
        if (formData.password !== formData.confirmPassword) {
          setMessage("Passwords do not match");
          setLoading(false);
          return;
        }
        await register(formData.email, formData.password);
        setMessage("Registration successful. Please login.");
        setActiveTab("login");
        setFormData({
          email: formData.email,
          password: "",
          confirmPassword: "",
        });
      } else {
        // --- CORRECTED LOGIN & REDIRECT LOGIC ---
        // The login function in AuthContext returns the user profile on success.
        const profile = await login(formData.email, formData.password);
        setMessage("Login successful! Redirecting...");

        // Use the returned profile data to decide where to redirect.
        // This avoids the timing issue of fetching again on the profile page.
        if (profile && (profile.firstName || profile.lastName)) {
          router.push("/profile/info");
        } else {
          router.push("/profile/edit");
        }
      }
    } catch (error: any) {
      setMessage(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Layout>
      <div
        className="container"
        style={{ maxWidth: "500px", margin: "4rem auto" }}
      >
        <div className="card">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`tab ${activeTab === "register" ? "active" : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          {message && (
            <div
              className={`alert ${
                message.includes("successful") ? "alert-success" : "alert-error"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {activeTab === "register" && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading && <span className="spinner"></span>}
              {activeTab === "login" ? "Login" : "Register"}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: "2rem",
              padding: "1rem",
              background: "#f7fafc",
              borderRadius: "4px",
            }}
          >
            <p style={{ marginBottom: "1rem" }}>Or connect with MetaMask</p>
            <button className="btn btn-secondary" style={{ width: "100%" }}>
              🦊 Connect MetaMask (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

