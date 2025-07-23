import React from "react"
import { useTheme } from "../context/ThemeContext";
import AutoComplete from "./AutoComplete";
import SmartSuggestions, { ProgressionSuggestions } from "./SmartSuggestions";

export default function TrainingLogRow({ 
    rowData, 
    onUpdate, 
    muscleGroupSuggestions = [], 
    exerciseSuggestions = [],
    onMuscleGroupChange
}) {
    const { theme } = useTheme();
    // Fully controlled component - no local state
    
    // Simple update function
    const updateField = (field, value) => {
        onUpdate({
            ...rowData,
            [field]: value
        });
    };

    const handleSetChange = (index, field, value) => {
        const newSets = rowData.sets.map((set, i) =>
            i === index ? { ...set, [field]: value } : set
        );
        updateField('sets', newSets);
    };

    const toggleWeightUnit = () => {
        const newUnit = rowData.weightUnit === "lbs" ? "kg" : "lbs";
        const convertedSets = rowData.sets.map(set => {
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
        updateField('sets', convertedSets);
        updateField('weightUnit', newUnit);
    };

    const addSet = () => {
        updateField('sets', [...rowData.sets, { reps: '', weight: '' }]);
    };

    const removeSet = (index) => {
        if (rowData.sets.length > 1) {
            updateField('sets', rowData.sets.filter((_, i) => i !== index));
        }
    };

    const handleMuscleGroupChange = (newMuscleGroup) => {
        updateField('muscleGroup', newMuscleGroup);
        if (onMuscleGroupChange) {
            onMuscleGroupChange(newMuscleGroup);
        }
    };

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
                    value={rowData.muscleGroup}
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
                    value={rowData.exercise}
                    onChange={(value) => updateField('exercise', value)}
                    placeholder="Name of exercise"
                    suggestions={exerciseSuggestions}
                />
                <SmartSuggestions
                    muscleGroup={rowData.muscleGroup}
                    currentExercise={rowData.exercise}
                    onSuggestionSelect={(exercise) => updateField('exercise', exercise)}
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
                {rowData.sets.map((set, index) => (
                    <div key={index} style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        marginBottom: "0.8rem",
                        gap: "0.5rem"
                    }}>
                        <input
                            type="number"
                            placeholder="Weight"
                            value={set.weight}
                            onChange={(e) => handleSetChange(index, "weight", e.target.value)}
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
                            {rowData.weightUnit}
                        </span>
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
                        <span style={{ 
                            fontWeight: "500", 
                            color: theme.textSecondary,
                            fontSize: "0.9rem",
                            minWidth: "30px",
                            transition: "color 0.3s ease"
                        }}>
                            reps
                        </span>
                        {rowData.sets.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeSet(index)}
                                style={{
                                    background: theme.surfaceSecondary,
                                    color: theme.textSecondary,
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: "50%",
                                    width: "28px",
                                    height: "28px",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
                                    padding: 0,
                                    minWidth: "28px"
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.background = theme.surfaceTertiary;
                                    e.currentTarget.style.borderColor = theme.textMuted;
                                    e.currentTarget.style.color = theme.text;
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = theme.surfaceSecondary;
                                    e.currentTarget.style.borderColor = theme.border;
                                    e.currentTarget.style.color = theme.textSecondary;
                                }}
                            >
                                ×
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
                        Unit: {rowData.weightUnit.toUpperCase()}
                    </button>
                </div>
                <ProgressionSuggestions
                    currentSets={rowData.sets}
                    exercise={rowData.exercise}
                    onSuggestionApply={(newSets) => updateField('sets', newSets)}
                />
            </div>

            {/* Notes */}
            <div style={{ marginTop: "1.5rem" }}>
                <button
                    onClick={() => updateField('showNotes', !rowData.showNotes)}
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
                    {rowData.showNotes ? "Hide Notes" : "Add Notes"}
                </button>
                {rowData.showNotes && (
                    <div style={{ marginTop: "1rem" }}>
                        <textarea
                            rows="4"
                            value={rowData.notes || ''}
                            onChange={(e) => updateField('notes', e.target.value)}
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
