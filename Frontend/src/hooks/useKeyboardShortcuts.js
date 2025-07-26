import { useEffect } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * @param {Object} shortcuts - Object mapping key combinations to functions
 * @param {boolean} enabled - Whether shortcuts are enabled (default: true)
 * 
 * Example usage:
 * useKeyboardShortcuts({
 *   'ctrl+s': () => save(),
 *   'ctrl+shift+n': () => addNew(),
 *   'escape': () => cancel(),
 *   'enter': () => submit()
 * });
 */
export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event) => {
            // Build key combination string
            const keys = [];
            
            if (event.ctrlKey || event.metaKey) keys.push('ctrl');
            if (event.shiftKey) keys.push('shift');
            if (event.altKey) keys.push('alt');
            
            // Add the main key
            const key = event.key.toLowerCase();
            if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
                keys.push(key);
            }
            
            const combination = keys.join('+');
            
            // Execute matching shortcut
            if (shortcuts[combination]) {
                event.preventDefault();
                event.stopPropagation();
                shortcuts[combination](event);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [shortcuts, enabled]);
};

/**
 * Hook specifically for form navigation shortcuts
 * @param {Object} options - Configuration options
 */
export const useFormKeyboardNavigation = ({
    onSave,
    onAddRow,
    onDeleteRow,
    onEscape,
    enabled = true
} = {}) => {
    const shortcuts = {};
    
    if (onSave) shortcuts['ctrl+s'] = onSave;
    if (onAddRow) shortcuts['ctrl+enter'] = onAddRow;
    if (onDeleteRow) shortcuts['ctrl+backspace'] = onDeleteRow;
    if (onEscape) shortcuts['escape'] = onEscape;
    
    useKeyboardShortcuts(shortcuts, enabled);
};

/**
 * Hook for enhancing tab navigation in forms
 * @param {string} containerSelector - CSS selector for the form container
 * @param {boolean} enabled - Whether enhanced navigation is enabled
 */
export const useEnhancedTabNavigation = (containerSelector = '[data-form-container]', enabled = true) => {
    useEffect(() => {
        if (!enabled) return;

        const container = document.querySelector(containerSelector);
        if (!container) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Tab') {
                const focusableElements = container.querySelectorAll(
                    'input:not([disabled]), textarea:not([disabled]), button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                
                const focusedIndex = Array.from(focusableElements).indexOf(document.activeElement);
                
                if (event.shiftKey) {
                    // Shift+Tab - go backwards
                    if (focusedIndex <= 0) {
                        event.preventDefault();
                        focusableElements[focusableElements.length - 1]?.focus();
                    }
                } else {
                    // Tab - go forwards
                    if (focusedIndex >= focusableElements.length - 1) {
                        event.preventDefault();
                        focusableElements[0]?.focus();
                    }
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        
        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }, [containerSelector, enabled]);
};