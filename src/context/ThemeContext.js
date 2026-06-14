import React, { createContext, useState } from 'react';

// Buat Context
export const ThemeContext = createContext();

// Buat Provider untuk membungkus App
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};