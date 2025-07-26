import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIService from '../../services/aiCacheService';

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const result = await AIService.getInsights();
      setInsights(result.data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h3 style={{ color: 'var(--primary-50)', marginBottom: 'var(--space-6)' }}>
          AI Insights
        </h3>
        <div style={{ color: 'var(--primary-400)' }}>Analyzing your progress...</div>
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
          AI Insights
        </h3>
        <button
          onClick={() => navigate('/ai-coaching')}
          style={{
            background: 'var(--gradient-primary)',
            border: 'none',
            color: 'white',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
            transition: 'all var(--transition-normal)'
          }}
        >
          Chat with AI
        </button>
      </div>

      {insights ? (
        <div>
          {insights.analytics && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: 'var(--font-size-2xl)', 
                    fontWeight: 700, 
                    color: 'var(--accent-primary)',
                    fontFamily: 'var(--font-family-mono)'
                  }}>
                    {insights.analytics.total_workouts || 0}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--primary-400)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Total Workouts
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: 'var(--font-size-2xl)', 
                    fontWeight: 700, 
                    color: 'var(--accent-success)',
                    fontFamily: 'var(--font-family-mono)'
                  }}>
                    {insights.analytics.recent_workouts || 0}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--primary-400)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    This Month
                  </div>
                </div>
              </div>
            </div>
          )}

          {insights.ai_insights && (
            <div style={{
              padding: 'var(--space-4)',
              background: 'rgba(0, 212, 255, 0.05)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-4)'
            }}>
              <div style={{
                color: 'var(--primary-200)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 1.6,
                whiteSpace: 'pre-line'
              }}>
                {insights.ai_insights.slice(0, 200)}
                {insights.ai_insights.length > 200 && '...'}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/progress')}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              background: 'none',
              border: '1px solid var(--glass-border)',
              color: 'var(--primary-300)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              transition: 'all var(--transition-normal)'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--accent-primary)';
              e.target.style.color = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--glass-border)';
              e.target.style.color = 'var(--primary-300)';
            }}
          >
            View Full Analytics →
          </button>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          color: 'var(--primary-400)'
        }}>
          <p>Start logging workouts to get AI insights!</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;