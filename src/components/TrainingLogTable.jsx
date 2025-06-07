import React, { useState, useEffect } from "react";
import TrainingLogRow from "./TrainingLogRow";

// Storage service - abstracted for easy backend integration
class TrainingLogStorage {
    constructor() {
        this.storageKey = "training-log-table";
    }

    async save(data) {
        try {
            const validatedData = this.validateTrainingLogData(data);
            localStorage.setItem(this.storageKey, JSON.stringify(validatedData));
            return { success: true, data: validatedData };
        } catch (error) {
            console.error('Failed to save training log:', error);
            return { success: false, error: error.message };
        }
    }

    async load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) return null;
            const parsed = JSON.parse(saved);
            return this.validateTrainingLogData(parsed);
        } catch (error) {
            console.error('Failed to load training log:', error);
            return null;
        }
    }

    async delete() {
        try {
            localStorage.removeItem(this.storageKey);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    validateTrainingLogData(data) {
        const defaultRow = {
            id: 0,
            muscleGroup: "Strength-Focus🏋️",
            exercise: "",
            sets: [
                { reps: "", weight: "" },
                { reps: "", weight: "" }
            ],
            notes: "No notes 😊",
            showNotes: false,
            weightUnit: "lbs"
        };

        const todayString = new Date().toLocaleDateString();

        return {
            tableName: data?.tableName || `Training Log - ${todayString}`,
            date: data?.date || { today: todayString },
            rows: Array.isArray(data?.rows) && data.rows.length > 0
                ? data.rows.map((row, i) => ({ ...defaultRow, ...row, id: i }))
                : [defaultRow]
        };
    }
}

// Business logic manager
class TrainingLogManager {
    constructor() {
        this.storage = new TrainingLogStorage();
    }

    async loadTrainingLog() {
        const data = await this.storage.load();
        return data || this.getDefaultTrainingLog();
    }

    async saveTrainingLog(data) {
        const result = await this.storage.save(data);
        return result;
    }

    getDefaultTrainingLog() {
        const todayString = new Date().toLocaleDateString();
        return {
            tableName: `Training Log - ${todayString}`,
            date: { today: todayString },
            rows: [{
                id: 0,
                muscleGroup: "Strength-Focus🏋️",
                exercise: "",
                sets: [
                    { reps: "", weight: "" },
                    { reps: "", weight: "" }
                ],
                notes: "No notes 😊",
                showNotes: false,
                weightUnit: "lbs"
            }]
        };
    }

    addRow(currentRows) {
        return [
            ...currentRows,
            {
                id: currentRows.length,
                muscleGroup: "Strength-Focus🏋️",
                exercise: "",
                sets: [
                    { reps: "", weight: "" },
                    { reps: "", weight: "" }
                ],
                notes: "No notes 😊",
                showNotes: false,
                weightUnit: "lbs"
            }
        ];
    }

    removeLastRow(currentRows) {
        return currentRows.length > 1 ? currentRows.slice(0, -1) : currentRows;
    }

    updateRow(rows, index, updatedRow) {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], ...updatedRow };
        return newRows;
    }
}

// Singleton instance to share across components
const trainingLogManager = new TrainingLogManager();

export default function TrainingLogTable() {
    const [trainingLog, setTrainingLog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await trainingLogManager.loadTrainingLog();
                setTrainingLog(data);
            } catch (err) {
                setError('Failed to load training log');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Auto-save when data changes (debounced)
    useEffect(() => {
        if (trainingLog && !isLoading) {
            const saveData = async () => {
                try {
                    const result = await trainingLogManager.saveTrainingLog(trainingLog);
                    if (!result.success) {
                        setError('Failed to save training log');
                    }
                } catch (err) {
                    setError('Failed to save training log');
                    console.error(err);
                }
            };

            const timeoutId = setTimeout(saveData, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [trainingLog, isLoading]);

    const updateTrainingLog = (updates) => {
        setTrainingLog(prev => ({ ...prev, ...updates }));
    };

    const handleRowUpdate = (index, updatedRow) => {
        const updatedRows = trainingLogManager.updateRow(trainingLog.rows, index, updatedRow);
        updateTrainingLog({ rows: updatedRows });
    };

    const addRow = () => {
        const updatedRows = trainingLogManager.addRow(trainingLog.rows);
        updateTrainingLog({ rows: updatedRows });
    };

    const delRow = () => {
        const updatedRows = trainingLogManager.removeLastRow(trainingLog.rows);
        updateTrainingLog({ rows: updatedRows });
    };

    const handleTableNameChange = (newName) => {
        updateTrainingLog({ tableName: newName });
    };

    const handleDateChange = (newDate) => {
        updateTrainingLog({ date: { today: newDate } });
    };

    // Loading state
    if (isLoading) {
        return (
            <div style={{
                padding: "1rem",
                fontFamily: "'Segoe UI', 'San Francisco', 'Arial', sans-serif",
                maxWidth: "600px",
                margin: "0 auto",
                background: "#000000",
                minHeight: "100vh",
                color: "#f5f6fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div>Loading training log...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{
                padding: "1rem",
                fontFamily: "'Segoe UI', 'San Francisco', 'Arial', sans-serif",
                maxWidth: "600px",
                margin: "0 auto",
                background: "#000000",
                minHeight: "100vh",
                color: "#f5f6fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column"
            }}>
                <div style={{ color: "#ff6b6b", marginBottom: "1rem" }}>Error: {error}</div>
                <button 
                    onClick={() => window.location.reload()} 
                    style={{
                        background: "#31363f",
                        color: "#ffd966",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.8rem 1.4rem",
                        fontWeight: "600",
                        cursor: "pointer"
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    // No data state
    if (!trainingLog) {
        return (
            <div style={{
                padding: "1rem",
                fontFamily: "'Segoe UI', 'San Francisco', 'Arial', sans-serif",
                maxWidth: "600px",
                margin: "0 auto",
                background: "#000000",
                minHeight: "100vh",
                color: "#f5f6fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div>No training log data available</div>
            </div>
        );
    }

    // Theme constants
    const darkBg = "#000000";
    const darkCard = "#18191a";
    const borderColor = "#444950";
    const inputText = "#f5f6fa";
    const hrColor = "#222326";

    const sharedButtonStyles = {
        background: "#31363f",
        color: "#ffd966",
        border: "none",
        borderRadius: "8px",
        padding: "0.8rem 1.4rem",
        fontWeight: "600",
        fontSize: "1rem",
        marginTop: "1rem",
        transition: "background 0.2s",
        cursor: "pointer"
    };

    return (
        <div
            style={{
                padding: "1rem",
                fontFamily: "'Segoe UI', 'San Francisco', 'Arial', sans-serif",
                maxWidth: "600px",
                margin: "0 auto",
                background: darkBg,
                minHeight: "100vh",
                color: inputText,
                transition: "background 0.3s, color 0.3s"
            }}
        >
            <div style={{ textAlign: "center" }}>
                <h2 style={{
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    textAlign: "left"
                }}>
                    <input
                        type="text"
                        value={trainingLog.tableName}
                        onChange={(e) => handleTableNameChange(e.target.value)}
                        style={{
                            fontSize: "inherit",
                            fontWeight: "inherit",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            width: "100%",
                            color: inputText
                        }}
                    />
                </h2>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    marginBottom: "1rem"
                }}>
                    <label htmlFor="log-date" style={{ marginRight: "0.5rem", fontWeight: 500 }}>
                        Date:
                    </label>
                    <input
                        id="log-date"
                        type="date"
                        value={trainingLog.date.today ? new Date(trainingLog.date.today).toISOString().split("T")[0] : ""}
                        onChange={e => handleDateChange(e.target.value)}
                        style={{
                            fontSize: "1rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            border: `1px solid ${borderColor}`,
                            background: darkCard,
                            color: inputText
                        }}
                    />
                </div>
                <hr style={{ border: "none", borderTop: `2px solid ${hrColor}`, margin: "1rem 0" }} />
            </div>

            {trainingLog.rows.map((row, index) => (
                <TrainingLogRow
                    key={row.id}
                    rowData={row}
                    onUpdate={(updatedRow) => handleRowUpdate(index, updatedRow)}
                />
            ))}

            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                <button
                    onClick={addRow}
                    style={sharedButtonStyles}
                    onMouseOver={e => e.currentTarget.style.background = "#444950"}
                    onMouseOut={e => e.currentTarget.style.background = "#31363f"}
                >
                    + Add Exercise
                </button>
                <button
                    onClick={delRow}
                    disabled={trainingLog.rows.length <= 1}
                    style={{
                        ...sharedButtonStyles,
                        opacity: trainingLog.rows.length <= 1 ? 0.5 : 1,
                        cursor: trainingLog.rows.length <= 1 ? "not-allowed" : "pointer"
                    }}
                    onMouseOver={e => {
                        if (trainingLog.rows.length > 1) e.currentTarget.style.background = "#444950";
                    }}
                    onMouseOut={e => {
                        if (trainingLog.rows.length > 1) e.currentTarget.style.background = "#31363f";
                    }}
                >
                    - Del Exercise
                </button>
            </div>

            {/* Optional: Show save status */}
            {error && (
                <div style={{
                    marginTop: "1rem",
                    padding: "0.5rem",
                    background: "#ff6b6b20",
                    border: "1px solid #ff6b6b",
                    borderRadius: "4px",
                    color: "#ff6b6b",
                    fontSize: "0.9rem",
                    textAlign: "center"
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}
