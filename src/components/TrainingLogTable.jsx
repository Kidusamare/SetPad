import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TrainingLogRow from "./TrainingLogRow";
import TrainingLogManager from "./TrainingLogManager";

const manager = new TrainingLogManager();

const buttonStyle = {
    background: "#31363f",
    color: "#ffd966",
    padding: "0.5rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    marginRight: "0.7rem",
    marginTop: "1rem",
    transition: "background 0.2s"
};
const buttonHover = "#444950";
const disabledButtonStyle = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: "not-allowed"
};

export default function TrainingLogTable() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [log, setLog] = useState(null);

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
                    tableName: `New Table - ${today}`,
                    date: today,
                    rows: [defaultRow]
                };
                setLog(defaultLog);
            }
        };

        loadLog();
    }, [id]);

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

    useEffect(() => {
        if (!log) return;
        const timeout = setTimeout(() => {
            manager.saveTable(log);
        }, 500);
        return () => clearTimeout(timeout);
    }, [log]);

    if (!log) return <div style={{ background: "#000", minHeight: "100vh" }}></div>;

    return (
        <div style={{ padding: "2rem", color: "#f5f6fa", background: "#000", minHeight: "100vh" }}>
            <button
                onClick={() => navigate("/log")}
                style={buttonStyle}
                onMouseOver={e => e.currentTarget.style.background = buttonHover}
                onMouseOut={e => e.currentTarget.style.background = buttonStyle.background}
            >
                ← Back to Saved Tables
            </button>

            <input
                type="text"
                value={log.tableName}
                onChange={handleRename}
                style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid #666",
                    color: "#ffd966",
                    marginBottom: "1rem",
                    width: "100%"
                }}
            />

            <input
                type="date"
                value={log.date}
                onChange={(e) => setLog({ ...log, date: e.target.value })}
                style={{
                    ...buttonStyle,
                    width: "auto",
                    color: "#f5f6fa",
                    background: "#181a1b",
                    marginRight: 0,
                    marginTop: 0,
                    marginBottom: "1rem"
                }}
                onMouseOver={e => e.currentTarget.style.background = "#23272f"}
                onMouseOut={e => e.currentTarget.style.background = "#181a1b"}
            />
            <hr />

            {log.rows.map((row, index) => (
                <TrainingLogRow
                    key={row.id}
                    rowData={row}
                    onUpdate={(updated) => updateRow(index, updated)}
                />
            ))}

            <div style={{ marginTop: "1.5rem" }}>
                <button
                    onClick={addRow}
                    style={buttonStyle}
                    onMouseOver={e => e.currentTarget.style.background = buttonHover}
                    onMouseOut={e => e.currentTarget.style.background = buttonStyle.background}
                >
                    + Add Exercise
                </button>
                <button
                    onClick={deleteLastRow}
                    disabled={log.rows.length <= 1}
                    style={log.rows.length <= 1 ? disabledButtonStyle : buttonStyle}
                    onMouseOver={e => {
                        if (log.rows.length > 1) e.currentTarget.style.background = buttonHover;
                    }}
                    onMouseOut={e => {
                        if (log.rows.length > 1) e.currentTarget.style.background = buttonStyle.background;
                    }}
                >
                    - Delete Last
                </button>
            </div>
        </div>
    );
}
