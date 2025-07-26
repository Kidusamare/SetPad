import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTables } from '../../services/api';

const RecentWorkouts = () => {
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentWorkouts();
  }, []);

  const fetchRecentWorkouts = async () => {
    try {
      const tables = await getTables();
      const recent = tables.slice(0, 5); // Get 5 most recent workouts
      setRecentWorkouts(recent);
    } catch (error) {
      console.error('Error fetching recent workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div>
        <h3 style={{ color: 'var(--primary-50)', marginBottom: 'var(--space-6)' }}>
          Recent Workouts
        </h3>
        <div style={{ color: 'var(--primary-400)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--space-6)'
      }}>
        <h3 style={{ 
          color: 'var(--primary-50)', 
          margin: 0,
          fontSize: 'var(--font-size-xl)',
          fontWeight: 600
        }}>
          Recent Workouts
        </h3>
        <button
          onClick={() => navigate('/log')}
          style={{
            background: 'none',
            border: '1px solid var(--glass-border)',
            color: 'var(--accent-primary)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            transition: 'all var(--transition-normal)'
          }}
        >
          View All
        </button>
      </div>

      {recentWorkouts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          color: 'var(--primary-400)'
        }}>
          <p>No workouts yet. Start your first session!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {recentWorkouts.map((workout) => (
            <div
              key={workout.id}
              onClick={() => navigate(`/log/${workout.id}`)}
              style={{
                padding: 'var(--space-4)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 212, 255, 0.1)';
                e.target.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'var(--glass-border)';
              }}
            >
              <div>
                <div style={{ 
                  color: 'var(--primary-100)', 
                  fontWeight: 500,
                  marginBottom: 'var(--space-1)'
                }}>
                  {workout.tableName}
                </div>
                <div style={{ 
                  color: 'var(--primary-400)', 
                  fontSize: 'var(--font-size-sm)'
                }}>
                  {workout.rows.length} exercises
                </div>
              </div>
              <div style={{ 
                color: 'var(--primary-300)', 
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-mono)'
              }}>
                {formatDate(workout.date)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentWorkouts;