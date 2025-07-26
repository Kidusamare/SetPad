import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import TrainingLogManager from "./TrainingLogManager";
import { SkeletonLoader } from "./LoadingSpinner";
import { DataExportService } from "../services/dataExport";

const manager = new TrainingLogManager();

export default function SavedTablesPage({ previewMode = false }) {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, tableId: null, tableName: "" });
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth <= 768;

    const handleNewTable = async () => {
        const newTable = manager.createNewTable();
        await manager.createTable(newTable);
        navigate(`/log/${newTable.id}`);
    };

    const openDeleteModal = (id, tableName) => {
        setDeleteModal({ isOpen: true, tableId: id, tableName });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, tableId: null, tableName: "" });
    };

    const confirmDelete = async () => {
        if (!deleteModal.tableId) return;
        
        try {
            await manager.deleteTable(deleteModal.tableId);
            setTables(prev => prev.filter(table => table.id !== deleteModal.tableId));
            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting table:', error);
            alert('Failed to delete workout. Please try again.');
        }
    };

    const handleExportSingle = async (tableId, tableName) => {
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

    const handleExportAll = async () => {
        if (tables.length === 0) return;
        
        try {
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

    const handleExportPDF = async () => {
        if (tables.length === 0) return;
        
        try {
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
        <div className="saved-tables-container">
            <style jsx>{`
                .saved-tables-container {
                    min-height: ${previewMode ? 'auto' : '100vh'};
                    padding: ${isMobile ? 'var(--space-4)' : 'var(--space-8)'};
                    padding-top: ${previewMode ? 'var(--space-4)' : (isMobile ? 'var(--space-12)' : 'var(--space-16)')};
                    background: var(--gradient-backdrop);
                    color: var(--primary-100);
                    font-family: var(--font-family-primary);
                }

                .back-button {
                    position: fixed;
                    top: var(--space-6);
                    left: var(--space-6);
                    z-index: var(--z-fixed);
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-backdrop);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-3) var(--space-6);
                    color: var(--primary-100);
                    font-weight: 600;
                    text-decoration: none;
                    transition: var(--transition-normal);
                    cursor: pointer;
                }

                .back-button:hover {
                    background: rgba(255, 255, 255, 0.12);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-glow);
                }

                .page-header {
                    text-align: center;
                    margin-bottom: var(--space-12);
                }

                .page-title {
                    font-size: ${isMobile ? 'var(--font-size-3xl)' : 'var(--font-size-5xl)'};
                    font-weight: 700;
                    margin-bottom: var(--space-4);
                    background: linear-gradient(45deg, var(--accent-primary), var(--primary-100));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .create-button {
                    background: var(--gradient-primary);
                    border: none;
                    border-radius: var(--radius-xl);
                    padding: var(--space-4) var(--space-8);
                    color: white;
                    font-weight: 700;
                    font-size: var(--font-size-lg);
                    cursor: pointer;
                    transition: var(--transition-normal);
                    box-shadow: var(--shadow-glow);
                    margin-bottom: var(--space-8);
                }

                .create-button:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-glow-strong);
                }

                .export-actions {
                    display: flex;
                    justify-content: center;
                    gap: var(--space-4);
                    margin-bottom: var(--space-12);
                    flex-wrap: wrap;
                }

                .export-btn {
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-backdrop);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-3) var(--space-6);
                    color: var(--primary-100);
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition-normal);
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                }

                .export-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .tables-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(${isMobile ? '280px' : '350px'}, 1fr));
                    gap: var(--space-6);
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .table-card {
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-backdrop);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-2xl);
                    padding: var(--space-6);
                    transition: var(--transition-normal);
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }

                .table-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--gradient-primary);
                }

                .table-card:hover {
                    transform: translateY(-8px);
                    background: rgba(255, 255, 255, 0.12);
                    box-shadow: var(--shadow-xl);
                    border-color: var(--accent-primary);
                }

                .card-content {
                    margin-bottom: var(--space-6);
                }

                .table-name {
                    font-size: var(--font-size-xl);
                    font-weight: 700;
                    margin-bottom: var(--space-2);
                    color: var(--primary-100);
                }

                .table-date {
                    color: var(--accent-primary);
                    font-size: var(--font-size-sm);
                    margin-bottom: var(--space-1);
                    font-weight: 600;
                }

                .table-last-opened {
                    color: var(--primary-300);
                    font-size: var(--font-size-xs);
                }

                .card-actions {
                    display: flex;
                    gap: var(--space-3);
                    justify-content: flex-end;
                }

                .action-btn {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-md);
                    padding: var(--space-2) var(--space-4);
                    color: var(--primary-200);
                    font-size: var(--font-size-xs);
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition-fast);
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                }

                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                    transform: translateY(-1px);
                    color: var(--primary-100);
                }

                .delete-btn {
                    background: rgba(255, 68, 102, 0.1);
                    border-color: rgba(255, 68, 102, 0.2);
                    color: var(--accent-error);
                }

                .delete-btn:hover {
                    background: rgba(255, 68, 102, 0.2);
                    color: white;
                }

                .empty-state {
                    text-align: center;
                    padding: var(--space-16) var(--space-8);
                    color: var(--primary-300);
                }

                .empty-state h3 {
                    font-size: var(--font-size-2xl);
                    margin-bottom: var(--space-4);
                    color: var(--primary-100);
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(10, 11, 15, 0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: var(--z-modal-backdrop);
                    padding: var(--space-4);
                }

                .modal {
                    background: var(--primary-800);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-2xl);
                    padding: var(--space-8);
                    max-width: 400px;
                    width: 100%;
                    box-shadow: var(--shadow-xl);
                    transform: scale(0.9);
                    animation: modalAppear 0.3s ease forwards;
                }

                @keyframes modalAppear {
                    to {
                        transform: scale(1);
                    }
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    margin-bottom: var(--space-6);
                }

                .modal-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(45deg, var(--accent-error), #dc2626);
                    border-radius: var(--radius-full);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: var(--font-size-2xl);
                    font-weight: bold;
                    box-shadow: var(--shadow-glow);
                }

                .modal-title {
                    font-size: var(--font-size-xl);
                    font-weight: 700;
                    color: var(--primary-100);
                    margin: 0;
                }

                .modal-body {
                    color: var(--primary-300);
                    margin-bottom: var(--space-8);
                    line-height: 1.6;
                    font-size: var(--font-size-sm);
                }

                .modal-actions {
                    display: flex;
                    gap: var(--space-4);
                    justify-content: flex-end;
                }

                .modal-btn {
                    padding: var(--space-3) var(--space-6);
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition-fast);
                    border: none;
                    font-size: var(--font-size-sm);
                }

                .modal-btn-cancel {
                    background: var(--glass-bg);
                    color: var(--primary-200);
                    border: 1px solid var(--glass-border);
                }

                .modal-btn-cancel:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: var(--primary-100);
                }

                .modal-btn-delete {
                    background: var(--accent-error);
                    color: white;
                }

                .modal-btn-delete:hover {
                    background: #dc2626;
                    transform: translateY(-1px);
                }
            `}</style>

            

            {!previewMode && (
                <div className="page-header">
                    <h1 className="page-title">Training Logs</h1>
                    <button className="create-button" onClick={handleNewTable}>
                        + Create New Workout
                    </button>

                    {tables.length > 0 && (
                        <div className="export-actions">
                            <button className="export-btn" onClick={handleExportAll}>
                                📊 Export All CSV
                            </button>
                            <button className="export-btn" onClick={handleExportPDF}>
                                📄 Export PDF Report
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="content">
                {isLoading ? (
                    <SkeletonLoader type="card" count={3} />
                ) : tables.length === 0 ? (
                    <div className="empty-state">
                        <h3>No workout logs yet</h3>
                        <p>Create your first workout to get started!</p>
                    </div>
                ) : (
                    <div className="tables-grid">
                        {tables.map((table) => (
                            <div
                                key={table.id}
                                className="table-card"
                                onClick={() => navigate(`/log/${table.id}`)}
                            >
                                <div className="card-content">
                                    <h3 className="table-name">{table.tableName}</h3>
                                    <div className="table-date">{formatDate(table.date)}</div>
                                    {table.lastOpened && (
                                        <div className="table-last-opened">
                                            Last opened: {formatDate(table.lastOpened)}
                                        </div>
                                    )}
                                </div>

                                {!previewMode && (
                                    <div className="card-actions">
                                        <button
                                            className="action-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleExportSingle(table.id, table.tableName);
                                            }}
                                        >
                                            📊 Export
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteModal(table.id, table.tableName);
                                            }}
                                        >
                                            🗑 Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {deleteModal.isOpen && (
                <div className="modal-overlay" onClick={closeDeleteModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-icon">!</div>
                            <h3 className="modal-title">Delete Workout</h3>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete <strong>"{deleteModal.tableName}"</strong>?
                            <br />
                            This action cannot be undone and all workout data will be permanently removed.
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn modal-btn-cancel" onClick={closeDeleteModal}>
                                Cancel
                            </button>
                            <button className="modal-btn modal-btn-delete" onClick={confirmDelete}>
                                Delete Workout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}