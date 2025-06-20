import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrainingLogManager } from "./TrainingLogManager";

const manager = new TrainingLogManager();

export default function SavedTablesPage() {
    const [tables, setTables] = useState([]);
    const [sortMethod, setSortMethod] = useState("date");
    const navigate = useNavigate();

    useEffect(() => {
        const loadTables = async () => {
            try {
                const savedTables = await manager.listSavedTables();
                setTables(savedTables);
            } catch (err) {
                console.error("Failed to load tables", err);
                setTables([]);
            }
        };
        loadTables();
    }, []);

    const handleDelete = async (id) => {
        try {
            if (window.confirm("Are you sure you want to delete this log?")) {
                await manager.deleteTable(id);
                setTables(prevTables => prevTables.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete table:', error);
            alert('Failed to delete table. Please try again.');
        }
    };

    const handleNewTable = async () => {
        try {
            const today = new Date().toISOString().split("T")[0];
            const defaultName = "New Table";
            let exists = tables.some(t => t.tableName === defaultName && t.date === today);
            let name = defaultName;
            let count = 1;

            while (exists) {
                name = `${defaultName} (${count})`;
                exists = tables.some(t => t.tableName === name && t.date === today);
                count++;
            }

            const newTable = {
                id: crypto.randomUUID(),
                tableName: name,
                date: today,
                rows: [
                    {
                        id: 0,
                        muscleGroup: "Strength-Focus🏋️",
                        exercise: "",
                        sets: [{ reps: "", weight: "" }, { reps: "", weight: "" }],
                        notes: "No notes 😊",
                        showNotes: false,
                        weightUnit: "lbs"
                    }
                ]
            };

            await manager.saveTable(name, today, newTable);
            navigate(`/log/${newTable.id}`);
        } catch (error) {
            console.error('Failed to create new table:', error);
        }
    };

    const sortedTables = [...tables].sort((a, b) => {
        if (sortMethod === "date") return b.date.localeCompare(a.date);
        if (sortMethod === "lastOpened") {
            return (b.lastOpened || "").localeCompare(a.lastOpened || "");
        }
        return a.tableName.localeCompare(b.tableName);
    });

    const pageStyle = {
        padding: "2rem 0",
        background: "#000",
        minHeight: "100vh",
        fontFamily: "'San Francisco', 'Segoe UI', Arial, sans-serif",
        color: "#f5f6fa",
    };

    const listStyle = {
        listStyle: "none",
        padding: 0,
        maxWidth: 520,
        margin: "2rem auto 0 auto",
    };

    const itemStyle = {
        margin: "1.2rem 0",
        padding: "1.2rem 1.6rem",
        background: "#111",
        borderRadius: "18px",
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.18)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        transition: "box-shadow 0.2s, background 0.2s",
        border: "1px solid #181a1b",
        cursor: "pointer"
    };

    const infoStyle = {
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
    };

    const titleStyle = {
        fontWeight: 600,
        fontSize: "1.1rem",
        color: "#f5f6fa",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        letterSpacing: 0.2,
    };

    const dateStyle = {
        fontSize: "0.98rem",
        color: "#b0b3b8",
        marginLeft: 8,
        fontWeight: 400,
    };

    const lastOpenedStyle = {
        fontSize: "0.92rem",
        color: "#888",
        marginTop: 2,
        opacity: 0.8,
    };

    const trashButtonStyle = {
        background: "none",
        border: "none",
        color: "#ff4d4f",
        cursor: "pointer",
        padding: 0,
        marginLeft: "1.2rem",
        fontSize: "1.2rem",
        display: "flex",
        alignItems: "center",
        position: "absolute",
        right: 18,
        top: "50%",
        transform: "translateY(-50%)",
        opacity: 0.7,
        transition: "opacity 0.15s, background 0.15s",
        borderRadius: "50%",
        height: 32,
        width: 32,
        justifyContent: "center",
        backgroundColor: "transparent"
    };

    const newTableButtonStyle = {
        background: "#181a1b",
        color: "#ffd966",
        border: "none",
        borderRadius: "10px",
        padding: "0.8rem 1.6rem",
        fontWeight: 700,
        fontSize: "1.1rem",
        margin: "0 auto 1.2rem auto",
        display: "block",
        cursor: "pointer",
        transition: "background 0.2s",
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)"
    };

    return (
        <div style={pageStyle}>
            <div style={{ maxWidth: 520, margin: "0 auto" }}>
                <h2 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: "1.2rem", color: "#f5f6fa" }}>
                    Saved Training Logs
                </h2>
                <button
                    style={newTableButtonStyle}
                    onClick={handleNewTable}
                    onMouseOver={e => e.currentTarget.style.background = "#23272f"}
                    onMouseOut={e => e.currentTarget.style.background = "#181a1b"}
                >
                    + New Table
                </button>
                <div style={{ marginBottom: "1.2rem", display: "flex", alignItems: "center" }}>
                    <label style={{ fontWeight: 500, marginRight: 8 }}>Sort by:</label>
                    <select
                        value={sortMethod}
                        onChange={e => setSortMethod(e.target.value)}
                        style={{
                            border: "1px solid #222",
                            borderRadius: 8,
                            padding: "0.4rem 1rem",
                            fontSize: "1rem",
                            background: "#000",
                            color: "#f5f6fa",
                            outline: "none",
                        }}
                    >
                        <option value="date">Date</option>
                        <option value="lastOpened">Last Opened</option>
                        <option value="name">Name</option>
                    </select>
                </div>
                <ul style={listStyle}>
                    {sortedTables.map(t => (
                        <li key={t.id} style={itemStyle}>
                            <Link 
                                to={`/log/${t.id}`}
                                style={{ textDecoration: "none", color: "inherit", display: "flex", flex: 1 }}
                            >
                                <div style={infoStyle}>
                                    <span style={titleStyle}>{t.tableName}</span>
                                    <span style={dateStyle}>– {t.date}</span>
                                    {t.lastOpened && (
                                        <div style={lastOpenedStyle}>
                                            Last opened: {new Date(t.lastOpened).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDelete(t.id);
                                }}
                                style={trashButtonStyle}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
