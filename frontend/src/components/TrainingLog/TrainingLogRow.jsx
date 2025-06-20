import React, { useState, useEffect } from "react";

export default function TrainingLogRow({ rowData, onUpdate, onDelete, canDelete }) {
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

    // OLED pitch black, seamless edge-to-edge style
    const darkBg = "#000";
    const darkCard = "#111";
    const borderColor = "#23272f";
    const labelColor = "#bfc7d5";
    const inputBg = "#181a1b";
    const inputText = "#f5f6fa";
    const accent = "#ffd966";
    const buttonBg = "#181a1b";
    const buttonText = "#ffd966";
    const buttonHover = "#23272f";
    const trashHover = "#ff4d4f22";

    return (
        <div
            style={{
                marginBottom: "2rem",
                padding: "1.5rem",
                background: darkCard,
                border: `1px solid ${borderColor}`,
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                fontFamily: "'Segoe UI', 'San Francisco', 'Arial', sans-serif",
                color: inputText,
                transition: "background 0.3s, color 0.3s",
                position: "relative"
            }}
        >
            {/* Delete Exercise Button (trashcan, top right) */}
            {onDelete && canDelete && (
                <button
                    onClick={onDelete}
                    title="Delete Exercise"
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: "none",
                        border: "none",
                        color: "#ff4d4f",
                        cursor: "pointer",
                        padding: 0,
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.7,
                        transition: "background 0.15s, opacity 0.15s"
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.background = trashHover;
                        e.currentTarget.style.opacity = 1;
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.background = "none";
                        e.currentTarget.style.opacity = 0.7;
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ff4d4f"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ display: "block" }}
                    >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                </button>
            )}

            {/* Muscle Group */}
            <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontWeight: "600", color: labelColor }}>Muscle Group:</label><br />
                <input
                    type="text"
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value)}
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
