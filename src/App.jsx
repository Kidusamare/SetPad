import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Dashboard from "./pages/Dashboard";
import SavedTablesPage from "./components/SavedTablesPage";
import TrainingLogTable from "./components/TrainingLogTable";
import ImportDataPage from "./pages/ImportDataPage";
import AICoachingPage from "./pages/AICoachingPage";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />}>
                <Route index element={<SavedTablesPage />} />
              </Route>
              <Route path="/log" element={<SavedTablesPage />} />
              <Route path="/log/:id" element={<ErrorBoundary><TrainingLogTable /></ErrorBoundary>} />
              <Route path="/import-data" element={<ErrorBoundary><ImportDataPage /></ErrorBoundary>} />
              <Route path="/ai-coaching" element={<ErrorBoundary><AICoachingPage /></ErrorBoundary>} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

