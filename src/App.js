import React from "react";
import TrainingLogTable from "./components/TrainingLogTable";

function App() {
  // Use the same dark background and text color as the rest of the app
  return (
    <div
      style={{
        background: "#23272f",
        minHeight: "100vh",
        color: "#f5f6fa",
        fontFamily: "'Segoe UI', 'San Francisco', 'Arial', sans-serif",
        margin: 0,
        padding: 0
      }}
    >
      <TrainingLogTable />
    </div>
  );
}

export default App;

