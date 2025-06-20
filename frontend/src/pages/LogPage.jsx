import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrainingLogManager } from '../components/TrainingLog/TrainingLogManager';

const manager = new TrainingLogManager();

export default function LogPage() {
    const [tables, setTables] = useState([]);
    const [sortMethod, setSortMethod] = useState("date");
    const navigate = useNavigate();

    useEffect(() => {
        const loadTables = () => {
            const savedTables = manager.listSavedTables();
            setTables(savedTables);
        };
        loadTables();
    }, []);

    // Sort tables based on selected method
    const sortedTables = [...tables].sort((a, b) => {
        if (sortMethod === "date") return b.date.localeCompare(a.date);
        if (sortMethod === "lastOpened") return (b.lastOpened || "").localeCompare(a.lastOpened || "");
        return a.tableName.localeCompare(b.tableName);
    });

    const handleDelete = async (tableName, date) => {
        if (window.confirm("Are you sure you want to delete this log?")) {
            await manager.deleteTable(tableName, date);
            setTables(tables.filter(t => 
                t.tableName !== tableName || t.date !== date
            ));
        }
    };

    const handleOpen = (tableName, date) => {
        navigate(`/log/${encodeURIComponent(tableName)}/${date}`);
    };

    // OLED-optimized styles
    const pageStyle = {
        background: "#000",
        color: "#f5f6fa",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "'San Francisco', 'Segoe UI', Arial, sans-serif"
    };

    const headerStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem"
    };

    const sortControlStyle = {
        background: "#111",
        border: "1px solid #333",
        color: "#f5f6fa",
        padding: "0.5rem",
        borderRadius: "8px"
    };

    return (
        <div style={pageStyle}>
            <div style={headerStyle}>
                <h1>Training Logs</h1>
                <select 
                    value={sortMethod}
                    onChange={(e) => setSortMethod(e.target.value)}
                    style={sortControlStyle}
                >
                    <option value="date">Sort by Date</option>
                    <option value="lastOpened">Sort by Last Opened</option>
                    <option value="name">Sort by Name</option>
                </select>
            </div>
            <div>
                {sortedTables.length === 0 ? (
                    <p>No training logs found. Create a new log to get started.</p>
                ) : (
                    sortedTables.map((table, index) => (
                        <div key={`${table.tableName}-${table.date}`} style={{ 
                            background: index % 2 === 0 ? "#111" : "transparent", 
                            padding: "1rem", 
                            borderRadius: "8px",
                            marginBottom: "1rem",
                            cursor: "pointer",
                            border: "1px solid #333"
                        }}>
                            <div style={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center" 
                            }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{table.tableName}</h2>
                                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#aaa" }}>
                                        Date: {new Date(table.date).toLocaleDateString()}
                                    </p>
                                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#aaa" }}>
                                        Last Opened: {table.lastOpened ? new Date(table.lastOpened).toLocaleString() : "Never"}
                                    </p>
                                </div>
                                <div>
                                    <button 
                                        onClick={() => handleOpen(table.tableName, table.date)}
                                        style={{ 
                                            background: "#007bff", 
                                            color: "#fff", 
                                            border: "none", 
                                            padding: "0.5rem 1rem", 
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            marginRight: "0.5rem"
                                        }}
                                    >
                                        Open
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(table.tableName, table.date)}
                                        style={{ 
                                            background: "red", 
                                            color: "#fff", 
                                            border: "none", 
                                            padding: "0.5rem 1rem", 
                                            borderRadius: "8px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}