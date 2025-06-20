import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SavedTablesPage from "./components/TrainingLog/SavedTablesPage";
import TrainingLogTable from "./components/TrainingLog/TrainingLogTable";

const appContainerStyle = {
    minHeight: "100vh",
    background: "#000", // pitch black for OLED
    color: "#f5f6fa",
    fontFamily: "'San Francisco', 'Segoe UI', Arial, sans-serif",
    margin: 0,
    padding: 0,
    width: "100vw",
    boxSizing: "border-box"
};

export default function App() {
    return (
        <div style={appContainerStyle}>
            <Router>
                <Routes>
                    <Route path="/" element={<SavedTablesPage />} />
                    <Route path="/log/:id" element={<TrainingLogTable />} />
                </Routes>
            </Router>
        </div>
    );
}

