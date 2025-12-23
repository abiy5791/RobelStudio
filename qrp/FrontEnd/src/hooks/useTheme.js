import { useState, useEffect, useCallback } from 'react';
import { applyTheme, removeTheme, getThemeColors, getTheme } from '../themes/categories';

export const useTheme = (category = null) => {
  const [isDark, setIsDark] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(category);

  // Initialize theme state
  useEffect(() => {
    const darkMode = document.documentElement.classList.contains('dark');
    setIsDark(darkMode);
  }, []);

  // Apply theme when category or dark mode changes
  useEffect(() => {
    if (currentCategory) {
      applyTheme(currentCategory, isDark);
    }
    return () => {
      if (!currentCategory) {
        removeTheme();
      }
    };
  }, [currentCategory, isDark]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    
    const root = document.documentElement;
    root.classList.toggle('dark', newDarkMode);
    root.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
    
    try {
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, [isDark]);

  // Change category theme
  const changeCategory = useCallback((newCategory) => {
    setCurrentCategory(newCategory);
  }, []);

  // Get current theme colors
  const themeColors = currentCategory ? getThemeColors(currentCategory, isDark) : null;
  const themeConfig = currentCategory ? getTheme(currentCategory) : null;

  return {
    isDark,
    currentCategory,
    themeColors,
    themeConfig,
    toggleDarkMode,
    changeCategory,
    applyTheme: (cat) => applyTheme(cat, isDark),
    removeTheme
  };
};

export default useTheme;