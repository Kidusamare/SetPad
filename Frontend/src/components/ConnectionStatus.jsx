import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import offlineStorage from '../services/offlineStorage';

const ConnectionStatus = () => {
    const { theme } = useTheme();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [storageInfo, setStorageInfo] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // Update storage info periodically
        const updateStorageInfo = async () => {
            const info = await offlineStorage.getStorageInfo();
            setStorageInfo(info);
        };
        
        updateStorageInfo();
        const interval = setInterval(updateStorageInfo, 10000); // Update every 10 seconds
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    if (!storageInfo) return null;

    const hasUnsyncedData = storageInfo.unsyncedWorkouts > 0 || storageInfo.pendingSyncItems > 0;

    return (
        <div style={{
            position: 'fixed',
            bottom: '1rem',
            left: '1rem',
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        }}>
            {/* Connection Status Indicator */}
            <div
                onClick={() => setShowDetails(!showDetails)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: isOnline ? 
                        (hasUnsyncedData ? 'rgba(255, 193, 7, 0.9)' : 'rgba(40, 167, 69, 0.9)') : 
                        'rgba(220, 53, 69, 0.9)',
                    color: '#fff',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#fff',
                    animation: isOnline ? (hasUnsyncedData ? 'pulse 2s infinite' : 'none') : 'blink 1s infinite'
                }} />
                <span>
                    {isOnline ? 
                        (hasUnsyncedData ? 'Syncing...' : 'Online') : 
                        'Offline'
                    }
                </span>
            </div>

            {/* Details Panel */}
            {showDetails && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '0',
                    marginBottom: '0.5rem',
                    background: theme.cardBackground,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    minWidth: '250px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(20px)'
                }}>
                    <h4 style={{
                        margin: '0 0 1rem 0',
                        color: theme.accent,
                        fontSize: '1rem'
                    }}>
                        Connection Status
                    </h4>
                    
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: theme.text
                        }}>
                            <span>Status:</span>
                            <span style={{
                                color: isOnline ? '#28a745' : '#dc3545',
                                fontWeight: '600'
                            }}>
                                {isOnline ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: theme.text
                        }}>
                            <span>Total Workouts:</span>
                            <span style={{ color: theme.accent, fontWeight: '600' }}>
                                {storageInfo.totalWorkouts}
                            </span>
                        </div>
                        
                        {storageInfo.unsyncedWorkouts > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                color: theme.text
                            }}>
                                <span>Unsynced:</span>
                                <span style={{ color: '#ffc107', fontWeight: '600' }}>
                                    {storageInfo.unsyncedWorkouts}
                                </span>
                            </div>
                        )}
                        
                        {storageInfo.pendingSyncItems > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                color: theme.text
                            }}>
                                <span>Pending Sync:</span>
                                <span style={{ color: '#ffc107', fontWeight: '600' }}>
                                    {storageInfo.pendingSyncItems}
                                </span>
                            </div>
                        )}
                        
                        {storageInfo.lastSync && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                color: theme.textSecondary,
                                fontSize: '0.8rem'
                            }}>
                                <span>Last Sync:</span>
                                <span>
                                    {new Date(storageInfo.lastSync).toLocaleTimeString()}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {!isOnline && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: 'rgba(220, 53, 69, 0.1)',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            color: theme.text,
                            lineHeight: '1.4',
                            border: '1px solid rgba(220, 53, 69, 0.3)'
                        }}>
                            <strong>Offline Mode:</strong> Your workouts are being saved locally and will sync automatically when you're back online.
                        </div>
                    )}
                    
                    {hasUnsyncedData && isOnline && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: 'rgba(255, 193, 7, 0.1)',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            color: theme.text,
                            lineHeight: '1.4',
                            border: '1px solid rgba(255, 193, 7, 0.3)'
                        }}>
                            <strong>Syncing:</strong> Some changes are being synchronized with the server.
                        </div>
                    )}
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

export default ConnectionStatus;