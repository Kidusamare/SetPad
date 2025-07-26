import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for debounced auto-save functionality
 * Prevents infinite loops by debouncing save operations and tracking save state
 * 
 * @param {Function} saveFunction - Function to call for saving data
 * @param {*} data - Data to save (will trigger save when changed)
 * @param {number} delay - Debounce delay in milliseconds (default: 2000)
 * @param {boolean} enabled - Whether auto-save is enabled (default: true)
 * @returns {Object} - { save: manualSaveFunction, isSaving: boolean, lastSaved: Date }
 */
export const useAutoSave = (saveFunction, data, delay = 2000, enabled = true) => {
    const timeoutRef = useRef(null);
    const isSavingRef = useRef(false);
    const lastSavedDataRef = useRef(null);
    const lastSavedTimeRef = useRef(null);

    // Create a stable save function that doesn't change on every render
    const stableSaveFunction = useCallback(saveFunction, []);

    // Manual save function that can be called immediately
    const manualSave = useCallback(async () => {
        if (isSavingRef.current) return;
        
        try {
            isSavingRef.current = true;
            await stableSaveFunction(data);
            lastSavedDataRef.current = JSON.stringify(data);
            lastSavedTimeRef.current = new Date();
        } catch (error) {
            console.error('Save failed:', error);
            throw error;
        } finally {
            isSavingRef.current = false;
        }
    }, [data, stableSaveFunction]);

    // Auto-save effect
    useEffect(() => {
        if (!enabled || !data) return;

        // Don't auto-save if data hasn't changed
        const currentDataString = JSON.stringify(data);
        if (currentDataString === lastSavedDataRef.current) {
            return;
        }

        // Don't auto-save if currently saving
        if (isSavingRef.current) {
            return;
        }

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout for debounced save
        timeoutRef.current = setTimeout(async () => {
            try {
                await manualSave();
                console.log('Auto-saved at:', new Date().toLocaleTimeString());
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }, delay);

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, delay, enabled, manualSave]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        save: manualSave,
        isSaving: isSavingRef.current,
        lastSaved: lastSavedTimeRef.current
    };
};