import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import TrainingLogManager from "./TrainingLogManager";
import TrainingLogRow from "./TrainingLogRow";

const manager = new TrainingLogManager();

export default function TrainingLogTable() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [log, setLog] = useState(null);
    const [muscleGroupSuggestions, setMuscleGroupSuggestions] = useState([]);
    const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
    const [currentMuscleGroup, setCurrentMuscleGroup] = useState("");

    useEffect(() => {
        const loadLog = async () => {
            const saved = await manager.loadTable(id);
            if (saved) {
                setLog(saved);
            } else {
                const today = new Date().toISOString().split("T")[0];
                const defaultRow = {
                    id: 0,
                    muscleGroup: "",
                    exercise: "",
                    sets: [
                        { reps: "", weight: "" },
                        { reps: "", weight: "" }
                    ],
                    notes: "",
                    showNotes: false,
                    weightUnit: "lbs"
                };
                const defaultLog = {
                    id: id,
                    tableName: "New Log",
                    date: today,
                    rows: [defaultRow]
                };
                setLog(defaultLog);
            }
        };

        loadLog();
    }, [id]);

    // Fetch suggestions when component mounts
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const [muscleGroups, exercises] = await Promise.all([
                    manager.getUniqueMuscleGroups(),
                    manager.getUniqueExercises()
                ]);
                setMuscleGroupSuggestions(muscleGroups);
                setExerciseSuggestions(exercises);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        };

        fetchSuggestions();
    }, []);

    // Update exercise suggestions when muscle group changes
    useEffect(() => {
        const fetchExercisesForMuscleGroup = async () => {
            if (currentMuscleGroup.trim()) {
                try {
                    const exercises = await manager.getExercisesForMuscleGroup(currentMuscleGroup);
                    setExerciseSuggestions(exercises);
                } catch (error) {
                    console.error("Error fetching exercises for muscle group:", error);
                }
            } else {
                // If no muscle group selected, show all exercises
                try {
                    const allExercises = await manager.getUniqueExercises();
                    setExerciseSuggestions(allExercises);
                } catch (error) {
                    console.error("Error fetching all exercises:", error);
                }
            }
        };

        fetchExercisesForMuscleGroup();
    }, [currentMuscleGroup]);

    const updateRow = (index, updatedRow) => {
        const newRows = [...log.rows];
        newRows[index] = { ...newRows[index], ...updatedRow };
        setLog({ ...log, rows: newRows });
    };

    const addRow = () => {
        const newRow = {
            id: log.rows.length,
            muscleGroup: "",
            exercise: "",
            sets: [{ reps: "", weight: "" }],
            notes: "",
            showNotes: false,
            weightUnit: "lbs"
        };
        setLog({ ...log, rows: [...log.rows, newRow] });
    };

    const deleteLastRow = () => {
        if (log.rows.length <= 1) return;
        const newRows = log.rows.slice(0, -1);
        setLog({ ...log, rows: newRows });
    };

    const handleRename = (e) => {
        const updated = { ...log, tableName: e.target.value };
        setLog(updated);
    };

    const handleMuscleGroupChange = (muscleGroup) => {
        setCurrentMuscleGroup(muscleGroup);
    };

    useEffect(() => {
        if (!log) return;
        const timeout = setTimeout(() => {
            manager.saveTable(log);
        }, 500);
        return () => clearTimeout(timeout);
    }, [log]);

    if (!log) return <div style={{ background: theme.background, minHeight: "100vh" }}></div>;

    return (
        <div style={{ 
            padding: "2rem",
            paddingTop: "5rem", // Add top padding to prevent overlap with back button
            color: theme.text, 
            background: theme.background, 
            minHeight: "100vh",
            position: "relative",
            transition: "background-color 0.3s ease, color 0.3s ease"
        }}>
            <button
                onClick={() => navigate("/log")}
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
                ← Back to Saved Logs
            </button>

            <div style={{ marginBottom: "2rem" }}>
                <input
                    type="text"
                    value={log.tableName}
                    onChange={handleRename}
                    style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        background: "transparent",
                        border: "none",
                        borderBottom: `2px solid ${theme.accent}`,
                        color: theme.accent,
                        marginBottom: "1rem",
                        width: "100%",
                        padding: "0.5rem 0",
                        transition: "border-color 0.3s ease, color 0.3s ease"
                    }}
                />

                <input
                    type="date"
                    value={log.date}
                    onChange={(e) => setLog({ ...log, date: e.target.value })}
                    style={{
                        background: theme.surfaceSecondary,
                        color: theme.text,
                        padding: "0.7rem 1.4rem",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "1rem",
                        cursor: "pointer",
                        marginRight: 0,
                        marginTop: 0,
                        marginBottom: "1rem",
                        transition: "background 0.2s ease"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.surfaceTertiary}
                    onMouseOut={e => e.currentTarget.style.background = theme.surfaceSecondary}
                />
            </div>

            <hr style={{ 
                border: "none", 
                height: "1px", 
                background: theme.border, 
                margin: "2rem 0",
                transition: "background-color 0.3s ease"
            }} />

            {log.rows.map((row, index) => (
                <TrainingLogRow
                    key={row.id}
                    rowData={row}
                    onUpdate={(updated) => updateRow(index, updated)}
                    muscleGroupSuggestions={muscleGroupSuggestions}
                    exerciseSuggestions={exerciseSuggestions}
                    onMuscleGroupChange={handleMuscleGroupChange}
                />
            ))}

            <div style={{ 
                marginTop: "2rem",
                padding: "1.5rem",
                background: theme.cardBackground,
                borderRadius: "12px",
                border: `1px solid ${theme.cardBorder}`,
                transition: "background-color 0.3s ease, border-color 0.3s ease"
            }}>
                <h3 style={{ 
                    marginBottom: "1rem", 
                    color: theme.accent,
                    fontSize: "1.2rem",
                    transition: "color 0.3s ease"
                }}>
                    Exercise Management
                </h3>
                <button
                    onClick={addRow}
                    style={{
                        background: theme.accentSecondary,
                        color: theme.accent,
                        padding: "0.7rem 1.4rem",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "1rem",
                        marginRight: "1rem",
                        marginTop: "1rem",
                        transition: "background 0.2s ease"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                    onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
                >
                    + Add Exercise
                </button>
                <button
                    onClick={deleteLastRow}
                    disabled={log.rows.length <= 1}
                    style={{
                        background: log.rows.length <= 1 ? theme.textMuted : theme.surfaceSecondary,
                        color: log.rows.length <= 1 ? theme.textSecondary : theme.textSecondary,
                        padding: "0.7rem 1.4rem",
                        border: `1px solid ${theme.border}`,
                        borderRadius: "10px",
                        cursor: log.rows.length <= 1 ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: "1rem",
                        marginRight: "1rem",
                        marginTop: "1rem",
                        transition: "background 0.2s ease, border-color 0.2s ease"
                    }}
                    onMouseOver={e => {
                        if (log.rows.length > 1) {
                            e.currentTarget.style.background = theme.surfaceTertiary;
                            e.currentTarget.style.borderColor = theme.textMuted;
                        }
                    }}
                    onMouseOut={e => {
                        if (log.rows.length > 1) {
                            e.currentTarget.style.background = theme.surfaceSecondary;
                            e.currentTarget.style.borderColor = theme.border;
                        }
                    }}
                >
                    - Delete Last
                </button>
            </div>
        </div>
    );
}
