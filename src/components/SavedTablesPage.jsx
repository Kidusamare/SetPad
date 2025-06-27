import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import TrainingLogManager from "./TrainingLogManager";

const manager = new TrainingLogManager();

export default function SavedTablesPage({ previewMode = false }) {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [tables, setTables] = useState([]);

    useEffect(() => {
        const fetchTables = async () => {
            const result = await manager.listTables();
            setTables(result);
        };
        fetchTables();
    }, []);

    const handleNewTable = async () => {
        const newTable = manager.createNewTable();
        await manager.saveTable(newTable);
        navigate(`/log/${newTable.id}`);
    };

    const handleOpenTable = (id) => {
        navigate(`/log/${id}`);
    };

    const handleDeleteTable = async (id) => {
        if (window.confirm("Are you sure you want to delete this log?")) {
            await manager.deleteTable(id);
            setTables((prev) => prev.filter((table) => table.id !== id));
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <div
            style={{
                padding: "2rem",
                paddingTop: previewMode ? "1rem" : "4rem",
                background: theme.background,
                minHeight: previewMode ? "auto" : "100vh",
                color: theme.text,
                position: "relative",
                transition: "background-color 0.3s ease, color 0.3s ease"
            }}
        >
            {/* Back to Dashboard Button */}
            {!previewMode && (
                <button
                    onClick={() => navigate("/")}
                    style={{
                        position: "fixed",
                        top: "1rem",
                        left: "1rem",
                        background: theme.accentSecondary,
                        color: theme.accent,
                        padding: "0.7rem 1.4rem",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "1rem",
                        cursor: "pointer",
                        zIndex: 1000,
                        transition: "background 0.2s ease"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                    onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
                >
                    ← Back to Dashboard
                </button>
            )}

            {!previewMode && (
                <>
                    <h1 style={{ 
                        fontSize: "2.5rem", 
                        marginBottom: "1.5rem",
                        color: theme.accent,
                        transition: "color 0.3s ease"
                    }}>
                        Saved Training Logs
                    </h1>
                    <button
                        onClick={handleNewTable}
                        style={{
                            background: theme.accentSecondary,
                            color: theme.accent,
                            padding: "0.8rem 1.6rem",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: "600",
                            fontSize: "1rem",
                            cursor: "pointer",
                            marginBottom: "2rem",
                            transition: "background 0.2s ease"
                        }}
                        onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                        onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
                    >
                        + New Log
                    </button>
                </>
            )}

            {tables.length === 0 ? (
                <p style={{ 
                    opacity: 0.7,
                    fontSize: "1.1rem",
                    textAlign: "center",
                    marginTop: "2rem",
                    color: theme.textSecondary,
                    transition: "color 0.3s ease"
                }}>
                    No saved logs yet.
                </p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {tables.map((table) => (
                        <li
                            key={table.id}
                            style={{
                                marginBottom: "1rem",
                                padding: "1.5rem",
                                background: theme.cardBackground,
                                borderRadius: "12px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                border: `1px solid ${theme.cardBorder}`,
                                transition: "transform 0.2s, border-color 0.2s, background-color 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.borderColor = theme.accent;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.borderColor = theme.cardBorder;
                            }}
                        >
                            <div 
                                style={{ 
                                    cursor: "pointer",
                                    flex: 1,
                                    paddingRight: "1rem"
                                }} 
                                onClick={() => handleOpenTable(table.id)}
                            >
                                <strong style={{ 
                                    fontSize: "1.2rem",
                                    color: theme.text,
                                    transition: "color 0.3s ease",
                                    display: "block",
                                    marginBottom: "0.5rem"
                                }}>
                                    {table.tableName}
                                </strong>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem"
                                }}>
                                    <span style={{ 
                                        color: theme.accent,
                                        fontSize: "0.9rem",
                                        fontWeight: "600",
                                        transition: "color 0.3s ease"
                                    }}>
                                        📅 {formatDate(table.date)}
                                    </span>
                                    {table.lastOpened && (
                                        <span style={{ 
                                            opacity: 0.7,
                                            color: theme.textSecondary,
                                            fontSize: "0.8rem",
                                            transition: "color 0.3s ease"
                                        }}>
                                            Last opened: {formatDate(table.lastOpened)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {!previewMode && (
                                <button
                                    onClick={() => handleDeleteTable(table.id)}
                                    style={{
                                        background: theme.surfaceSecondary,
                                        color: theme.textSecondary,
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: "8px",
                                        padding: "0.5rem 1rem",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        transition: "background 0.2s ease, border-color 0.2s ease"
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.background = theme.surfaceTertiary;
                                        e.currentTarget.style.borderColor = theme.textMuted;
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.background = theme.surfaceSecondary;
                                        e.currentTarget.style.borderColor = theme.border;
                                    }}
                                >
                                    Delete
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
