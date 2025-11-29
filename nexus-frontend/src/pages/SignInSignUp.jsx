import React, { useState } from "react";
import "../styles/theme.css";
import "../styles/glass.css";
import "../styles/forms.css";
import NeonButton from "../components/NeonButton";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

// Helper: password strength
function getPasswordStrength(password) {
  if (!password) return { strength: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++; // symbol
  
  if (score <= 2) return { strength: 1, label: "Weak" };
  if (score <= 4) return { strength: 2, label: "Medium" };
  return { strength: 3, label: "Strong" };
}

export default function SignInSignUp() {
  const [mode, setMode] = useState(
    window.location.search.includes("signup") ? "signup" : "signin"
  );

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "customer",
  });

  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState([]);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  function switchMode() {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
    setSuccess("");
    setFormErrors([]);
    setForm({
      username: "",
      email: "",
      password: "",
      full_name: "",
      role: "customer",
    });
  }

  function handleInput(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
    setFormErrors([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormErrors([]);

    try {
      let res;

      if (mode === "signup") {
        // --- REGISTER ---
        res = await axios.post("/register/", form);
        
        // Show success message and switch to sign in
        setSuccess("Account created successfully! Please sign in.");
        setMode("signin");
        return; 
      } else {
        // --- LOGIN ---
        res = await axios.post("/login/", {
          email: form.email,
          password: form.password,
        });

        const accessToken = res.data.access;
        const refreshToken = res.data.refresh;

        if (!accessToken || !refreshToken) {
          throw new Error("Tokens not returned from backend");
        }

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        
        // Check if user object exists, otherwise default to customer
        const isSeller = res.data.user?.is_seller;
        localStorage.setItem("role", isSeller ? "seller" : "customer");

        navigate(isSeller ? "/seller/dashboard" : "/customer/dashboard");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      const data = err?.response?.data;
      const status = err?.response?.status;

      // --- DYNAMIC ERROR PARSING ---
      // This section collects specific field errors (like 'username' or 'email' already exists) 
      // which should be displayed in the 'formErrors' list.
      if (typeof data === "object" && data !== null) {
        let collectedErrors = [];
        let hasSpecificError = false;

        // Loop through every key in the error response (e.g., "username": ["Error msg"])
        Object.keys(data).forEach((field) => {
          const errorValue = data[field];

          if (Array.isArray(errorValue)) {
            // It's a list of errors for a specific field (e.g., email, username, password)
            
            // If the error message is specific (like "A user with that email already exists."), 
            // display it more clearly.
            if (field === 'email' && errorValue[0].toLowerCase().includes('already exists')) {
                 collectedErrors.push(`Email: ${errorValue[0]}`);
            } else if (field === 'username' && errorValue[0].toLowerCase().includes('already exists')) {
                 collectedErrors.push(`Username: ${errorValue[0]}`);
            } else {
                 collectedErrors.push(...errorValue);
            }
            hasSpecificError = true;

          } else if (typeof errorValue === "string") {
            // It's a single string, e.g., "Invalid credentials"
            // This is often for login failures (detail) or non-field errors
            setError(errorValue);
            hasSpecificError = true;
          }
        });

        if (collectedErrors.length > 0) {
          setFormErrors(collectedErrors);
          return;
        }
        
        // If data.detail was set as a generic error, stop here
        if (error) {
            return;
        }
      }

      // --- FALLBACK ERRORS for general issues (login failure, network, server error) ---
      if (status === 401 || (status === 400 && mode === 'signin')) {
          // 401 or 400 status on login usually means invalid credentials
          setError("Sign in failed: Invalid email or password. Please check your input.");
      } else if (status === 400 && mode === 'signup') {
          // 400 status on signup without specific field errors is usually a missing field
          setError("Sign up failed: Please check all required fields.");
      } else if (status >= 500) {
          setError("Server error: The server encountered an issue. Please try again later.");
      } else {
          // Generic network or unexpected error
          setError("Authentication failed: Check your input and network connection.");
      }
    }
  }

  const passwordStrength =
    mode === "signup" ? getPasswordStrength(form.password) : { strength: 0, label: "" };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        className="glass-card"
        style={{ maxWidth: 430, width: "100%" }}
        onSubmit={handleSubmit}
      >
        <h2 style={{ fontSize: "2rem", marginBottom: "0.5em" }}>
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h2>

        {/* --- SUCCESS MESSAGE --- */}
        {success && (
          <div style={{ color: "#4ef54e", marginBottom: "1em", fontWeight: "bold", textAlign: "center" }}>
            {success}
          </div>
        )}

        {/* --- GENERAL ERROR --- */}
        {error && (
          <div style={{ color: "#ff4d4d", marginBottom: "1em", textAlign: "center" }}>
            {error}
          </div>
        )}

        {/* --- DETAILED FIELD ERRORS (Username/Email/Password Specific) --- */}
        {formErrors.length > 0 && (
          <div style={{
            background: "rgba(255, 77, 77, 0.1)",
            border: "1px solid rgba(255, 77, 77, 0.3)",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "1.5em"
          }}>
            <ul style={{
              color: "#ff8080",
              textAlign: "left",
              margin: 0,
              paddingLeft: "1.2em"
            }}>
              {formErrors.map((msg, idx) => (
                <li key={idx} style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
                  {msg}
                </li>
              ))}
            </ul>
          </div>
        )}

        {mode === "signup" && (
          <>
            <label>Username</label>
            <input
              name="username"
              type="text"
              required
              value={form.username}
              onChange={handleInput}
              autoComplete="username"
            />

            <label>Full Name</label>
            <input
              name="full_name"
              type="text"
              required
              value={form.full_name}
              onChange={handleInput}
              autoComplete="name"
            />

            <label>Role</label>
            <select name="role" value={form.role} onChange={handleInput}>
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
            </select>
          </>
        )}

        <label>Email</label>
        <input
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleInput}
          autoComplete="email"
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleInput}
          autoComplete="new-password"
        />

        {mode === "signup" && (
          <div style={{ marginBottom: "1em" }}>
            <div
              style={{
                height: "7px",
                borderRadius: "4px",
                background: "#232f48",
                width: "100%",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width:
                    passwordStrength.strength === 1
                      ? "33%"
                      : passwordStrength.strength === 2
                      ? "66%"
                      : passwordStrength.strength === 3
                      ? "100%"
                      : "0%",
                  height: "100%",
                  background:
                    passwordStrength.strength === 1
                      ? "#ff3b3b"
                      : passwordStrength.strength === 2
                      ? "#ffe158"
                      : passwordStrength.strength === 3
                      ? "#29cf7c"
                      : "#232f48",
                  transition: "width .2s",
                }}
              ></div>
            </div>
            <span
              style={{
                fontSize: "0.93em",
                marginTop: "3px",
                color:
                  passwordStrength.strength === 1
                    ? "#ff3b3b"
                    : passwordStrength.strength === 2
                    ? "#ffe158"
                    : passwordStrength.strength === 3
                    ? "#29cf7c"
                    : "#aaa",
                fontWeight: "500",
              }}
            >
              {form.password.length > 0 && passwordStrength.label}
            </span>
          </div>
        )}

        <NeonButton
          style={{ width: "50%", marginTop: "0.6em", marginLeft: "25%" }}
          type="submit"
        >
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </NeonButton>

        <div style={{ textAlign: "center", marginTop: "1.3em" }}>
          <button
            type="button"
            style={{
              background: "none",
              color: "#38bdf8",
              border: "none",
              cursor: "pointer",
            }}
            onClick={switchMode}
          >
            {mode === "signin"
              ? "Don’t have an account? Sign up."
              : "Already have an account? Sign in."}
          </button>
        </div>
      </form>
    </div>
  );
}