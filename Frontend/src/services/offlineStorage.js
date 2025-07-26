/**
 * Offline Storage Service
 * Provides comprehensive offline support with automatic sync when online
 */

class OfflineStorage {
    constructor() {
        this.dbName = 'SetPadOfflineDB';
        this.version = 1;
        this.db = null;
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.initializeDB();
        this.setupOnlineDetection();
    }

    async initializeDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Workout logs store
                if (!db.objectStoreNames.contains('workoutLogs')) {
                    const workoutStore = db.createObjectStore('workoutLogs', { keyPath: 'id' });
                    workoutStore.createIndex('date', 'date', { unique: false });
                    workoutStore.createIndex('tableName', 'tableName', { unique: false });
                }
                
                // Sync queue store
                if (!db.objectStoreNames.contains('syncQueue')) {
                    db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                }
                
                // User preferences store
                if (!db.objectStoreNames.contains('preferences')) {
                    db.createObjectStore('preferences', { keyPath: 'key' });
                }
                
                // Exercise history for smart defaults
                if (!db.objectStoreNames.contains('exerciseHistory')) {
                    const exerciseStore = db.createObjectStore('exerciseHistory', { keyPath: 'id', autoIncrement: true });
                    exerciseStore.createIndex('exercise', 'exercise', { unique: false });
                    exerciseStore.createIndex('muscleGroup', 'muscleGroup', { unique: false });
                }
            };
        });
    }

    setupOnlineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingChanges();
            console.log('[Offline Storage] Back online, syncing changes...');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('[Offline Storage] Gone offline, storing changes locally');
        });
    }

    // Generic database operations
    async performDBOperation(storeName, operation, data = null) {
        if (!this.db) await this.initializeDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            let request;
            
            switch (operation) {
                case 'get':
                    request = store.get(data);
                    break;
                case 'getAll':
                    request = store.getAll();
                    break;
                case 'put':
                    request = store.put(data);
                    break;
                case 'delete':
                    request = store.delete(data);
                    break;
                case 'clear':
                    request = store.clear();
                    break;
                default:
                    reject(new Error(`Unknown operation: ${operation}`));
                    return;
            }
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Workout log operations
    async saveWorkoutLog(log) {
        try {
            // Always save locally first
            await this.performDBOperation('workoutLogs', 'put', {
                ...log,
                lastModified: new Date().toISOString(),
                synced: false
            });
            
            // If online, try to sync immediately
            if (this.isOnline) {
                await this.syncWorkoutLog(log);
            } else {
                // Add to sync queue
                await this.addToSyncQueue('saveWorkoutLog', log);
            }
            
            return true;
        } catch (error) {
            console.error('[Offline Storage] Error saving workout log:', error);
            return false;
        }
    }

    async loadWorkoutLog(id) {
        try {
            return await this.performDBOperation('workoutLogs', 'get', id);
        } catch (error) {
            console.error('[Offline Storage] Error loading workout log:', error);
            return null;
        }
    }

    async getAllWorkoutLogs() {
        try {
            const logs = await this.performDBOperation('workoutLogs', 'getAll');
            return logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('[Offline Storage] Error loading workout logs:', error);
            return [];
        }
    }

    async deleteWorkoutLog(id) {
        try {
            await this.performDBOperation('workoutLogs', 'delete', id);
            
            if (this.isOnline) {
                await this.syncDeleteWorkoutLog(id);
            } else {
                await this.addToSyncQueue('deleteWorkoutLog', { id });
            }
            
            return true;
        } catch (error) {
            console.error('[Offline Storage] Error deleting workout log:', error);
            return false;
        }
    }

    // Sync queue operations
    async addToSyncQueue(operation, data) {
        await this.performDBOperation('syncQueue', 'put', {
            operation,
            data,
            timestamp: new Date().toISOString()
        });
    }

    async syncPendingChanges() {
        if (!this.isOnline) return;
        
        try {
            const syncItems = await this.performDBOperation('syncQueue', 'getAll');
            
            for (const item of syncItems) {
                try {
                    switch (item.operation) {
                        case 'saveWorkoutLog':
                            await this.syncWorkoutLog(item.data);
                            break;
                        case 'deleteWorkoutLog':
                            await this.syncDeleteWorkoutLog(item.data.id);
                            break;
                    }
                    
                    // Remove from sync queue after successful sync
                    await this.performDBOperation('syncQueue', 'delete', item.id);
                    
                } catch (syncError) {
                    console.warn('[Offline Storage] Failed to sync item:', item, syncError);
                    // Keep in queue for next attempt
                }
            }
            
            console.log(`[Offline Storage] Synced ${syncItems.length} pending changes`);
        } catch (error) {
            console.error('[Offline Storage] Error syncing pending changes:', error);
        }
    }

    // Actual sync operations (integrate with existing API)
    async syncWorkoutLog(log) {
        // This would integrate with your existing TrainingLogManager
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/tables`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(log)
            });
            
            if (response.ok) {
                // Mark as synced in local storage
                await this.performDBOperation('workoutLogs', 'put', {
                    ...log,
                    synced: true,
                    lastSynced: new Date().toISOString()
                });
            }
        } catch (error) {
            // Network error - keep in local storage unsynced
            throw error;
        }
    }

    async syncDeleteWorkoutLog(id) {
        try {
            await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/tables/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            throw error;
        }
    }

    // Exercise history for smart defaults
    async saveExerciseHistory(exerciseData) {
        const historyEntry = {
            exercise: exerciseData.exercise,
            muscleGroup: exerciseData.muscleGroup,
            sets: exerciseData.sets,
            date: exerciseData.date || new Date().toISOString(),
            weight: exerciseData.sets?.[0]?.weight || '',
            reps: exerciseData.sets?.[0]?.reps || ''
        };
        
        await this.performDBOperation('exerciseHistory', 'put', historyEntry);
    }

    async getExerciseHistory(exerciseName, limit = 10) {
        try {
            const allHistory = await this.performDBOperation('exerciseHistory', 'getAll');
            return allHistory
                .filter(entry => entry.exercise?.toLowerCase() === exerciseName?.toLowerCase())
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, limit);
        } catch (error) {
            console.error('[Offline Storage] Error getting exercise history:', error);
            return [];
        }
    }

    // User preferences
    async savePreference(key, value) {
        await this.performDBOperation('preferences', 'put', { key, value });
    }

    async getPreference(key, defaultValue = null) {
        try {
            const result = await this.performDBOperation('preferences', 'get', key);
            return result ? result.value : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }

    // Utility methods
    async getStorageInfo() {
        const workoutLogs = await this.getAllWorkoutLogs();
        const syncQueue = await this.performDBOperation('syncQueue', 'getAll');
        
        return {
            isOnline: this.isOnline,
            totalWorkouts: workoutLogs.length,
            unsyncedWorkouts: workoutLogs.filter(log => !log.synced).length,
            pendingSyncItems: syncQueue.length,
            lastSync: workoutLogs.find(log => log.synced)?.lastSynced || null
        };
    }

    async clearAllData() {
        const stores = ['workoutLogs', 'syncQueue', 'preferences', 'exerciseHistory'];
        for (const store of stores) {
            await this.performDBOperation(store, 'clear');
        }
    }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage;