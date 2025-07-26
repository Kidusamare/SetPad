import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import TrainingLogManager from "./TrainingLogManager";
import { SkeletonLoader } from "./LoadingSpinner";
import { DataExportService } from "../services/dataExport";
import SearchComponent from "./SearchComponent";

const manager = new TrainingLogManager();

export default function SavedTablesPage({ previewMode = false }) {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHoveringNewLog, setIsHoveringNewLog] = useState(false);
    const [showBackButton, setShowBackButton] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [deletePopup, setDeletePopup] = useState({ show: false, tableId: null, tableName: "" });
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                setIsLoading(true);
                const result = await manager.listTables();
                setTables(result);
            } catch (error) {
                console.error("Error fetching tables:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTables();
    }, []);

    // Window resize detection
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
        await manager.createTable(newTable);
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

    const handleExportAllWorkouts = async () => {
        try {
            if (tables.length === 0) return;
            
            // Load full workout data for all tables
            const fullWorkouts = await Promise.all(
                tables.map(async (table) => {
                    const fullTable = await manager.loadTable(table.id);
                    return {
                        ...fullTable,
                        date: table.date,
                        tableName: table.tableName
                    };
                })
            );
            
            await DataExportService.exportAllWorkoutsToCSV(fullWorkouts, 'all_workouts');
        } catch (error) {
            console.error('Error exporting workouts:', error);
            alert('Failed to export workouts. Please try again.');
        }
    };

    const handleExportToPDF = async () => {
        try {
            if (tables.length === 0) return;
            
            // Load full workout data for all tables
            const fullWorkouts = await Promise.all(
                tables.map(async (table) => {
                    const fullTable = await manager.loadTable(table.id);
                    return {
                        ...fullTable,
                        date: table.date,
                        tableName: table.tableName
                    };
                })
            );
            
            await DataExportService.exportToPDF(fullWorkouts, 'workout_report');
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            alert('Failed to export to PDF. Please try again.');
        }
    };

    const handleExportSingleWorkout = async (tableId, tableName) => {
        try {
            const fullTable = await manager.loadTable(tableId);
            const table = tables.find(t => t.id === tableId);
            const workoutData = {
                ...fullTable,
                date: table.date,
                tableName: table.tableName
            };
            
            await DataExportService.exportWorkoutToCSV(workoutData);
        } catch (error) {
            console.error('Error exporting workout:', error);
            alert('Failed to export workout. Please try again.');
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
                padding: windowWidth <= 768 ? "1rem" : "2rem",
                paddingTop: previewMode ? "1rem" : (windowWidth <= 768 ? "3rem" : "4rem"),
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
                    className="notes-nav-item"
                    onClick={() => navigate("/")}
                    style={{
                        position: "fixed",
                        top: "20px",
                        left: "20px",
                        zIndex: 1000,
                        opacity: showBackButton ? 1 : 0,
                        transform: showBackButton ? "translateY(0)" : "translateY(-10px)",
                        pointerEvents: showBackButton ? "auto" : "none",
                        background: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                        fontSize: "0.9rem"
                    }}
                >
                    ← Back to Dashboard
                </button>
            )}

            {!previewMode && (
                <>
                    <h1 style={{ 
                        fontSize: windowWidth <= 768 ? "2rem" : "2.5rem", 
                        marginBottom: windowWidth <= 768 ? "1.5rem" : "2rem",
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
                            width: windowWidth <= 768 ? "140px" : "160px",
                            height: windowWidth <= 768 ? "50px" : "60px",
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
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

                    {/* Export Buttons */}
                    {tables.length > 0 && (
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "1rem",
                            marginBottom: "2rem",
                            flexWrap: "wrap"
                        }}>
                            <button
                                onClick={handleExportAllWorkouts}
                                style={{
                                    background: theme.surfaceSecondary,
                                    color: theme.accent,
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: "12px",
                                    padding: windowWidth <= 768 ? "0.6rem 1rem" : "0.8rem 1.5rem",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: windowWidth <= 768 ? "0.9rem" : "1rem",
                                    transition: "all 0.3s ease",
                                    minHeight: "44px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem"
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.background = theme.surfaceTertiary;
                                    e.currentTarget.style.borderColor = theme.accent;
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = theme.surfaceSecondary;
                                    e.currentTarget.style.borderColor = theme.border;
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                📊 Export CSV
                            </button>
                            <button
                                onClick={handleExportToPDF}
                                style={{
                                    background: theme.surfaceSecondary,
                                    color: theme.accent,
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: "12px",
                                    padding: windowWidth <= 768 ? "0.6rem 1rem" : "0.8rem 1.5rem",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: windowWidth <= 768 ? "0.9rem" : "1rem",
                                    transition: "all 0.3s ease",
                                    minHeight: "44px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem"
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.background = theme.surfaceTertiary;
                                    e.currentTarget.style.borderColor = theme.accent;
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = theme.surfaceSecondary;
                                    e.currentTarget.style.borderColor = theme.border;
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                📄 Export PDF
                            </button>
                        </div>
                    )}
                </>
            )}

            {isLoading ? (
                <SkeletonLoader type="card" count={3} />
            ) : tables.length === 0 ? (
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
                <div className="notes-list">
                    {tables.map((table) => (
                        <div
                            key={table.id}
                            className="notes-list-item"
                            style={{
                                display: "flex",
                                flexDirection: windowWidth <= 480 ? "column" : "row",
                                justifyContent: "space-between",
                                alignItems: windowWidth <= 480 ? "stretch" : "center",
                                gap: windowWidth <= 480 ? "1rem" : "0"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-4px)";
                                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.1)";
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
                                    fontSize: windowWidth <= 768 ? "1.1rem" : "1.2rem",
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
                                        {formatDate(table.date)}
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
                                <div style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    alignItems: "center",
                                    flexWrap: "wrap"
                                }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleExportSingleWorkout(table.id, table.tableName);
                                        }}
                                        style={{
                                            background: theme.surfaceSecondary,
                                            color: theme.accent,
                                            border: `1px solid ${theme.border}`,
                                            borderRadius: "8px",
                                            padding: "0.5rem 0.8rem",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            fontSize: "0.8rem",
                                            transition: "all 0.2s ease",
                                            minHeight: "44px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.3rem"
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.background = theme.surfaceTertiary;
                                            e.currentTarget.style.borderColor = theme.accent;
                                            e.currentTarget.style.transform = "translateY(-1px)";
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.background = theme.surfaceSecondary;
                                            e.currentTarget.style.borderColor = theme.border;
                                            e.currentTarget.style.transform = "translateY(0)";
                                        }}
                                    >
                                        📊 Export
                                    </button>
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
                                            fontSize: "0.8rem",
                                            transition: "background 0.2s ease, border-color 0.2s ease",
                                            minHeight: "44px"
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
                                </div>
                            )}
                        </div>
                    ))}
                </div>
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
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "20px",
                        padding: "2rem",
                        maxWidth: "90vw",
                        width: "400px",
                        border: `1px solid rgba(255, 255, 255, 0.1)`,
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                        backdropFilter: "blur(20px)",
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
                                <span style={{ fontSize: "1.5rem", color: "#ef4444" }}>!</span>
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
