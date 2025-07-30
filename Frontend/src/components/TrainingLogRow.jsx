import React, { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext";
import AutoComplete from "./AutoComplete";
import TrainingLogManager from "./TrainingLogManager";

const manager = new TrainingLogManager();

export default function TrainingLogRow({ 
    rowData, 
    onUpdate, 
    muscleGroupSuggestions = [], 
    exerciseSuggestions = [],
    onMuscleGroupChange,
    currentLogId
}) {
    const { theme } = useTheme();
    const [muscleGroup, setMuscleGroup] = useState(rowData.muscleGroup);
    const [exercise, setExercise] = useState(rowData.exercise);
    const [sets, setSets] = useState(rowData.sets);
    const [notes, setNotes] = useState(rowData.notes);
    const [showNotes, setShowNotes] = useState(rowData.showNotes);
    const [weightUnit, setWeightUnit] = useState(rowData.weightUnit);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [previousData, setPreviousData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSetChange = (index, field, value) => {
        setSets(sets =>
            sets.map((set, i) =>
                i === index ? { ...set, [field]: value } : set
            )
        );
    };

    const handleWeightKeyDown = (e, index) => {
        // Optionally, you can add logic here if you want to handle Enter key
    };

    const toggleWeightUnit = () => {
        const newUnit = weightUnit === "lbs" ? "kg" : "lbs";
        const convertedSets = sets.map(set => {
            let weight = set.weight;
            if (weight !== '') {
                weight = parseFloat(weight);
                if (!isNaN(weight)) {
                    weight = newUnit === "kg"
                        ? (weight / 2.20462).toFixed(2)
                        : (weight * 2.20462).toFixed(2);
                }
            }
            return { ...set, weight: weight };
        });
        setSets(convertedSets);
        setWeightUnit(newUnit);
    };

    const addSet = () => {
        setSets([...sets, { reps: '', weight: '' }]);
    };

    const removeSet = (index) => {
        if (sets.length > 1) {
            setSets(sets.filter((_, i) => i !== index));
        }
    };

    const handleMuscleGroupChange = (newMuscleGroup) => {
        setMuscleGroup(newMuscleGroup);
        if (onMuscleGroupChange) {
            onMuscleGroupChange(newMuscleGroup);
        }
    };

    const fetchPreviousExerciseData = async () => {
        if (!exercise.trim()) return;
        
        setIsLoading(true);
        try {
            const allTables = await manager.listTables();
            let previousExercises = [];
            
            // Search through all tables for this exercise, excluding current log
            for (const table of allTables) {
                // Skip the current log
                if (table.id === currentLogId) continue;
                
                const tableData = await manager.loadTable(table.id);
                if (tableData && tableData.rows) {
                    const matchingRows = tableData.rows.filter(row => 
                        row.exercise && row.exercise.toLowerCase() === exercise.toLowerCase()
                    );
                    
                    matchingRows.forEach(row => {
                        if (row.sets && row.sets.length > 0) {
                            previousExercises.push({
                                date: tableData.date,
                                tableName: tableData.tableName,
                                sets: row.sets,
                                notes: row.notes,
                                weightUnit: row.weightUnit
                            });
                        }
                    });
                }
            }
            
            // Sort by date (most recent first)
            previousExercises.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            setPreviousData(previousExercises.length > 0 ? previousExercises[0] : null);
        } catch (error) {
            console.error("Error fetching previous exercise data:", error);
            setPreviousData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionToggle = () => {
        if (!showSuggestions && exercise.trim()) {
            fetchPreviousExerciseData();
        }
        setShowSuggestions(!showSuggestions);
    };

    const applyPreviousData = () => {
        if (previousData && previousData.sets) {
            setSets(previousData.sets);
            setWeightUnit(previousData.weightUnit);
            if (previousData.notes) {
                setNotes(previousData.notes);
                setShowNotes(true);
            }
            setShowSuggestions(false);
        }
    };

    useEffect(() => {
        onUpdate({
            ...rowData,
            muscleGroup,
            exercise,
            sets,
            notes,
            showNotes,
            weightUnit,
        });
    }, [muscleGroup, exercise, sets, notes, showNotes, weightUnit]);

    // Sync state with rowData when it changes (e.g. on reload)
    useEffect(() => {
        setMuscleGroup(rowData.muscleGroup);
        setExercise(rowData.exercise);
        setSets(rowData.sets);
        setNotes(rowData.notes);
        setShowNotes(rowData.showNotes);
        setWeightUnit(rowData.weightUnit);
    }, [rowData]);

    const hasExerciseData = exercise.trim().length > 0;

    return (
        <div
            style={{
                marginBottom: "2rem",
                padding: "2rem",
                background: theme.cardBackground,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "16px",
                boxShadow: theme.shadowLight,
                fontFamily: "'Segoe UI', 'San Francisco', 'Arial', sans-serif",
                color: theme.text,
                transition: "background 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s",
                position: "relative"
            }}
        >
            {/* Muscle Group */}
            <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ 
                    fontWeight: "600", 
                    color: theme.textSecondary,
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                    display: "block",
                    transition: "color 0.3s ease"
                }}>
                    Muscle Group:
                </label>
                <AutoComplete
                    value={muscleGroup}
                    onChange={handleMuscleGroupChange}
                    placeholder="Enter Exercise Focus Here"
                    suggestions={muscleGroupSuggestions}
                />
            </div>

            {/* Exercise Name */}
            <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ 
                    fontWeight: "600", 
                    color: theme.textSecondary,
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                    display: "block",
                    transition: "color 0.3s ease"
                }}>
                    Exercise:
                </label>
                <AutoComplete
                    value={exercise}
                    onChange={setExercise}
                    placeholder="Name of exercise"
                    suggestions={exerciseSuggestions}
                />
            </div>

            {/* Smart Suggestion Button */}
            <div style={{ marginBottom: "1.5rem" }}>
                <button
                    onClick={handleSuggestionToggle}
                    disabled={!hasExerciseData}
                    style={{
                        background: hasExerciseData ? theme.accentSecondary : theme.surfaceTertiary,
                        color: hasExerciseData ? theme.accent : theme.textMuted,
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.8rem 1rem",
                        cursor: hasExerciseData ? "pointer" : "not-allowed",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        transition: "all 0.3s ease",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        opacity: hasExerciseData ? 1 : 0.6
                    }}
                    onMouseOver={e => {
                        if (hasExerciseData) {
                            e.currentTarget.style.background = theme.accentHover;
                        }
                    }}
                    onMouseOut={e => {
                        if (hasExerciseData) {
                            e.currentTarget.style.background = theme.accentSecondary;
                        }
                    }}
                >
                    {isLoading ? (
                        <>
                            <span>⏳</span>
                            Loading Previous Performance...
                        </>
                    ) : (
                        <>
                            <span>💡</span>
                            {hasExerciseData ? "Show Previous Performance" : "Enter exercise name first"}
                        </>
                    )}
                </button>
            </div>

            {/* Suggestion Card Overlay */}
            {showSuggestions && (
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
                    zIndex: 1000,
                    padding: "1rem"
                }}
                onClick={() => setShowSuggestions(false)}
                >
                    <div style={{
                        background: theme.cardBackground,
                        borderRadius: "16px",
                        padding: "1.5rem",
                        maxWidth: "90vw",
                        width: "400px",
                        maxHeight: "80vh",
                        overflow: "auto",
                        border: `1px solid ${theme.cardBorder}`,
                        boxShadow: theme.shadow
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "1.5rem"
                        }}>
                            <h3 style={{ 
                                margin: 0, 
                                color: theme.accent,
                                fontSize: "1.2rem",
                                transition: "color 0.3s ease"
                            }}>
                                Previous Performance
                            </h3>
                            <button
                                onClick={() => setShowSuggestions(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: theme.textSecondary,
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                    padding: "0.2rem",
                                    transition: "color 0.3s ease"
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {previousData ? (
                            <div>
                                <div style={{
                                    background: theme.surfaceSecondary,
                                    padding: "1.2rem",
                                    borderRadius: "12px",
                                    marginBottom: "1.5rem",
                                    border: `1px solid ${theme.borderLight}`
                                }}>
                                    <div style={{ 
                                        marginBottom: "0.8rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem"
                                    }}>
                                        <span style={{ color: theme.accent, fontWeight: "600" }}>📅</span>
                                        <span style={{ color: theme.textSecondary }}>Date:</span>
                                        <span style={{ color: theme.text, fontWeight: "500" }}>{previousData.date}</span>
                                    </div>
                                    <div style={{ 
                                        marginBottom: "1rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem"
                                    }}>
                                        <span style={{ color: theme.accent, fontWeight: "600" }}>📋</span>
                                        <span style={{ color: theme.textSecondary }}>Log:</span>
                                        <span style={{ color: theme.text, fontWeight: "500" }}>{previousData.tableName}</span>
                                    </div>
                                    <div style={{ marginBottom: "1rem" }}>
                                        <div style={{ 
                                            color: theme.accent, 
                                            fontWeight: "600",
                                            marginBottom: "0.8rem",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem"
                                        }}>
                                            <span>💪</span>
                                            Sets:
                                        </div>
                                        {previousData.sets.map((set, index) => (
                                            <div key={index} style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "0.6rem",
                                                padding: "0.8rem",
                                                background: theme.inputBackground,
                                                borderRadius: "8px",
                                                border: `1px solid ${theme.inputBorder}`
                                            }}>
                                                <span style={{ color: theme.textSecondary, fontWeight: "500" }}>
                                                    Set {index + 1}
                                                </span>
                                                <div style={{ display: "flex", gap: "1rem" }}>
                                                    <span style={{ color: theme.text }}>
                                                        {set.reps} reps
                                                    </span>
                                                    <span style={{ color: theme.accent, fontWeight: "600" }}>
                                                        {set.weight} {previousData.weightUnit}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {previousData.notes && (
                                        <div style={{ marginTop: "1rem" }}>
                                            <div style={{ 
                                                color: theme.accent, 
                                                fontWeight: "600",
                                                marginBottom: "0.8rem",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem"
                                            }}>
                                                <span>📝</span>
                                                Notes:
                                            </div>
                                            <div style={{
                                                background: theme.inputBackground,
                                                padding: "0.8rem",
                                                borderRadius: "8px",
                                                border: `1px solid ${theme.inputBorder}`,
                                                fontStyle: "italic",
                                                color: theme.text,
                                                lineHeight: "1.5"
                                            }}>
                                                {previousData.notes}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={applyPreviousData}
                                    style={{
                                        background: theme.accent,
                                        color: theme.background,
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "1rem 1.5rem",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        width: "100%",
                                        fontSize: "1rem",
                                        transition: "background 0.3s ease"
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                                    onMouseOut={e => e.currentTarget.style.background = theme.accent}
                                >
                                    Apply This Data
                                </button>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: "center",
                                padding: "2rem",
                                color: theme.textSecondary
                            }}>
                                <div style={{ 
                                    fontSize: "3rem", 
                                    marginBottom: "1rem",
                                    opacity: 0.7
                                }}>
                                    📝
                                </div>
                                <p style={{ 
                                    fontSize: "1.1rem",
                                    marginBottom: "0.5rem",
                                    color: theme.text
                                }}>
                                    No previous data found for "{exercise}"
                                </p>
                                <p style={{ 
                                    fontSize: "0.9rem", 
                                    opacity: 0.7,
                                    lineHeight: "1.5"
                                }}>
                                    This might be a new exercise for you! Keep tracking and you'll see your progress here next time.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sets */}
            <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ 
                    fontWeight: "600", 
                    color: theme.textSecondary,
                    fontSize: "1rem",
                    marginBottom: "1rem",
                    display: "block",
                    transition: "color 0.3s ease"
                }}>
                    Sets:
                </label>
                {sets.map((set, index) => (
                    <div key={index} style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        marginBottom: "0.8rem",
                        gap: "0.5rem"
                    }}>
                        <input
                            type="number"
                            min="0"
                            placeholder="Reps"
                            value={set.reps}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) handleSetChange(index, "reps", val);
                            }}
                            style={{
                                padding: "0.6rem",
                                width: "80px",
                                borderRadius: "8px",
                                border: `1px solid ${theme.inputBorder}`,
                                background: theme.inputBackground,
                                color: theme.text,
                                fontSize: "0.9rem",
                                transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease"
                            }}
                        />
                        <input
                            type="number"
                            placeholder="Weight"
                            value={set.weight}
                            onChange={(e) => handleSetChange(index, "weight", e.target.value)}
                            onKeyDown={(e) => handleWeightKeyDown(e, index)}
                            style={{
                                padding: "0.6rem",
                                width: "100px",
                                borderRadius: "8px",
                                border: `1px solid ${theme.inputBorder}`,
                                background: theme.inputBackground,
                                color: theme.text,
                                fontSize: "0.9rem",
                                transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease"
                            }}
                        />
                        <span style={{ 
                            fontWeight: "500", 
                            color: theme.accent,
                            fontSize: "0.9rem",
                            minWidth: "30px",
                            transition: "color 0.3s ease"
                        }}>
                            {weightUnit}
                        </span>
                        {sets.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeSet(index)}
                                style={{
                                    background: theme.surfaceSecondary,
                                    color: theme.textSecondary,
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: "6px",
                                    padding: "0.5rem 0.8rem",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
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
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        onClick={addSet}
                        style={{
                            background: theme.accentSecondary,
                            color: theme.accent,
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.6rem 1rem",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            transition: "background 0.2s ease"
                        }}
                        onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                        onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
                    >
                        Add Set
                    </button>
                    <button
                        type="button"
                        onClick={toggleWeightUnit}
                        style={{
                            background: theme.accentSecondary,
                            color: theme.accent,
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.6rem 1rem",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            transition: "background 0.2s ease"
                        }}
                        onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                        onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
                    >
                        Unit: {weightUnit.toUpperCase()}
                    </button>
                </div>
            </div>

            {/* Notes */}
            <div style={{ marginTop: "1.5rem" }}>
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    style={{
                        background: theme.accentSecondary,
                        color: theme.accent,
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.6rem 1.2rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: "background 0.2s ease"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                    onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
                >
                    {showNotes ? "Hide Notes" : "Add Notes"}
                </button>
                {showNotes && (
                    <div style={{ marginTop: "1rem" }}>
                        <textarea
                            rows="4"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add your notes here..."
                            style={{
                                width: "100%",
                                borderRadius: "8px",
                                padding: "0.8rem",
                                border: `1px solid ${theme.inputBorder}`,
                                background: theme.inputBackground,
                                color: theme.text,
                                fontSize: "1rem",
                                resize: "vertical",
                                minHeight: "100px",
                                boxSizing: "border-box",
                                transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease"
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
