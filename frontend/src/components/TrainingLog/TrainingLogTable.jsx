import React, { useState, useEffect } from "react";
import TrainingLogRow from "./TrainingLogRow";
import { TrainingLogManager } from "./TrainingLogManager";
import { useParams, useNavigate } from "react-router-dom";

const manager = new TrainingLogManager();

export default function TrainingLogTable() {
    const [table, setTable] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setIsLoading(true);
            try {
                let loaded = await manager.loadTable(id);
                if (!loaded) {
                    throw new Error("Log not found");
                }
                if (isMounted) {
                    setTable(loaded);
                    setError(null);
                }
            } catch (error) {
                if (isMounted) {
                    setError("Failed to load table");
                    console.error(error);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        load();
        return () => { isMounted = false; };
    }, [id]);

    const updateRow = (i, updatedRow) => {
        const newRows = [...table.rows];
        newRows[i] = { ...newRows[i], ...updatedRow };
        setTable({ ...table, rows: newRows });
    };

    const addRow = () => {
        const newRow = {
            id: table.rows.length,
            muscleGroup: "Strength-Focus🏋️",
            exercise: "",
            sets: [{ reps: "", weight: "" }],
            notes: "No notes 😊",
            showNotes: false,
            weightUnit: "lbs"
        };
        setTable({ ...table, rows: [...table.rows, newRow] });
    };

    const deleteRow = (id) => {
        if (table.rows.length <= 1) return;
        const newRows = table.rows.filter(row => row.id !== id);
        const reIndexedRows = newRows.map((row, index) => ({ ...row, id: index }));
        setTable({ ...table, rows: reIndexedRows });
    };

    const deleteLastRow = () => {
        if (table.rows.length <= 1) return;
        const newRows = table.rows.slice(0, -1);
        setTable({ ...table, rows: newRows });
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        if (new Date(newDate).toString() !== 'Invalid Date') {
            setTable({ ...table, date: newDate });
        }
    };

    const handleSave = async () => {
        try {
            await manager.saveTable(table.tableName, table.date, table);
            alert("Saved successfully.");
        } catch (e) {
            setError("Failed to save changes");
            console.error(e);
        }
    };

    const handleBack = async () => {
        try {
            await manager.saveTable(table.tableName, table.date, table);
        } catch (e) {
            alert("Failed to save before leaving.");
        }
        navigate("/");
    };

    if (isLoading) return <div style={{ padding: "1rem", color: "#f5f6fa", background: "#000", height: "100vh" }}>Loading...</div>;

    const pageStyle = {
        background: "#000",
        color: "#f5f6fa",
        fontFamily: "'San Francisco', 'Segoe UI', Arial, sans-serif",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 0"
    };

    const containerStyle = {
        width: "100%",
        maxWidth: 520,
        background: "#000",
        borderRadius: "18px",
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.18)",
        padding: "2rem",
        margin: "2rem auto 0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch"
    };

    const inputStyle = {
        width: "100%",
        padding: "0.5rem",
        borderRadius: "8px",
        border: "1px solid #444950",
        background: "#181a1b",
        color: "#f5f6fa",
        fontSize: "1rem",
        marginBottom: "1rem"
    };

    const buttonStyle = {
        background: "#181a1b",
        color: "#ffd966",
        border: "none",
        borderRadius: "8px",
        padding: "0.8rem 1.4rem",
        fontWeight: "600",
        fontSize: "1rem",
        marginTop: "1rem",
        marginRight: "0.5rem",
        transition: "background 0.2s",
        cursor: "pointer"
    };

    const disabledButtonStyle = {
        ...buttonStyle,
        opacity: 0.5,
        cursor: "not-allowed"
    };

    const backButtonStyle = {
        ...buttonStyle,
        background: "#000",
        color: "#ffd966",
        border: "1px solid #23272f",
        marginTop: 0,
        marginBottom: "1.5rem",
        alignSelf: "flex-start",
        fontSize: "1rem",
        padding: "0.6rem 1.2rem"
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <button
                    style={backButtonStyle}
                    onClick={handleBack}
                    onMouseOver={e => e.currentTarget.style.background = "#181a1b"}
                    onMouseOut={e => e.currentTarget.style.background = "#000"}
                    aria-label="Back to saved logs"
                >
                    👈 Back to Saved Logs
                </button>
                <input
                    style={inputStyle}
                    value={table.tableName}
                    onChange={e => setTable({ ...table, tableName: e.target.value })}
                    placeholder="Training Log Name"
                    aria-label="Training log name"
                />
                <input
                    type="date"
                    style={inputStyle}
                    value={table.date}
                    onChange={handleDateChange}
                    aria-label="Training log date"
                />

                <hr style={{ border: "none", borderTop: "2px solid #181a1b", margin: "1rem 0" }} />

                {table.rows.map((row, i) => (
                    <TrainingLogRow
                        key={row.id}
                        rowData={row}
                        onUpdate={updated => updateRow(i, updated)}
                        onDelete={() => deleteRow(row.id)}
                        canDelete={table.rows.length > 1}
                    />
                ))}

                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                    <button
                        onClick={addRow}
                        style={buttonStyle}
                        onMouseOver={e => e.currentTarget.style.background = "#23272f"}
                        onMouseOut={e => e.currentTarget.style.background = "#181a1b"}
                    >
                        + Add Exercise
                    </button>

                    <button
                        onClick={deleteLastRow}
                        disabled={table.rows.length <= 1}
                        style={table.rows.length <= 1 ? disabledButtonStyle : buttonStyle}
                        onMouseOver={e => {
                            if (table.rows.length > 1) e.currentTarget.style.background = "#23272f";
                        }}
                        onMouseOut={e => {
                            if (table.rows.length > 1) e.currentTarget.style.background = "#181a1b";
                        }}
                    >
                        - Del Exercise
                    </button>

                    <button
                        onClick={handleSave}
                        style={buttonStyle}
                        onMouseOver={e => e.currentTarget.style.background = "#23272f"}
                        onMouseOut={e => e.currentTarget.style.background = "#181a1b"}
                    >
                        💾 Save Log
                    </button>
                </div>

                {error && (
                    <div style={{
                        color: "#e74c3c",
                        fontSize: "0.9rem",
                        textAlign: "center"
                    }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
