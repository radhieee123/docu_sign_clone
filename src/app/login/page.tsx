"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setPassword("password123");
      setStep("password");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("password123");
    setStep("password");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <header className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-gray-800">docusign</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-[556px] bg-white rounded-lg shadow-sm p-8">
          <div className="mb-12">
            <h1 className="text-2xl font-normal text-gray-800 mb-[1rem]">
              Log in to Docusign
            </h1>
            <p className="text-sm text-gray-600 mt-[1rem]">
              {step === "email"
                ? "Enter your email to log in."
                : "Enter your password."}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleEmailNext} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#1a1464] text-white font-medium rounded-md hover:bg-[#14104d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 transition-colors"
              >
                NEXT
              </button>

              <button
                type="button"
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none transition-colors"
              >
                Sign Up for Free
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter password"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="text-purple-600 hover:text-purple-700"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#1a1464] text-white font-medium rounded-md hover:bg-[#14104d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <span>Powered by</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-sm"></div>
              <span className="font-semibold">docusign</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hover:text-gray-900">English (US) ▼</button>
            <a href="#" className="hover:text-gray-900">
              Contact Us
            </a>
            <a href="#" className="hover:text-gray-900">
              Terms of Use
            </a>
            <a href="#" className="hover:text-gray-900">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-900">
              Intellectual Property
            </a>
            <a href="#" className="hover:text-gray-900">
              Trust
            </a>
          </div>
          <div>
            <span>Copyright © 2025 Docusign, Inc. All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
