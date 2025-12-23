import React, { useState, useRef, useEffect } from 'react';
import { categoryThemes, getCategoryIcon } from '../themes/categories';
import { ChevronDown } from 'lucide-react';

const CategorySelector = ({ selectedCategory, onCategoryChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const categories = ['all', ...Object.keys(categoryThemes)];
  const isDark = document.documentElement.classList.contains('dark');
  
  const selectedTheme = selectedCategory === 'all' 
    ? { name: 'All Categories' }
    : categoryThemes[selectedCategory] || categoryThemes.weddings;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
          flex items-center justify-between text-left
          ${isDark ? 'bg-gray-800/50 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}
          hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200
        `}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{selectedCategory === 'all' ? '📂' : getCategoryIcon(selectedCategory)}</span>
          <span className="font-medium">{selectedTheme.name}</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className={`
          absolute top-full left-0 right-0 mt-2 py-2 rounded-xl border-2 shadow-lg z-50
          ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}
        `}>
          {categories.map((category) => {
            const theme = category === 'all' 
              ? { name: 'All Categories' } 
              : categoryThemes[category] || { name: category };
            const isSelected = selectedCategory === category;
            
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  onCategoryChange(category);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-3 text-left transition-colors flex items-center gap-3
                  ${isSelected 
                    ? isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-50 text-purple-700'
                    : isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-800'
                  }
                `}
              >
                <span className="text-lg">{category === 'all' ? '📂' : getCategoryIcon(category)}</span>
                <span className="font-medium">{theme.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;