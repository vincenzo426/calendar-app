// components/ui/Loading.jsx
import React from 'react';

export const Loading = ({ size = 'medium', fullScreen = false }) => {
  // Dimensioni in base alla prop size
  const sizeClass = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }[size] || 'w-8 h-8';
  
  const spinner = (
    <div className={`${sizeClass} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};