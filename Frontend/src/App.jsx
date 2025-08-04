import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import SavedTablesPage from "./components/SavedTablesPage";
import TrainingLogTable from "./components/TrainingLogTable";
import ImportDataPage from "./pages/ImportDataPage";
import AICoachingPage from "./pages/AICoachingPage";
import ProgressAnalytics from "./pages/ProgressAnalytics";
import SettingsPage from "./pages/SettingsPage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLayout from "./components/Layout/AppLayout";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              {/* Dashboard - Special case with custom layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* All other routes use AppLayout wrapper */}
              <Route path="/log" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ErrorBoundary><SavedTablesPage /></ErrorBoundary>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/log/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ErrorBoundary><TrainingLogTable /></ErrorBoundary>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/import-data" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ErrorBoundary><ImportDataPage /></ErrorBoundary>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/ai-coaching" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ErrorBoundary><AICoachingPage /></ErrorBoundary>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/progress" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ErrorBoundary><ProgressAnalytics /></ErrorBoundary>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ErrorBoundary><SettingsPage /></ErrorBoundary>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/search" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ErrorBoundary><SearchPage /></ErrorBoundary>
                  </AppLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

