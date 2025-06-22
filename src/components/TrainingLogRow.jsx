import React, { useState, useEffect } from "react"

export default function TrainingLogRow({ rowData, onUpdate }) {
    const [muscleGroup, setMuscleGroup] = useState(rowData.muscleGroup);
    const [exercise, setExercise] = useState(rowData.exercise);
    const [sets, setSets] = useState(rowData.sets); // <-- FIXED: do not wrap in []
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

    // Dark mode & Apple Notes-like style variables
    const darkBg = "#23272f";
    const darkCard = "#282c34";
    const borderColor = "#444950";
    const labelColor = "#bfc7d5";
    const inputBg = "#23272f";
    const inputText = "#f5f6fa";
    const accent = "#ffd966";
    const buttonBg = "#31363f";
    const buttonText = "#ffd966";
    const buttonHover = "#444950";

    return (
        <div
            style={{
                marginBottom: "2rem",
                padding: "1.5rem",
                background: darkCard,
                border: `1px solid ${borderColor}`,
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                fontFamily: "'Segoe UI', 'San Francisco', 'Arial', sans-serif",
                color: inputText,
                transition: "background 0.3s, color 0.3s"
            }}
        >
            {/* Muscle Group */}
            <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontWeight: "600", color: labelColor }}>Muscle Group:</label><br />
                <input
                    type="text"
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value)}
                    placeholder="Enter Exersice Focus Here"
                    style={{
                        padding: "0.5rem",
                        width: "100%",
                        borderRadius: "8px",
                        border: `1px solid ${borderColor}`,
                        background: inputBg,
                        color: inputText,
                        fontSize: "1rem",
                        marginTop: "0.2rem"
                    }}
                />
            </div>

            {/* Exercise Name */}
            <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontWeight: "600", color: labelColor }}>Exercise:</label><br />
                <input
                    type="text"
                    value={exercise}
                    onChange={(e) => setExercise(e.target.value)}
                    placeholder="Name of exersice"
                    style={{
                        padding: "0.5rem",
                        width: "100%",
                        borderRadius: "8px",
                        border: `1px solid ${borderColor}`,
                        background: inputBg,
                        color: inputText,
                        fontSize: "1rem",
                        marginTop: "0.2rem"
                    }}
                />
            </div>

            {/* Sets */}
            <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontWeight: "600", color: labelColor }}>Sets:</label>
                {sets.map((set, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
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
                                padding: "0.5rem",
                                width: "80px",
                                marginRight: "0.5rem",
                                borderRadius: "8px",
                                border: `1px solid ${borderColor}`,
                                background: inputBg,
                                color: inputText
                            }}
                        />
                        <input
                            type="number"
                            placeholder="Weight"
                            value={set.weight}
                            onChange={(e) => handleSetChange(index, "weight", e.target.value)}
                            onKeyDown={(e) => handleWeightKeyDown(e, index)}
                            style={{
                                padding: "0.5rem",
                                width: "100px",
                                marginRight: "0.5rem",
                                borderRadius: "8px",
                                border: `1px solid ${borderColor}`,
                                background: inputBg,
                                color: inputText
                            }}
                        />
                        <span style={{ marginRight: "0.5rem", fontWeight: "500", color: accent }}>{weightUnit}</span>
                        {sets.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeSet(index)}
                                style={{
                                    background: buttonBg,
                                    color: buttonText,
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "0.3rem 0.8rem",
                                    cursor: "pointer",
                                    marginLeft: "0.2rem",
                                    transition: "background 0.2s"
                                }}
                                onMouseOver={e => e.currentTarget.style.background = buttonHover}
                                onMouseOut={e => e.currentTarget.style.background = buttonBg}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addSet}
                    style={{
                        marginRight: "0.5rem",
                        background: buttonBg,
                        color: buttonText,
                        border: "none",
                        borderRadius: "6px",
                        padding: "0.4rem 0.9rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "background 0.2s"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = buttonHover}
                    onMouseOut={e => e.currentTarget.style.background = buttonBg}
                >
                    Add Set
                </button>
                <button
                    type="button"
                    onClick={toggleWeightUnit}
                    style={{
                        background: buttonBg,
                        color: buttonText,
                        border: "none",
                        borderRadius: "6px",
                        padding: "0.4rem 0.9rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "background 0.2s"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = buttonHover}
                    onMouseOut={e => e.currentTarget.style.background = buttonBg}
                >
                    Unit: {weightUnit.toUpperCase()}
                </button>
            </div>

            {/* Notes */}
            <div style={{ marginTop: "1rem" }}>
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    style={{
                        background: buttonBg,
                        color: buttonText,
                        border: "none",
                        borderRadius: "6px",
                        padding: "0.5rem 1.2rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "background 0.2s"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = buttonHover}
                    onMouseOut={e => e.currentTarget.style.background = buttonBg}
                >
                    {showNotes ? "Hide Notes" : "Add Notes"}
                </button>
                {showNotes && (
                    <div>
                        <textarea
                            rows="3"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="No notes"
                            style={{
                                width: "100%",
                                marginTop: "0.5rem",
                                borderRadius: "8px",
                                padding: "0.5rem",
                                border: `1px solid ${borderColor}`,
                                background: inputBg,
                                color: inputText,
                                fontSize: "1rem"
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
