import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-backdrop)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)',
      fontFamily: 'var(--font-family-primary)'
    }}>
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-backdrop)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-12)',
        width: '100%',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 700,
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 var(--space-2) 0'
          }}>
            Welcome Back
          </h1>
          <p style={{
            color: 'var(--primary-300)',
            fontSize: 'var(--font-size-sm)',
            margin: 0
          }}>
            Sign in to your fitness tracker
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(255, 68, 102, 0.1)',
            border: '1px solid rgba(255, 68, 102, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            color: 'var(--accent-error)',
            fontSize: 'var(--font-size-sm)',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{
              display: 'block',
              marginBottom: 'var(--space-2)',
              color: 'var(--primary-100)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: 'var(--space-4)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--primary-100)',
                fontSize: 'var(--font-size-base)',
                fontFamily: 'var(--font-family-primary)',
                transition: 'var(--transition-normal)',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-primary)';
                e.target.style.boxShadow = 'var(--shadow-glow)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--glass-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-8)' }}>
            <label style={{
              display: 'block',
              marginBottom: 'var(--space-2)',
              color: 'var(--primary-100)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: 'var(--space-4)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--primary-100)',
                fontSize: 'var(--font-size-base)',
                fontFamily: 'var(--font-family-primary)',
                transition: 'var(--transition-normal)',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-primary)';
                e.target.style.boxShadow = 'var(--shadow-glow)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--glass-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 'var(--space-4)',
              background: loading ? 'var(--primary-600)' : 'var(--gradient-primary)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              color: 'white',
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              fontFamily: 'var(--font-family-primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'var(--transition-normal)',
              boxShadow: loading ? 'none' : 'var(--shadow-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-glow-strong)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-glow)';
              }
            }}
          >
            {loading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <div style={{
          textAlign: 'center',
          marginTop: 'var(--space-8)',
          paddingTop: 'var(--space-6)',
          borderTop: '1px solid var(--glass-border)'
        }}>
          <p style={{
            color: 'var(--primary-300)',
            fontSize: 'var(--font-size-sm)',
            margin: 0
          }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--accent-primary)',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'var(--transition-normal)'
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none';
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}