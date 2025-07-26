import React, { useState, useEffect } from 'react';
import { getTables } from '../../services/api';
import './DashboardStats.css';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisWeek: 0,
    currentStreak: 0,
    totalExercises: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const tables = await getTables();
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Calculate stats
      const totalWorkouts = tables.length;
      const thisWeek = tables.filter(table => 
        new Date(table.date) >= oneWeekAgo
      ).length;
      
      const totalExercises = tables.reduce((acc, table) => 
        acc + table.rows.length, 0
      );

      // Calculate streak (simplified - consecutive days with workouts)
      const sortedDates = tables
        .map(table => table.date)
        .sort((a, b) => new Date(b) - new Date(a));
      
      let currentStreak = 0;
      if (sortedDates.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
          currentStreak = 1;
          // Simple streak calculation - can be enhanced
          for (let i = 1; i < sortedDates.length; i++) {
            const current = new Date(sortedDates[i]);
            const previous = new Date(sortedDates[i - 1]);
            const diffDays = (previous - current) / (1000 * 60 * 60 * 24);
            
            if (diffDays <= 2) { // Allow 1 day gap
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }

      setStats({
        totalWorkouts,
        thisWeek,
        currentStreak,
        totalExercises
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statItems = [
    {
      label: 'Total Workouts',
      value: stats.totalWorkouts,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
      color: 'var(--accent-primary)',
      trend: '+12%'
    },
    {
      label: 'This Week',
      value: stats.thisWeek,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      color: 'var(--accent-success)',
      trend: '+25%'
    },
    {
      label: 'Current Streak',
      value: stats.currentStreak,
      suffix: stats.currentStreak === 1 ? 'day' : 'days',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
      ),
      color: 'var(--accent-warning)',
      trend: '🔥'
    },
    {
      label: 'Total Exercises',
      value: stats.totalExercises,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6.2 5h12l3 7H9.2l-3-7z"/>
          <path d="M6 5V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/>
        </svg>
      ),
      color: 'var(--accent-tertiary)',
      trend: '+8%'
    }
  ];

  if (isLoading) {
    return (
      <div className="dashboard-stats">
        <div className="stats-header">
          <h2 className="stats-title">Your Progress</h2>
          <div className="loading-pulse">Loading...</div>
        </div>
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card loading">
              <div className="stat-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-stats">
      <div className="stats-header">
        <h2 className="stats-title">Your Progress</h2>
        <p className="stats-subtitle">Track your fitness journey</p>
      </div>
      
      <div className="stats-grid">
        {statItems.map((stat, index) => (
          <div 
            key={stat.label}
            className="stat-card"
            style={{ '--delay': `${index * 0.1}s` }}
          >
            <div className="stat-header">
              <div className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-trend">{stat.trend}</div>
            </div>
            
            <div className="stat-content">
              <div className="stat-value">
                {stat.value.toLocaleString()}
                {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
            
            {/* Animated background effect */}
            <div 
              className="stat-glow"
              style={{ '--glow-color': stat.color }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;