import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import SavedTablesPage from "../components/SavedTablesPage";
import TrainingLogManager from "../components/TrainingLogManager";

const manager = new TrainingLogManager();

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const [isHoveringNewLog, setIsHoveringNewLog] = useState(false);

  const handleOpenSaved = () => {
    navigate("/log");
  };

  const handleNewLog = async () => {
    const newTable = manager.createNewTable();
    await manager.saveTable(newTable);
    navigate(`/log/${newTable.id}`);
  };

  const handleLogout = async () => {
    try {
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <div style={{ 
      background: theme.background, 
      minHeight: "100vh", 
      color: theme.text, 
      padding: "2rem",
      paddingTop: "5rem",
      position: "relative",
      transition: "background-color 0.3s ease, color 0.3s ease"
    }}>
      {/* Settings button */}
      <button
        onClick={handleSettings}
        style={{
          position: "fixed",
          top: "1rem",
          right: "8rem",
          background: theme.accentSecondary,
          color: theme.accent,
          padding: "0.7rem 1.4rem",
          border: "none",
          borderRadius: "10px",
          fontWeight: "600",
          fontSize: "1rem",
          cursor: "pointer",
          zIndex: 1000,
          transition: "background 0.2s ease",
          minWidth: "120px"
        }}
        onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
        onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
      >
        ⚙️ Settings
      </button>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          background: theme.surfaceSecondary,
          color: theme.textSecondary,
          padding: "0.7rem 1.4rem",
          border: `1px solid ${theme.border}`,
          borderRadius: "10px",
          fontWeight: "600",
          fontSize: "1rem",
          cursor: "pointer",
          zIndex: 1000,
          transition: "background 0.2s ease, border-color 0.2s ease",
          minWidth: "100px"
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = theme.surfaceTertiary;
          e.currentTarget.style.borderColor = theme.accent;
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = theme.surfaceSecondary;
          e.currentTarget.style.borderColor = theme.border;
        }}
      >
        Logout
      </button>

      <h1 style={{ 
        fontSize: "2.5rem", 
        marginBottom: "2rem",
        color: theme.accent,
        textAlign: "center",
        transition: "color 0.3s ease"
      }}>
        Welcome to your Dashboard
      </h1>

      {/* Centered New Log Button */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "3rem"
      }}>
        <div style={{
          position: "relative",
          width: "200px",
          height: "70px",
          background: `linear-gradient(to top, ${theme.accentSecondary}, ${theme.accent}, ${theme.accentHover})`,
          borderRadius: "50px",
          border: "none",
          outline: "none",
          cursor: "pointer",
          boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          transition: "transform 0.3s ease"
        }}
        onMouseEnter={() => setIsHoveringNewLog(true)}
        onMouseLeave={() => setIsHoveringNewLog(false)}
        onClick={handleNewLog}
        >
          <span style={{
            position: "absolute",
            width: "100%",
            top: isHoveringNewLog ? "-100%" : "50%",
            left: 0,
            transform: "translateY(-50%)",
            fontSize: "16px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "#fff",
            fontWeight: "600",
            textAlign: "center",
            transition: "top 0.5s ease"
          }}>
            New Log
          </span>
          <span style={{
            position: "absolute",
            width: "100%",
            top: isHoveringNewLog ? "50%" : "150%",
            left: 0,
            transform: "translateY(-50%)",
            fontSize: "16px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "#fff",
            fontWeight: "600",
            textAlign: "center",
            transition: "top 0.5s ease"
          }}>
            Let's Begin
          </span>
        </div>
      </div>

      <div
        onClick={handleOpenSaved}
        style={{
          overflow: "hidden",
          borderRadius: "1rem",
          border: `2px solid ${theme.accent}`,
          position: "relative",
          cursor: "pointer",
          transition: "transform 0.3s ease, border-color 0.3s ease",
          marginBottom: "2rem"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <div style={{ 
          pointerEvents: "none", 
          opacity: 0.8, 
          maxHeight: "400px", 
          overflow: "hidden" 
        }}>
          <SavedTablesPage previewMode={true} />
        </div>
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            background: theme.background,
            color: theme.accent,
            fontWeight: "bold",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            fontSize: "0.9rem",
            transition: "background-color 0.3s ease, color 0.3s ease"
          }}
        >
          Open Saved Logs →
        </div>
      </div>

      <p style={{ 
        marginTop: "1rem", 
        opacity: 0.7,
        fontSize: "1.1rem",
        lineHeight: "1.6",
        color: theme.textSecondary,
        transition: "color 0.3s ease",
        textAlign: "center"
      }}>
        This space will soon show your analytics, recent logs, and suggested training insights.
      </p>
    </div>
  );
}
