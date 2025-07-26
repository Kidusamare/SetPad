import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

// Simplified API call to upload the file with context
async function importDataAPI(file, context = "") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("context", context);
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
  const [context, setContext] = useState("");
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
      const result = await importDataAPI(file, context);
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


  return (
    <div style={{
      background: "var(--gradient-backdrop)",
      minHeight: "100vh",
      color: "var(--primary-100)",
      padding: "var(--space-8)",
      paddingTop: "var(--space-12)"
    }}>
      

      <h1 style={{ 
        color: "var(--accent-primary)", 
        marginBottom: "var(--space-8)", 
        textAlign: "center",
        fontSize: "var(--font-size-4xl)",
        fontWeight: 700,
        letterSpacing: "-0.02em"
      }}>
        🤖 AI-Powered Workout Import
      </h1>
      
      <div style={{
        background: "var(--glass-bg)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-8)",
        maxWidth: "500px",
        margin: "0 auto",
        backdropFilter: "var(--glass-backdrop)",
        WebkitBackdropFilter: "var(--glass-backdrop)",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--glass-border)"
      }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ 
            fontWeight: 600, 
            color: "var(--primary-300)",
            display: "block",
            marginBottom: "var(--space-2)"
          }}>
            Select your workout data file:
          </label>
          <p style={{ 
            fontSize: "var(--font-size-sm)", 
            color: "var(--primary-400)",
            marginBottom: "var(--space-4)",
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
              margin: "var(--space-4) 0",
              width: "100%",
              padding: "var(--space-2)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-md)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "var(--primary-100)"
            }}
          />
        </div>

        <div style={{ marginBottom: "var(--space-6)" }}>
          <label style={{ 
            fontWeight: 600, 
            color: "var(--primary-300)",
            display: "block",
            marginBottom: "var(--space-2)"
          }}>
            Additional context (optional):
          </label>
          <p style={{ 
            fontSize: "var(--font-size-xs)", 
            color: "var(--primary-400)",
            marginBottom: "var(--space-3)",
            lineHeight: "1.4"
          }}>
            Provide any context to help the AI better understand your workout data. For example: training style, weight notation (1p10 = 1 plate + 10lbs), exercise abbreviations, etc.
          </p>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            disabled={isLoading}
            placeholder="e.g., '1p10 means 1 plate plus 10 lbs (45+10=55 lbs). All weights are in lbs. BP = Bench Press, DL = Deadlift...'"
            style={{ 
              width: "100%",
              minHeight: "80px",
              padding: "var(--space-3)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-md)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "var(--primary-100)",
              fontSize: "var(--font-size-sm)",
              resize: "vertical",
              fontFamily: "inherit",
              lineHeight: "1.4",
              outline: "none",
              transition: "border-color var(--transition-normal)"
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--accent-primary)"}
            onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"}
          />
        </div>

        <button
          onClick={handleImport}
          disabled={!file || isLoading}
          style={{
            background: (!file || isLoading) ? "rgba(255, 255, 255, 0.05)" : "var(--gradient-primary)",
            color: (!file || isLoading) ? "var(--primary-500)" : "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-4) var(--space-8)",
            fontWeight: 600,
            fontSize: "var(--font-size-base)",
            cursor: (!file || isLoading) ? "not-allowed" : "pointer",
            width: "100%",
            transition: "all var(--transition-normal)"
          }}
        >
          {isLoading ? "Processing..." : "Import with AI"}
        </button>

        {status && (
          <div style={{ 
            marginTop: "var(--space-6)", 
            padding: "var(--space-4)",
            background: importedTables.length > 0 ? "rgba(0, 212, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
            borderRadius: "var(--radius-md)",
            color: importedTables.length > 0 ? "var(--accent-primary)" : "var(--primary-400)",
            fontWeight: "500",
            border: importedTables.length > 0 ? "1px solid var(--accent-primary)" : "1px solid var(--glass-border)"
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