import React from 'react';
import AppLayout from '../components/Layout/AppLayout';
import DashboardStats from '../components/Dashboard/DashboardStats';
import RecentWorkouts from '../components/Dashboard/RecentWorkouts';
import QuickStart from '../components/Dashboard/QuickStart';
import AIInsights from '../components/Dashboard/AIInsights';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="dashboard">
        {/* Hero Section */}
        <section className="dashboard-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to <span className="gradient-text">FitTracker</span>
            </h1>
            <p className="hero-subtitle">
              AI-powered fitness tracking that adapts to your journey
            </p>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="dashboard-section">
          <DashboardStats />
        </section>

        {/* Quick Actions */}
        <section className="dashboard-section">
          <QuickStart />
        </section>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Recent Workouts */}
          <section className="dashboard-card">
            <RecentWorkouts />
          </section>

          {/* AI Insights */}
          <section className="dashboard-card">
            <AIInsights />
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;