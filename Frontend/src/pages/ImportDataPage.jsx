import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

// Simplified API call to upload the file
async function importDataAPI(file) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/import-data`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json();
      return { 
        success: false, 
        message: errorData.detail || "Import failed." 
      };
    }
    const data = await res.json();
    return { 
      success: true, 
      message: data.message || "Import successful!",
      tables: data.tables || [],
      total_found: data.total_found || 0,
      successful: data.successful || 0
    };
  } catch (err) {
    return { 
      success: false, 
      message: "Network error. Make sure the backend server is running." 
    };
  }
}

const ImportDataPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [importedTables, setImportedTables] = useState([]);
  const [importStats, setImportStats] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
    setImportedTables([]);
    setImportStats(null);
  };

  const handleImport = async () => {
    if (!file) {
      setStatus("Please select a file.");
      return;
    }
    
    setIsLoading(true);
    setStatus("🤖 AI is analyzing your bulk workout data...");
    
    try {
      const result = await importDataAPI(file);
      if (result.success) {
        setStatus(result.message);
        setImportedTables(result.tables || []);
        setImportStats({
          total_found: result.total_found || 0,
          successful: result.successful || 0
        });
      } else {
        setStatus(`Error: ${result.message}`);
      }
    } catch (err) {
      setStatus("Error importing file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTable = (tableId) => {
    navigate(`/log/${tableId}`);
  };

  const handleGoBack = () => {
    console.log("ImportDataPage: Attempting to navigate to /log");
    console.log("Current location:", window.location.pathname);
    
    try {
      navigate("/log", { replace: true });
      console.log("Navigate function called successfully");
      
      // Double-check navigation worked
      setTimeout(() => {
        console.log("After navigation, location is:", window.location.pathname);
        if (window.location.pathname === "/import-data") {
          console.log("Navigation failed, forcing redirect");
          window.location.replace("/log");
        }
      }, 200);
    } catch (error) {
      console.error("Navigation failed with error:", error);
      window.location.replace("/log");
    }
  };

  return (
    <div style={{
      background: theme.background,
      minHeight: "100vh",
      color: theme.text,
      padding: "2rem",
      paddingTop: "3rem",
      transition: "background-color 0.3s, color 0.3s"
    }}>
      {/* Back Button */}
      <button
        onClick={handleGoBack}
        style={{
          background: theme.surfaceSecondary,
          color: theme.textSecondary,
          border: `1px solid ${theme.border}`,
          borderRadius: "8px",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          marginBottom: "2rem",
          transition: "all 0.3s ease"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = theme.surfaceTertiary;
          e.currentTarget.style.color = theme.text;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = theme.surfaceSecondary;
          e.currentTarget.style.color = theme.textSecondary;
        }}
      >
        ← Back to Saved Logs
      </button>

      <h1 style={{ 
        color: theme.accent, 
        marginBottom: "2rem", 
        textAlign: "center" 
      }}>
        🤖 AI-Powered Workout Import
      </h1>
      
      <div style={{
        background: theme.cardBackground,
        borderRadius: "16px",
        padding: "2rem",
        maxWidth: "500px",
        margin: "0 auto",
        boxShadow: theme.shadowLight,
        border: `1px solid ${theme.cardBorder}`
      }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ 
            fontWeight: 600, 
            color: theme.textSecondary,
            display: "block",
            marginBottom: "0.5rem"
          }}>
            Select your workout data file:
          </label>
          <p style={{ 
            fontSize: "0.9rem", 
            color: theme.textMuted,
            marginBottom: "1rem",
            lineHeight: "1.4"
          }}>
            Upload bulk workout data files (CSV, TXT, JSON). Our AI will automatically detect multiple workout sessions and create separate workout logs for each.
          </p>
          <input
            type="file"
            accept=".csv,.txt,.json"
            onChange={handleFileChange}
            disabled={isLoading}
            style={{ 
              display: "block", 
              margin: "1rem 0",
              width: "100%",
              padding: "0.5rem",
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: "8px",
              background: theme.inputBackground,
              color: theme.text
            }}
          />
        </div>

        <button
          onClick={handleImport}
          disabled={!file || isLoading}
          style={{
            background: (!file || isLoading) ? theme.surfaceSecondary : theme.accent,
            color: (!file || isLoading) ? theme.textMuted : theme.background,
            border: "none",
            borderRadius: "8px",
            padding: "1rem 2rem",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: (!file || isLoading) ? "not-allowed" : "pointer",
            width: "100%",
            transition: "all 0.3s ease"
          }}
        >
          {isLoading ? "Processing..." : "Import with AI"}
        </button>

        {status && (
          <div style={{ 
            marginTop: "1.5rem", 
            padding: "1rem",
            background: importedTables.length > 0 ? theme.accentSecondary : theme.surfaceSecondary,
            borderRadius: "8px",
            color: importedTables.length > 0 ? theme.accent : theme.textSecondary,
            fontWeight: "500"
          }}>
            {status}
            {importStats && (
              <div style={{ 
                marginTop: "0.5rem", 
                fontSize: "0.9rem",
                opacity: 0.8
              }}>
                Found {importStats.total_found} potential session(s), successfully imported {importStats.successful}
              </div>
            )}
          </div>
        )}

        {/* Show imported tables */}
        {importedTables.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h3 style={{ 
              color: theme.accent, 
              marginBottom: "1rem",
              fontSize: "1.1rem"
            }}>
              Imported Workout Sessions ({importedTables.length}):
            </h3>
            {importedTables.map((table, index) => (
              <div
                key={table.id}
                style={{
                  background: theme.surfaceSecondary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "0.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", color: theme.text }}>
                    {table.name}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: theme.textSecondary }}>
                    {table.date}
                  </div>
                </div>
                <button
                  onClick={() => handleViewTable(table.id)}
                  style={{
                    background: theme.accent,
                    color: theme.background,
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.5rem 1rem",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  View →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportDataPage; 