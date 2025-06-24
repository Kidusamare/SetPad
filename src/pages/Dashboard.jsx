import React from "react";
import { useNavigate } from "react-router-dom";
import SavedTablesPage from "../components/SavedTablesPage";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleOpenSaved = () => {
    navigate("/log");
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#f5f6fa", padding: "2rem" }}>
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
