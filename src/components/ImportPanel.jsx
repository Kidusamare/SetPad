import React from "react";
import { useTheme } from "../context/ThemeContext";

const ImportPanel = ({ onClick }) => {
  const { theme } = useTheme();
  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        background: theme.cardBackground,
        border: `2px dashed ${theme.accent}`,
        borderRadius: "12px",
        padding: "1.2rem 2rem",
        marginBottom: "2rem",
        maxWidth: "320px",
        boxShadow: theme.shadowLight,
        color: theme.accent,
        fontWeight: 600,
        fontSize: "1.1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.7rem",
        transition: "background 0.2s, border-color 0.2s"
      }}
      onMouseEnter={e => e.currentTarget.style.background = theme.accentSecondary}
      onMouseLeave={e => e.currentTarget.style.background = theme.cardBackground}
    >
      <span>Import Data</span>
    </div>
  );
};

export default ImportPanel; 