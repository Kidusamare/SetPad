import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SavedTablesPage from "./components/SavedTablesPage";
import TrainingLogTable from "./components/TrainingLogTable";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<SavedTablesPage />} />
        </Route>
        <Route path="/log" element={<SavedTablesPage />} />
        <Route path="/log/:id" element={<TrainingLogTable />} />
      </Routes>
    </BrowserRouter>
  );
}

