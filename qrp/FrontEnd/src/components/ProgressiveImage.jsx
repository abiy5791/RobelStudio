import { useState, useEffect } from 'react';

export default function ProgressiveImage({ 
  thumbnail, 
  src, 
  alt, 
  className = '',
  onClick 
}) {
  const [currentSrc, setCurrentSrc] = useState(thumbnail || src);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
    };
    
    return () => {
      img.onload = null;
    };
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} ${loading && thumbnail ? 'blur-sm' : ''} transition-all duration-300`}
      loading="lazy"
      onClick={onClick}
    />
  );
}
