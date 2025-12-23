# Dark Mode & Theme Enhancements

## Overview
Comprehensive dark mode implementation for all theme categories with enhanced animations and improved design consistency.

## Key Enhancements

### 1. Enhanced Theme System
- **Comprehensive Dark Mode Support**: Each category now has dedicated dark mode colors
- **Dynamic Theme Variables**: CSS variables that adapt to both category and dark/light mode
- **Theme Utility Functions**: `applyTheme()`, `removeTheme()`, `getThemeColors()` for dynamic theme management

### 2. Category-Specific Dark Mode Colors
Each theme category now includes:
- `darkBackground`: Dark mode gradient backgrounds
- `darkSurface`: Dark mode surface colors with transparency
- `darkBorder`: Dark mode border colors with proper opacity
- `darkShadow`: Enhanced shadow colors for dark mode
- `darkText`: Optimized text colors for dark backgrounds

### 3. Enhanced Animations
- **Theme-Aware Animations**: Animations now use theme colors dynamically
- **Improved Hover Effects**: Enhanced button and card hover states
- **Particle System**: Theme-aware particles that match category colors
- **Smooth Transitions**: Better animation timing and easing functions

### 4. Interactive Elements
- **Enhanced Buttons**: Theme-aware primary and ghost buttons with shimmer effects
- **Smart Cards**: Cards with theme-specific borders, shadows, and hover effects
- **Category Pills**: Dynamic category selector with theme-aware styling
- **Input Fields**: Enhanced form inputs with theme-specific focus states

### 5. Accessibility Improvements
- **Reduced Motion Support**: Respects user's motion preferences
- **High Contrast Mode**: Enhanced contrast for better accessibility
- **Color Scheme Detection**: Automatic dark mode based on system preferences
- **Keyboard Navigation**: Improved focus states and navigation

### 6. Performance Optimizations
- **CSS Variables**: Efficient theme switching without re-rendering
- **Conditional Animations**: Animations only when needed
- **Optimized Particles**: Better particle system performance

## Theme Categories Enhanced

### 1. Weddings 💍
- **Light**: Soft pinks and roses with elegant gradients
- **Dark**: Deep purples and magentas with warm accents

### 2. Family 👨‍👩‍👧‍👦
- **Light**: Warm ambers and golds with cozy feel
- **Dark**: Rich browns and golden highlights

### 3. Celebrations 🎉
- **Light**: Vibrant oranges and warm tones
- **Dark**: Deep oranges with energetic accents

### 4. Travel ✈️
- **Light**: Sky blues and ocean tones
- **Dark**: Deep navy with bright blue accents

### 5. Special Events 🌟
- **Light**: Royal purples and elegant indigos
- **Dark**: Deep purples with bright highlights

### 6. Personal/Creative 🎨
- **Light**: Creative purples and artistic tones
- **Dark**: Rich purples with vibrant accents

## New Components & Hooks

### `useTheme` Hook
```javascript
const { isDark, themeColors, toggleDarkMode, changeCategory } = useTheme('weddings');
```

### Enhanced Particle System
- Theme-aware particle colors
- Category-specific particle types
- Improved performance and animations

### Theme Utilities
- `applyTheme(category, isDark)`: Apply theme dynamically
- `getThemeColors(category, isDark)`: Get theme colors
- `removeTheme()`: Clean up theme application

## CSS Enhancements

### New Animation Classes
- `.animate-glow`: Theme-aware glow effect
- `.animate-pulse-theme`: Theme-specific pulse animation
- `.animate-bounce-in`: Enhanced bounce entrance
- `.animate-slide-up`: Smooth slide-up animation
- `.animate-fade-in-scale`: Scale with fade animation

### Enhanced Component Classes
- `.card-enhanced`: Theme-aware cards with shimmer effects
- `.input-enhanced`: Theme-specific form inputs
- `.category-pill`: Dynamic category selector styling
- `.interactive-element`: Universal interactive element styling

## Browser Support
- Modern browsers with CSS custom properties support
- Graceful fallbacks for older browsers
- Respects system preferences for color scheme and motion

## Usage Examples

### Apply Theme Dynamically
```javascript
import { applyTheme } from './themes/categories';
applyTheme('weddings', true); // Apply wedding theme in dark mode
```

### Use Theme Hook
```javascript
import useTheme from './hooks/useTheme';

function MyComponent() {
  const { themeColors, isDark, toggleDarkMode } = useTheme('family');
  
  return (
    <div style={{ background: themeColors.background }}>
      <button onClick={toggleDarkMode}>
        Toggle {isDark ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}
```

### Theme-Aware Particles
```javascript
<ParticleSystem 
  type="petals" 
  count={20} 
  category="weddings" 
  className="fixed inset-0" 
/>
```

## Future Enhancements
- Custom theme creation interface
- Theme preview system
- Advanced animation controls
- More particle types and effects
- Theme-based sound effects