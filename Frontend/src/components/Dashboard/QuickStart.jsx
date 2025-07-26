import React from 'react';
import { useNavigate } from 'react-router-dom';
import TrainingLogManager from '../TrainingLogManager';
import './QuickStart.css';

const manager = new TrainingLogManager();

const QuickStart = () => {
  const navigate = useNavigate();

  const handleNewWorkout = async () => {
    const newTable = manager.createNewTable();
    await manager.createTable(newTable);
    navigate(`/log/${newTable.id}`);
  };

  const quickActions = [
    {
      id: 'new-workout',
      title: 'Start New Workout',
      description: 'Begin tracking your training session',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
      action: handleNewWorkout,
      primary: true
    },
    {
      id: 'view-logs',
      title: 'View Workout History',
      description: 'Browse your previous sessions',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
      ),
      action: () => navigate('/log')
    },
    {
      id: 'ai-coach',
      title: 'Ask AI Coach',
      description: 'Get personalized fitness guidance',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      action: () => navigate('/ai-coaching')
    },
    {
      id: 'import-data',
      title: 'Import Data',
      description: 'Upload workout data from files',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      ),
      action: () => navigate('/import-data')
    }
  ];

  return (
    <div className="quick-start">
      <div className="quick-start-header">
        <h2 className="quick-start-title">Quick Start</h2>
        <p className="quick-start-subtitle">Jump into your fitness routine</p>
      </div>

      <div className="quick-actions-grid">
        {quickActions.map((action, index) => (
          <button
            key={action.id}
            className={`quick-action ${action.primary ? 'primary' : ''}`}
            onClick={action.action}
            style={{ '--delay': `${index * 0.1}s` }}
          >
            <div className="quick-action-icon">
              {action.icon}
            </div>
            <div className="quick-action-content">
              <h3 className="quick-action-title">{action.title}</h3>
              <p className="quick-action-description">{action.description}</p>
            </div>
            <div className="quick-action-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="7" y1="17" x2="17" y2="7"/>
                <polyline points="7,7 17,7 17,17"/>
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickStart;