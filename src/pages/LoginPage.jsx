import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      setError("Failed to log in. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      background: theme.background, 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "2rem",
      transition: "background-color 0.3s ease"
    }}>
      <div style={{
        background: theme.cardBackground,
        padding: "3rem",
        borderRadius: "20px",
        boxShadow: theme.shadow,
        border: `1px solid ${theme.cardBorder}`,
        width: "100%",
        maxWidth: "400px",
        transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          marginBottom: "2rem",
          color: theme.accent,
          fontSize: "2rem",
          transition: "color 0.3s ease"
        }}>
          Welcome Back
        </h1>

        {error && (
          <div style={{
            background: theme.danger,
            color: "#fff",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              color: theme.textSecondary,
              fontWeight: "600",
              transition: "color 0.3s ease"
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.8rem",
                borderRadius: "8px",
                border: `1px solid ${theme.inputBorder}`,
                background: theme.inputBackground,
                color: theme.text,
                fontSize: "1rem",
                boxSizing: "border-box",
                transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease"
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              color: theme.textSecondary,
              fontWeight: "600",
              transition: "color 0.3s ease"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.8rem",
                borderRadius: "8px",
                border: `1px solid ${theme.inputBorder}`,
                background: theme.inputBackground,
                color: theme.text,
                fontSize: "1rem",
                boxSizing: "border-box",
                transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease"
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "1rem",
              background: loading ? theme.textMuted : theme.primary,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s ease"
            }}
            onMouseOver={e => {
              if (!loading) e.currentTarget.style.background = theme.primaryHover;
            }}
            onMouseOut={e => {
              if (!loading) e.currentTarget.style.background = theme.primary;
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div style={{ 
          textAlign: "center", 
          marginTop: "2rem",
          color: theme.textSecondary,
          transition: "color 0.3s ease"
        }}>
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            style={{
              background: "none",
              border: "none",
              color: theme.accent,
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              textDecoration: "underline",
              transition: "color 0.2s ease"
            }}
            onMouseOver={e => e.currentTarget.style.color = theme.primary}
            onMouseOut={e => e.currentTarget.style.color = theme.accent}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
} 