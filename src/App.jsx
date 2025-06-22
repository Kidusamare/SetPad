import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SavedTablesPage from "./components/SavedTablesPage";
import TrainingLogTable from "./components/TrainingLogTable";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SavedTablesPage />} />
        <Route path="/log/:id" element={<TrainingLogTable />} />
      </Routes>
    </BrowserRouter>
  );
}

