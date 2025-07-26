import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

export default function AutoComplete({ 
  value, 
  onChange, 
  placeholder, 
  suggestions, 
  onFocus,
  onBlur,
  style = {}
}) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredSuggestions(suggestions);
    } else {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
    setHighlightedIndex(-1);
  }, [inputValue, suggestions]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (onFocus) onFocus();
  };

  const handleInputBlur = () => {
    // Delay closing to allow for clicks on suggestions
    setTimeout(() => setIsOpen(false), 150);
    if (onBlur) onBlur();
  };

  const handleSuggestionMouseDown = (e, suggestion) => {
    e.preventDefault(); // Prevent input blur
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          const suggestion = filteredSuggestions[highlightedIndex];
          setInputValue(suggestion);
          onChange(suggestion);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        // No action needed for other keys
        break;
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          padding: "0.8rem",
          width: "100%",
          borderRadius: "8px",
          border: `1px solid ${theme.inputBorder}`,
          background: theme.inputBackground,
          color: theme.text,
          fontSize: "1rem",
          boxSizing: "border-box",
          transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
          ...style
        }}
      />
      
      {isOpen && filteredSuggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: theme.cardBackground,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: '8px',
          boxShadow: theme.shadow,
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto',
          marginTop: '4px'
        }}>
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onMouseDown={(e) => handleSuggestionMouseDown(e, suggestion)}
              style={{
                padding: '0.8rem',
                cursor: 'pointer',
                color: theme.text,
                background: index === highlightedIndex ? theme.surfaceSecondary : 'transparent',
                borderBottom: index < filteredSuggestions.length - 1 ? `1px solid ${theme.borderLight}` : 'none',
                transition: 'background-color 0.2s ease',
                fontSize: '0.9rem'
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 