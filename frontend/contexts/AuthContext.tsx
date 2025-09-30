"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

// Define a type for your user profile data for better type safety
interface UserProfile {
  firstName?: string;
  lastName?: string;
  email: string;
  // Add other profile fields as needed
}

// [+] Define the API URL from environment variables
const API = process.env.NEXT_PUBLIC_API_URL;

interface AuthContextType {
  user: UserProfile | null; // Use the UserProfile type
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>; // Return the profile
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- NEW: Check for existing session on component mount ---
    const checkUserSession = async () => {
      if (!API) {
        setLoading(false);
        return;
      }
      try {
        // This endpoint will succeed if the cookie is valid
        const response = await fetch(`${API}/me/`, {
          credentials: "include", // Important: sends the cookie
        });

        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            setUser(data.profile); // Set user state if session is valid
          }
        }
      } catch (error) {
        // It's okay if this fails, it just means no active session
        console.log("No active session found.");
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    if (!API) throw new Error("API URL not configured");

    const response = await fetch(`${API}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Ensure cookies are handled
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.detail || data.error || "Login failed");
    }

    // --- CRITICAL FIX: Set the user state after a successful login ---
    setUser(data.profile);

    return data.profile;
  };

  const register = async (email: string, password: string) => {
    if (!API) {
      throw new Error("API URL not configured. Please check your .env.local file.");
    }
    const response = await fetch(`${API}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Registration failed");
    }
  };

  const logout = async () => {
    setUser(null); // Clear user state immediately
    if (!API) return;
    try {
      await fetch(`${API}/auth/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

