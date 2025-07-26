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
import AppLayout from "./components/Layout/AppLayout";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Dashboard - Special case with custom layout */}
            <Route path="/" element={<Dashboard />} />
            
            {/* All other routes use AppLayout wrapper */}
            <Route path="/log" element={
              <AppLayout>
                <ErrorBoundary><SavedTablesPage /></ErrorBoundary>
              </AppLayout>
            } />
            <Route path="/log/:id" element={
              <AppLayout>
                <ErrorBoundary><TrainingLogTable /></ErrorBoundary>
              </AppLayout>
            } />
            <Route path="/import-data" element={
              <AppLayout>
                <ErrorBoundary><ImportDataPage /></ErrorBoundary>
              </AppLayout>
            } />
            <Route path="/ai-coaching" element={
              <AppLayout>
                <ErrorBoundary><AICoachingPage /></ErrorBoundary>
              </AppLayout>
            } />
            <Route path="/progress" element={
              <AppLayout>
                <ErrorBoundary><ProgressAnalytics /></ErrorBoundary>
              </AppLayout>
            } />
            <Route path="/settings" element={
              <AppLayout>
                <ErrorBoundary><SettingsPage /></ErrorBoundary>
              </AppLayout>
            } />
            <Route path="/search" element={
              <AppLayout>
                <ErrorBoundary><SearchPage /></ErrorBoundary>
              </AppLayout>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

