// Enhanced Category Theme System with Dark Mode Support
export const categoryThemes = {
  weddings: {
    name: 'Weddings & Related Events',
    colors: {
      primary: '#f4a6cd',
      secondary: '#fdf2f8',
      accent: '#ec4899',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
      darkBackground: 'linear-gradient(135deg, #2d1b2e 0%, #3c1f3e 50%, #4a1f4a 100%)',
      text: '#831843',
      darkText: '#f9a8d4',
      surface: 'rgba(253, 242, 248, 0.8)',
      darkSurface: 'rgba(45, 27, 46, 0.8)',
      border: 'rgba(244, 166, 205, 0.3)',
      darkBorder: 'rgba(249, 168, 212, 0.4)',
      shadow: 'rgba(236, 72, 153, 0.15)',
      darkShadow: 'rgba(236, 72, 153, 0.25)'
    },
    fonts: {
      display: '"Dancing Script", cursive',
      serif: '"Playfair Display", serif',
      sans: '"Poppins", sans-serif'
    },
    decorations: {
      particles: 'petals',
      overlay: 'sparkles',
      pattern: 'floral'
    },
    animations: {
      entrance: 'fadeInUp',
      hover: 'gentle-float',
      transition: 'slide-rose'
    }
  },
  
  family: {
    name: 'Family & Life Milestones',
    colors: {
      primary: '#f59e0b',
      secondary: '#fef3c7',
      accent: '#d97706',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fdba74 100%)',
      darkBackground: 'linear-gradient(135deg, #2d2416 0%, #3c2e1a 50%, #4a3520 100%)',
      text: '#92400e',
      darkText: '#fbbf24',
      surface: 'rgba(254, 243, 199, 0.8)',
      darkSurface: 'rgba(45, 36, 22, 0.8)',
      border: 'rgba(245, 158, 11, 0.3)',
      darkBorder: 'rgba(251, 191, 36, 0.4)',
      shadow: 'rgba(217, 119, 6, 0.15)',
      darkShadow: 'rgba(217, 119, 6, 0.25)'
    },
    fonts: {
      display: '"Crimson Text", serif',
      serif: '"Crimson Text", serif',
      sans: '"Inter", sans-serif'
    },
    decorations: {
      particles: 'memories',
      overlay: 'scrapbook',
      pattern: 'photo-frames'
    },
    animations: {
      entrance: 'flipIn',
      hover: 'page-turn',
      transition: 'slide-warm'
    }
  },
  
  celebrations: {
    name: 'Celebrations & Parties',
    colors: {
      primary: '#f97316',
      secondary: '#fed7aa',
      accent: '#ea580c',
      background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 50%, #fb923c 100%)',
      darkBackground: 'linear-gradient(135deg, #2d1f16 0%, #3c2a1a 50%, #4a3220 100%)',
      text: '#c2410c',
      darkText: '#fb923c',
      surface: 'rgba(254, 215, 170, 0.8)',
      darkSurface: 'rgba(45, 31, 22, 0.8)',
      border: 'rgba(249, 115, 22, 0.3)',
      darkBorder: 'rgba(251, 146, 60, 0.4)',
      shadow: 'rgba(234, 88, 12, 0.15)',
      darkShadow: 'rgba(234, 88, 12, 0.25)'
    },
    fonts: {
      display: '"Fredoka One", cursive',
      serif: '"Playfair Display", serif',
      sans: '"Poppins", sans-serif'
    },
    decorations: {
      particles: 'confetti',
      overlay: 'sparkles',
      pattern: 'party'
    },
    animations: {
      entrance: 'bounceIn',
      hover: 'party-bounce',
      transition: 'slide-vibrant'
    }
  },
  
  travel: {
    name: 'Travel & Adventures',
    colors: {
      primary: '#0ea5e9',
      secondary: '#e0f2fe',
      accent: '#0284c7',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
      darkBackground: 'linear-gradient(135deg, #1e2832 0%, #1e3a4a 50%, #1e4a5a 100%)',
      text: '#0c4a6e',
      darkText: '#7dd3fc',
      surface: 'rgba(224, 242, 254, 0.8)',
      darkSurface: 'rgba(30, 40, 50, 0.8)',
      border: 'rgba(14, 165, 233, 0.3)',
      darkBorder: 'rgba(125, 211, 252, 0.4)',
      shadow: 'rgba(2, 132, 199, 0.15)',
      darkShadow: 'rgba(2, 132, 199, 0.25)'
    },
    fonts: {
      display: '"Montserrat", sans-serif',
      serif: '"Merriweather", serif',
      sans: '"Open Sans", sans-serif'
    },
    decorations: {
      particles: 'clouds',
      overlay: 'parallax',
      pattern: 'maps'
    },
    animations: {
      entrance: 'slideInFromRight',
      hover: 'drift',
      transition: 'slide-sky'
    }
  },
  
  special: {
    name: 'Special Events & Occasions',
    colors: {
      primary: '#6366f1',
      secondary: '#e0e7ff',
      accent: '#4f46e5',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
      darkBackground: 'linear-gradient(135deg, #1e1b2e 0%, #2a1f3e 50%, #3a2a5a 100%)',
      text: '#3730a3',
      darkText: '#a5b4fc',
      surface: 'rgba(224, 231, 255, 0.8)',
      darkSurface: 'rgba(30, 27, 46, 0.8)',
      border: 'rgba(99, 102, 241, 0.3)',
      darkBorder: 'rgba(165, 180, 252, 0.4)',
      shadow: 'rgba(79, 70, 229, 0.15)',
      darkShadow: 'rgba(79, 70, 229, 0.25)'
    },
    fonts: {
      display: '"Cormorant Garamond", serif',
      serif: '"Cormorant Garamond", serif',
      sans: '"Inter", sans-serif'
    },
    decorations: {
      particles: 'bokeh',
      overlay: 'glow',
      pattern: 'elegant'
    },
    animations: {
      entrance: 'fadeInScale',
      hover: 'elegant-lift',
      transition: 'slide-premium'
    }
  },
  
  personal: {
    name: 'Personal & Creative Albums',
    colors: {
      primary: '#8b5cf6',
      secondary: '#f3e8ff',
      accent: '#7c3aed',
      background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
      darkBackground: 'linear-gradient(135deg, #2d1b3e 0%, #3c1f5a 50%, #4a2a6a 100%)',
      text: '#5b21b6',
      darkText: '#d8b4fe',
      surface: 'rgba(243, 232, 255, 0.8)',
      darkSurface: 'rgba(45, 27, 62, 0.8)',
      border: 'rgba(139, 92, 246, 0.3)',
      darkBorder: 'rgba(216, 180, 254, 0.4)',
      shadow: 'rgba(124, 58, 237, 0.15)',
      darkShadow: 'rgba(124, 58, 237, 0.25)'
    },
    fonts: {
      display: '"Pacifico", cursive',
      serif: '"Libre Baskerville", serif',
      sans: '"Nunito", sans-serif'
    },
    decorations: {
      particles: 'artistic',
      overlay: 'brushstrokes',
      pattern: 'creative'
    },
    animations: {
      entrance: 'rotateIn',
      hover: 'creative-bounce',
      transition: 'slide-artistic'
    }
  }
};

