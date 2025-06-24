import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TrainingLogManager from "./TrainingLogManager";

const manager = new TrainingLogManager();

export default function SavedTablesPage({ previewMode = false }) {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);

    useEffect(() => {
        const fetchTables = async () => {
            const result = await manager.listTables();
            setTables(result);
        };
        fetchTables();
    }, []);

    const handleNewTable = async () => {
        const newTable = manager.createNewTable();
        await manager.saveTable(newTable);
        navigate(`/log/${newTable.id}`);
    };

    const handleOpenTable = (id) => {
        navigate(`/log/${id}`);
    };

    const handleDeleteTable = async (id) => {
        if (window.confirm("Are you sure you want to delete this table?")) {
            await manager.deleteTable(id);
            setTables((prev) => prev.filter((table) => table.id !== id));
        }
    };

    return (
        <div
            style={{
                padding: "2rem",
                paddingTop: "5.5rem", // Ensures content is pushed below the button
                background: "#000",
                minHeight: "100vh",
                color: "#f5f6fa",
                position: "relative"
            }}
        >
            {/* Back to Dashboard Button */}
            {!previewMode && (
                <button
                    onClick={() => navigate("/")}
                    style={{
                        position: "absolute",
                        top: "2rem",
                        left: "2rem",
                        background: "#31363f",
                        color: "#ffd966",
                        padding: "0.7rem 1.4rem",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "1rem",
                        cursor: "pointer",
                        zIndex: 10,
                        transition: "background 0.2s"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "#444950"}
                    onMouseOut={e => e.currentTarget.style.background = "#31363f"}
                >
                    ← Back to Dashboard
                </button>
            )}

            {!previewMode && (
                <>
                    <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Saved Training Logs</h1>
                    <button
                        onClick={handleNewTable}
                        style={{
                            background: "#31363f",
                            color: "#ffd966",
                            padding: "0.8rem 1.6rem",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: "600",
                            fontSize: "1rem",
                            cursor: "pointer",
                            marginBottom: "2rem"
                        }}
                    >
                        + New Table
                    </button>
                </>
            )}

            {tables.length === 0 ? (
                <p style={{ opacity: 0.7 }}>No saved tables yet.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {tables.map((table) => (
                        <li
                            key={table.id}
                            style={{
                                marginBottom: "1rem",
                                padding: "0.5rem 1rem",
                                background: "#1e1e1e",
                                borderRadius: "8px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div style={{ cursor: "pointer" }} onClick={() => handleOpenTable(table.id)}>
                                <strong>{table.tableName}</strong> — <em>{table.date}</em>
                            </div>
                            {!previewMode && (
                                <button
                                    onClick={() => handleDeleteTable(table.id)}
                                    style={{
                                        background: "#ff4d4f",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "0.4rem 0.8rem",
                                        cursor: "pointer"
                                    }}
                                >
                                    Delete
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
