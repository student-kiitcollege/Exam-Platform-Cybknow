import React, { useState } from 'react';
import { FaWindowMinimize, FaWindowMaximize, FaTimes } from 'react-icons/fa';

const NavbarComponent = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMinimize = () => {
    alert('Minimize functionality is not supported in browsers.');
  };

  const handleClose = () => {
    window.close();
  };

  const iconButtonClasses = 'p-2 rounded-full transition duration-300 hover:bg-gray-200 text-gray-600 hover:text-gray-800';

  return (
    <nav className="bg- shadow-md px-4 py-2 flex items-center justify-between">
      <div className="text-xl font-bold text-gray-800">Cybknow Exam Platform</div>
      <div className="flex items-center space-x-4">
        <button
          onClick={handleMinimize}
          className={iconButtonClasses}
          title="Minimize"
        >
          <FaWindowMinimize className="w-5 h-5" />
        </button>
        <button
          onClick={handleFullscreen}
          className={iconButtonClasses}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          <FaWindowMaximize className="w-5 h-5" />
        </button>
        <button
          onClick={handleClose}
          className={`${iconButtonClasses} hover:bg-red-100 hover:text-red-600`}
          title="Close"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default NavbarComponent;
