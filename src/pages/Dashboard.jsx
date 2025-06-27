import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../utils/auth";
import SavedTablesPage from "../components/SavedTablesPage";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleOpenSaved = () => {
    navigate("/log");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#f5f6fa", padding: "2rem" }}>
      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "2rem",
          right: "2rem",
          background: "#ff4d4f",
          color: "#fff",
          padding: "0.7rem 1.4rem",
          border: "none",
          borderRadius: "10px",
          fontWeight: "600",
          fontSize: "1rem",
          cursor: "pointer",
          zIndex: 10,
          transition: "background 0.2s"
        }}
        onMouseOver={e => e.currentTarget.style.background = "#ff7875"}
        onMouseOut={e => e.currentTarget.style.background = "#ff4d4f"}
      >
        Logout
      </button>

      <div
        onClick={handleOpenSaved}
        style={{
          overflow: "hidden",
          borderRadius: "1rem",
          border: "2px solid #ffd966",
          position: "relative",
          cursor: "pointer",
          transition: "transform 0.3s ease",
          marginBottom: "2rem"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <div style={{ pointerEvents: "none", opacity: 0.8, maxHeight: "400px", overflow: "hidden" }}>
          <SavedTablesPage previewMode={true} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 12,
            background: "#000",
            color: "#ffd966",
            fontWeight: "bold",
            padding: "0.3rem 0.8rem",
            borderRadius: "6px"
          }}
        >
          Open Saved Tables →
        </div>
      </div>

      <h1 style={{ fontSize: "2rem" }}>Welcome to your Dashboard</h1>
      <p style={{ marginTop: "1rem", opacity: 0.7 }}>
        This space will soon show your analytics, recent logs, and suggested training insights.
      </p>
    </div>
  );
}
