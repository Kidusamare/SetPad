import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickActions.css';

const QuickActions = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      id: 'new-workout',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
      label: 'New Workout',
      onClick: () => navigate('/log')
    },
    {
      id: 'ai-coach',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      label: 'Ask AI',
      onClick: () => navigate('/ai-coaching')
    },
    {
      id: 'import',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 16 12 12 8 16"/>
          <line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
        </svg>
      ),
      label: 'Import Data',
      onClick: () => navigate('/import-data')
    },
    {
      id: 'analytics',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
      ),
      label: 'View Progress',
      onClick: () => navigate('/progress')
    }
  ];

  const handleActionClick = (action) => {
    action.onClick();
    setIsExpanded(false);
  };

  return (
    <div className={`quick-actions ${isExpanded ? 'expanded' : ''}`}>
      {/* Action Items */}
      <div className="quick-actions-items">
        {actions.map((action, index) => (
          <button
            key={action.id}
            className="quick-action-item"
            onClick={() => handleActionClick(action)}
            style={{ '--delay': `${index * 0.05}s` }}
            title={action.label}
          >
            <div className="quick-action-icon">
              {action.icon}
            </div>
            <span className="quick-action-label">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main Toggle Button */}
      <button 
        className="quick-actions-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Close quick actions' : 'Open quick actions'}
      >
        <div className="toggle-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
      </button>

      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="quick-actions-backdrop"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default QuickActions;