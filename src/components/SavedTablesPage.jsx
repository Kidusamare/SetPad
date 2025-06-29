import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import TrainingLogManager from "./TrainingLogManager";

const manager = new TrainingLogManager();

export default function SavedTablesPage({ previewMode = false }) {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [tables, setTables] = useState([]);
    const [isHoveringNewLog, setIsHoveringNewLog] = useState(false);
    const [showBackButton, setShowBackButton] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [deletePopup, setDeletePopup] = useState({ show: false, tableId: null, tableName: "" });

    useEffect(() => {
        const fetchTables = async () => {
            const result = await manager.listTables();
            setTables(result);
        };
        fetchTables();
    }, []);

    // Scroll detection for back button
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Show button if at top of page or scrolling up
            const isAtTop = currentScrollY < 50;
            const isScrollingUp = currentScrollY < lastScrollY;
            
            setShowBackButton(isAtTop || isScrollingUp);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const handleNewTable = async () => {
        const newTable = manager.createNewTable();
        await manager.saveTable(newTable);
        navigate(`/log/${newTable.id}`);
    };

    const handleOpenTable = (id) => {
        navigate(`/log/${id}`);
    };

    const handleDeleteTable = async (id, tableName) => {
        setDeletePopup({ show: true, tableId: id, tableName: tableName });
    };

    const confirmDelete = async () => {
        if (deletePopup.tableId) {
            await manager.deleteTable(deletePopup.tableId);
            setTables((prev) => prev.filter((table) => table.id !== deletePopup.tableId));
            setDeletePopup({ show: false, tableId: null, tableName: "" });
        }
    };

    const cancelDelete = () => {
        setDeletePopup({ show: false, tableId: null, tableName: "" });
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
                        transition: "all 0.3s ease",
                        opacity: showBackButton ? 1 : 0,
                        transform: showBackButton ? "translateY(0)" : "translateY(-10px)",
                        pointerEvents: showBackButton ? "auto" : "none"
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
                        marginBottom: "2rem",
                        color: theme.accent,
                        textAlign: "center",
                        transition: "color 0.3s ease"
                    }}>
                        Saved Training Logs
                    </h1>
                    
                    {/* New Log Button with new style */}
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: "2rem"
                    }}>
                        <div style={{
                            position: "relative",
                            width: "160px",
                            height: "60px",
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
                        onClick={handleNewTable}
                        >
                            <span style={{
                                position: "absolute",
                                width: "100%",
                                top: isHoveringNewLog ? "-100%" : "50%",
                                left: 0,
                                transform: "translateY(-50%)",
                                fontSize: "14px",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                color: "#fff",
                                fontWeight: "600",
                                textAlign: "center",
                                transition: "top 0.5s ease"
                            }}>
                                + New Log
                            </span>
                            <span style={{
                                position: "absolute",
                                width: "100%",
                                top: isHoveringNewLog ? "50%" : "150%",
                                left: 0,
                                transform: "translateY(-50%)",
                                fontSize: "14px",
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
                                    onClick={() => handleDeleteTable(table.id, table.tableName)}
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

            {/* Delete Confirmation Popup */}
            {deletePopup.show && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2000,
                    padding: "1rem"
                }}
                onClick={cancelDelete}
                >
                    <div style={{
                        background: theme.cardBackground,
                        borderRadius: "16px",
                        padding: "2rem",
                        maxWidth: "90vw",
                        width: "400px",
                        border: `1px solid ${theme.cardBorder}`,
                        boxShadow: theme.shadow,
                        animation: "popupSlideIn 0.3s ease-out"
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "1.5rem",
                            gap: "1rem"
                        }}>
                            <div style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                background: "rgba(239, 68, 68, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid rgba(239, 68, 68, 0.3)"
                            }}>
                                <span style={{ fontSize: "1.5rem", color: "#ef4444" }}>⚠️</span>
                            </div>
                            <div>
                                <h3 style={{
                                    margin: 0,
                                    color: theme.text,
                                    fontSize: "1.3rem",
                                    fontWeight: "600"
                                }}>
                                    Delete Log
                                </h3>
                                <p style={{
                                    margin: "0.5rem 0 0 0",
                                    color: theme.textSecondary,
                                    fontSize: "0.9rem"
                                }}>
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>

                        <div style={{
                            background: theme.surfaceSecondary,
                            padding: "1rem",
                            borderRadius: "8px",
                            marginBottom: "1.5rem",
                            border: `1px solid ${theme.borderLight}`
                        }}>
                            <p style={{
                                margin: 0,
                                color: theme.text,
                                fontSize: "1rem",
                                lineHeight: "1.5"
                            }}>
                                Are you sure you want to delete <strong>"{deletePopup.tableName}"</strong>?
                            </p>
                            <p style={{
                                margin: "0.5rem 0 0 0",
                                color: theme.textSecondary,
                                fontSize: "0.9rem",
                                lineHeight: "1.4"
                            }}>
                                All workout data in this log will be permanently removed.
                            </p>
                        </div>

                        <div style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "flex-end"
                        }}>
                            <button
                                onClick={cancelDelete}
                                style={{
                                    background: theme.surfaceSecondary,
                                    color: theme.textSecondary,
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: "8px",
                                    padding: "0.8rem 1.5rem",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "1rem",
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
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    background: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "0.8rem 1.5rem",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "1rem",
                                    transition: "background 0.2s ease"
                                }}
                                onMouseOver={e => e.currentTarget.style.background = "#dc2626"}
                                onMouseOut={e => e.currentTarget.style.background = "#ef4444"}
                            >
                                Delete Log
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