export const getTheme = (category) => {
  return categoryThemes[category] || categoryThemes.weddings;
};

export const getCategoryIcon = (category) => {
  const icons = {
    weddings: '💍',
    family: '👨‍👩‍👧‍👦',
    celebrations: '🎉',
    travel: '✈️',
    special: '🌟',
    personal: '🎨'
  };
  return icons[category] || '💍';
};

// Apply theme to document root for CSS variables
export const applyTheme = (category, isDark = false) => {
  const theme = getTheme(category);
  const root = document.documentElement;
  
  // Set theme-specific CSS variables
  root.style.setProperty('--theme-primary', isDark ? theme.colors.darkText : theme.colors.primary);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-text', isDark ? theme.colors.darkText : theme.colors.text);
  root.style.setProperty('--theme-bg', isDark ? theme.colors.darkBackground : theme.colors.background);
  root.style.setProperty('--theme-surface', isDark ? theme.colors.darkSurface : theme.colors.surface);
  root.style.setProperty('--theme-border', isDark ? theme.colors.darkBorder : theme.colors.border);
  root.style.setProperty('--theme-shadow', isDark ? theme.colors.darkShadow : theme.colors.shadow);
  
  // Add theme class to body
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${category}`);
};

// Remove theme from document
export const removeTheme = () => {
  const root = document.documentElement;
  const themeVars = [
    '--theme-primary', '--theme-secondary', '--theme-accent', 
    '--theme-text', '--theme-bg', '--theme-surface', 
    '--theme-border', '--theme-shadow'
  ];
  
  themeVars.forEach(varName => {
    root.style.removeProperty(varName);
  });
  
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
};

// Get theme colors for a specific category and mode
export const getThemeColors = (category, isDark = false) => {
  const theme = getTheme(category);
  return {
    primary: isDark ? theme.colors.darkText : theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    text: isDark ? theme.colors.darkText : theme.colors.text,
    background: isDark ? theme.colors.darkBackground : theme.colors.background,
    surface: isDark ? theme.colors.darkSurface : theme.colors.surface,
    border: isDark ? theme.colors.darkBorder : theme.colors.border,
    shadow: isDark ? theme.colors.darkShadow : theme.colors.shadow
  };
};