import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-12 h-12 rounded-full border-4 border-purple-100"></div>
        {/* Spinning Inner Ring */}
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">
        Loading data...
      </p>
    </div>
  );
};

export default LoadingSpinner;