"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createFormValidator, VALIDATION_RULES, showGlobalError, clearGlobalError } from "../../../lib/frontendValidation";

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const router = useRouter();
  const formRef = useRef(null);
  const validatorRef = useRef(null);

  // Initialize form validator
  useEffect(() => {
    if (formRef.current) {
      validatorRef.current = createFormValidator(formRef.current, VALIDATION_RULES.SIGNUP);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    clearGlobalError();

    // Validate form
    if (validatorRef.current && !validatorRef.current.validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/Signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include"
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data and token in localStorage for client-side access
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        // Handle different types of errors
        if (data.details && typeof data.details === 'object') {
          // Field-specific errors
          setFieldErrors(data.details);
        } else {
          // Global error
          setError(data.error || "Signup failed");
          showGlobalError(data.error || "Signup failed");
        }
      }
    } catch (err) {
      const errorMessage = "Network error. Please check your connection and try again.";
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-black dark:text-white mb-4 tracking-tight">HANGMAN</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Join the game and start competing</p>
        </div>

        {/* Signup Form */}
        <div className="card-elevated p-8">
          <h2 className="text-2xl font-light mb-8 text-center text-black dark:text-white">
            Create Account
          </h2>

          {/* Error Display */}
          <div id="error-container"></div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black dark:text-white mb-3">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`input-field ${
                  fieldErrors.name ? 'error' : ''
                }`}
                placeholder="Enter your full name"
              />
              {fieldErrors.name && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black dark:text-white mb-3">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`input-field ${
                  fieldErrors.email ? 'error' : ''
                }`}
                placeholder="Enter your email"
              />
              {fieldErrors.email && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black dark:text-white mb-3">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`input-field ${
                  fieldErrors.password ? 'error' : ''
                }`}
                placeholder="Create a password (min 6 characters)"
              />
              {fieldErrors.password && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black dark:text-white mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`input-field ${
                  fieldErrors.confirmPassword ? 'error' : ''
                }`}
                placeholder="Confirm your password"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
            <span className="px-4 text-gray-500 dark:text-gray-500 text-sm font-light">or</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          {/* Guest Mode */}
          <Link
            href="/game?mode=guest"
            className="btn-secondary w-full py-4"
          >
            Play as Guest
          </Link>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
              Already have an account?{" "}
              <Link href="/login" className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 font-medium transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="btn-ghost text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
