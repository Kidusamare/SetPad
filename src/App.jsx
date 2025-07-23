import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Dashboard from "./pages/Dashboard";
import SavedTablesPage from "./components/SavedTablesPage";
import TrainingLogTable from "./components/TrainingLogTable";
import ImportDataPage from "./pages/ImportDataPage";
import AICoachingPage from "./pages/AICoachingPage";
import ProgressAnalytics from "./pages/ProgressAnalytics";
import SettingsPage from "./pages/SettingsPage";
import SearchPage from "./pages/SearchPage";
import ErrorBoundary from "./components/ErrorBoundary";
import AICacheStatus from "./components/AICacheStatus";
import ConnectionStatus from "./components/ConnectionStatus";

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
              <Route path="/progress" element={<ErrorBoundary><ProgressAnalytics /></ErrorBoundary>} />
              <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
              <Route path="/search" element={<ErrorBoundary><SearchPage /></ErrorBoundary>} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
        
        {/* AI Cache Status for Development */}
        <AICacheStatus isDevelopment={process.env.NODE_ENV === 'development'} />
        
        {/* Connection Status */}
        <ConnectionStatus />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

