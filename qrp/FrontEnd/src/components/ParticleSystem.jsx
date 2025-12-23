import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getThemeColors } from '../themes/categories';

export default function ParticleSystem({ type = 'petals', count = 20, className = '', category = 'weddings' }) {
  const isDark = document.documentElement.classList.contains('dark');
  const themeColors = getThemeColors(category, isDark);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: type === 'clouds' ? 10 + Math.random() * 30 : Math.random() * 100,
      delay: Math.random() * 8,
      duration: type === 'clouds' ? 15 + Math.random() * 10 : 4 + Math.random() * 6,
      size: 0.6 + Math.random() * 0.8,
    }));
    setParticles(newParticles);
  }, [count, type]);

  const getParticleComponent = (particle) => {
    const baseStyle = {
      position: 'absolute',
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      animationDelay: `${particle.delay}s`,
      animationDuration: `${particle.duration}s`,
      transform: `scale(${particle.size})`,
      pointerEvents: 'none'
    };

    switch (type) {
      case 'petals': {
        const petalRotation = Math.random() * 360;
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        return (
          <motion.div
            key={particle.id}
            className="particle petal"
            style={{
              ...baseStyle,
              background: isDarkMode
                ? `linear-gradient(135deg, ${themeColors.primary}F5, ${themeColors.accent}F0, ${themeColors.primary}E0)`
                : `linear-gradient(135deg, ${themeColors.primary}F0, ${themeColors.accent}E6, ${themeColors.primary}CC)`,
              width: `${12 + Math.random() * 8}px`,
              height: `${16 + Math.random() * 10}px`,
              borderRadius: '50% 0 50% 0',
              boxShadow: isDarkMode
                ? `0 2px 10px ${themeColors.primary}70, inset 0 1px 2px ${themeColors.accent}80`
                : `0 2px 8px ${themeColors.primary}50, inset 0 1px 2px ${themeColors.accent}70`,
            }}
            initial={{ opacity: 0, y: -20, rotate: petalRotation }}
            animate={{ 
              opacity: isDarkMode ? [0, 0.95, 0.8, 0] : [0, 0.9, 0.7, 0], 
              y: [0, 100], 
              rotate: [petalRotation, petalRotation + 360 + Math.random() * 180],
              x: [0, Math.sin(particle.id) * 30]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        );
      }

      case 'confetti': {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const colors = [themeColors.primary, themeColors.accent, '#FFD700', '#FF6B9D', '#4ECDC4'];
        const confettiShapes = ['rect', 'circle', 'triangle'];
        const shape = confettiShapes[Math.floor(Math.random() * confettiShapes.length)];
        const confettiColor = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <motion.div
            key={particle.id}
            className="particle confetti"
            style={{
              ...baseStyle,
              background: confettiColor,
              width: shape === 'rect' ? `${4 + Math.random() * 4}px` : `${6 + Math.random() * 4}px`,
              height: shape === 'rect' ? `${8 + Math.random() * 6}px` : `${6 + Math.random() * 4}px`,
              borderRadius: shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '2px',
              clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
              boxShadow: isDarkMode 
                ? `0 2px 6px ${confettiColor}80, 0 0 8px ${confettiColor}50`
                : `0 2px 4px ${confettiColor}60`,
            }}
            initial={{ opacity: 0, y: -20, rotate: 0 }}
            animate={{ 
              opacity: isDarkMode ? [0, 1, 0.85, 0] : [0, 1, 0.8, 0], 
              y: [0, 100], 
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random())],
              x: [0, (Math.random() - 0.5) * 40]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeIn'
            }}
          />
        );
      }

      case 'clouds': {
        const cloudSize = 40 + Math.random() * 60;
        const isDarkMode = document.documentElement.classList.contains('dark');
        const cloudColor = isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.9)';
        const cloudColorLight = isDarkMode ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 1)'
        
        return (
          <div key={particle.id} style={{ ...baseStyle, position: 'absolute' }}>
            <motion.div
              className="particle cloud"
              style={{
                position: 'relative',
                width: `${cloudSize}px`,
                height: `${cloudSize * 0.6}px`,
              }}
              initial={{ x: '-15vw', opacity: 0 }}
              animate={{ x: '115vw', opacity: [0, 1, 1, 0] }}
              transition={{
                duration: particle.duration * 3,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <div style={{
                position: 'absolute',
                background: `radial-gradient(ellipse at center, ${cloudColorLight}, ${cloudColor})`,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                filter: 'blur(4px)',
                boxShadow: `0 2px 12px ${themeColors.primary}40`
              }} />
              <div style={{
                position: 'absolute',
                left: '25%',
                top: '-30%',
                background: `radial-gradient(ellipse at center, ${cloudColorLight}, ${cloudColor})`,
                width: '60%',
                height: '80%',
                borderRadius: '50%',
                filter: 'blur(3px)'
              }} />
              <div style={{
                position: 'absolute',
                right: '20%',
                top: '-20%',
                background: `radial-gradient(ellipse at center, ${cloudColorLight}, ${cloudColor})`,
                width: '50%',
                height: '70%',
                borderRadius: '50%',
                filter: 'blur(3px)'
              }} />
            </motion.div>
          </div>
        );
      }

      case 'bokeh': {
        const bokehSize = 30 + Math.random() * 50;
        const isDarkMode = document.documentElement.classList.contains('dark');
        const bokehColors = [themeColors.primary, themeColors.accent, themeColors.secondary];
        const bokehColor = bokehColors[Math.floor(Math.random() * bokehColors.length)];
        
        return (
          <motion.div
            key={particle.id}
            className="particle bokeh"
            style={{
              ...baseStyle,
              width: `${bokehSize}px`,
              height: `${bokehSize}px`,
              borderRadius: '50%',
              background: isDarkMode 
                ? `radial-gradient(circle at 30% 30%, ${bokehColor}DD, ${bokehColor}80 40%, ${bokehColor}30 70%)`
                : `radial-gradient(circle at 30% 30%, ${bokehColor}B0, ${bokehColor}60 40%, transparent 70%)`,
              filter: 'blur(3px)',
              boxShadow: isDarkMode
                ? `0 0 ${bokehSize * 1.2}px ${bokehColor}80, inset 0 0 ${bokehSize * 0.4}px ${bokehColor}60`
                : `0 0 ${bokehSize * 0.8}px ${bokehColor}70, inset 0 0 ${bokehSize * 0.3}px ${bokehColor}50`,
            }}
            animate={{
              opacity: isDarkMode ? [0.3, 0.9, 0.5, 0.3] : [0.25, 0.8, 0.45, 0.25],
              scale: [particle.size * 0.8, particle.size * 1.3, particle.size * 0.9, particle.size * 0.8],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        );
      }

      case 'memories': {
        const memorySize = 16 + Math.random() * 12;
        const isPolaroid = Math.random() > 0.5;
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        return (
          <motion.div
            key={particle.id}
            className="particle memory"
            style={{
              ...baseStyle,
              width: `${memorySize}px`,
              height: isPolaroid ? `${memorySize * 1.2}px` : `${memorySize}px`,
              background: isPolaroid 
                ? isDarkMode
                  ? `linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.2) 75%, ${themeColors.primary}60 75%, ${themeColors.primary}60 100%)`
                  : `linear-gradient(to bottom, ${themeColors.surface}F0 0%, ${themeColors.surface}F0 75%, ${themeColors.primary}40 75%, ${themeColors.primary}40 100%)`
                : isDarkMode
                  ? `linear-gradient(135deg, ${themeColors.primary}B0, ${themeColors.accent}90)`
                  : `linear-gradient(135deg, ${themeColors.primary}90, ${themeColors.accent}70)`,
              borderRadius: '2px',
              border: isDarkMode ? `1px solid ${themeColors.border}` : `1px solid ${themeColors.border}`,
              boxShadow: isDarkMode
                ? `0 2px 10px ${themeColors.shadow}, inset 0 1px 2px rgba(255,255,255,0.1)`
                : `0 2px 8px ${themeColors.shadow}, inset 0 1px 2px ${themeColors.surface}60`,
            }}
            animate={{
              opacity: isDarkMode ? [0, 0.95, 0.8, 0] : [0, 0.9, 0.7, 0],
              rotate: [0, 15, -10, 0],
              scale: [particle.size * 0.8, particle.size * 1.1, particle.size * 0.8],
              y: [0, -20, 20, 0]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        );
      }

      case 'artistic': {
        const brushStrokes = ['circle', 'splash', 'streak'];
        const brushType = brushStrokes[Math.floor(Math.random() * brushStrokes.length)];
        const artisticSize = 10 + Math.random() * 15;
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        return (
          <motion.div
            key={particle.id}
            className="particle artistic"
            style={{
              ...baseStyle,
              width: brushType === 'streak' ? `${artisticSize * 2}px` : `${artisticSize}px`,
              height: brushType === 'streak' ? `${artisticSize * 0.5}px` : `${artisticSize}px`,
              background: brushType === 'splash'
                ? isDarkMode
                  ? `radial-gradient(ellipse at center, ${themeColors.primary}F0, ${themeColors.accent}C0 50%, ${themeColors.primary}60 70%)`
                  : `radial-gradient(ellipse at center, ${themeColors.primary}E0, ${themeColors.accent}90 50%, transparent 70%)`
                : isDarkMode
                  ? `linear-gradient(${Math.random() * 360}deg, ${themeColors.primary}E0, ${themeColors.accent}C0, ${themeColors.primary}A0)`
                  : `linear-gradient(${Math.random() * 360}deg, ${themeColors.primary}D0, ${themeColors.accent}B0, ${themeColors.primary}80)`,
              borderRadius: brushType === 'circle' ? '50%' : brushType === 'splash' ? '40% 60% 50% 50%' : '30%',
              boxShadow: isDarkMode
                ? `0 0 ${artisticSize * 0.8}px ${themeColors.primary}90`
                : `0 0 ${artisticSize * 0.5}px ${themeColors.primary}70`,
            }}
            animate={{
              opacity: isDarkMode ? [0, 0.9, 0.6, 0] : [0, 0.8, 0.5, 0],
              x: [0, (Math.random() - 0.5) * 60],
              y: [0, (Math.random() - 0.5) * 60],
              rotate: [0, Math.random() * 720 - 360],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div style={{ 
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      {particles.map(getParticleComponent)}
    </div>
  );
}
