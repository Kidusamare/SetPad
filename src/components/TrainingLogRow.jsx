import React, { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext";
import AutoComplete from "./AutoComplete";

export default function TrainingLogRow({ 
    rowData, 
    onUpdate, 
    muscleGroupSuggestions = [], 
    exerciseSuggestions = [],
    onMuscleGroupChange
}) {
    const { theme } = useTheme();
    const [muscleGroup, setMuscleGroup] = useState(rowData.muscleGroup);
    const [exercise, setExercise] = useState(rowData.exercise);
    const [sets, setSets] = useState(rowData.sets);
    const [notes, setNotes] = useState(rowData.notes);
    const [showNotes, setShowNotes] = useState(rowData.showNotes);
    const [weightUnit, setWeightUnit] = useState(rowData.weightUnit);

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
                transition: "background 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s"
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
