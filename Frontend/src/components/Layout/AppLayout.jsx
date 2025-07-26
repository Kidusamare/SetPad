import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import QuickActions from './QuickActions';
import './AppLayout.css';

const AppLayout = ({ children }) => {
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  // Handle scroll progress
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  // Auto-collapse nav on route change (mobile)
  useEffect(() => {
    setIsNavExpanded(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* Progress Bar */}
      <div className="scroll-progress">
        <div 
          className="scroll-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navigation */}
      <Navigation 
        isExpanded={isNavExpanded}
        onToggle={() => setIsNavExpanded(!isNavExpanded)}
      />

      {/* Main Content */}
      <main className={`main-content ${isNavExpanded ? 'nav-expanded' : ''}`}>
        <div className="content-container">
          {children}
        </div>
      </main>

      {/* Quick Actions */}
      <QuickActions />

      {/* Background Effects */}
      <div className="bg-effects">
        <div className="bg-gradient-orb bg-gradient-orb-1" />
        <div className="bg-gradient-orb bg-gradient-orb-2" />
        <div className="bg-gradient-orb bg-gradient-orb-3" />
      </div>
    </div>
  );
};

export default AppLayout;