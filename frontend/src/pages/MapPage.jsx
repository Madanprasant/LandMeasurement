import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MapComponent from '../components/Map';
import MeasurementsPanel from '../components/Measurements';

export default function MapPage() {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [polygonPoints, setPolygonPoints] = useState([]);

  // If we navigated here from a saved record card, populate its points
  useEffect(() => {
    if (location.state?.record) {
      setPolygonPoints(location.state.record.boundary);
    }
  }, [location.state]);

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-900 shadow z-10 p-3 flex items-center gap-3 border-b dark:border-gray-800 transition-colors duration-300">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-700 dark:text-gray-300"
          title="Back to Dashboard"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-500">Survey Area</h2>
        
        {currentUser?.displayName ? (
          <span className="text-sm font-medium text-gray-400 dark:text-gray-500 hidden sm:block border-l border-gray-200 dark:border-gray-800 pl-3 ml-1">
            {currentUser.displayName}
          </span>
        ) : currentUser?.email ? (
          <span className="text-sm font-medium text-gray-400 dark:text-gray-500 hidden sm:block border-l border-gray-200 dark:border-gray-800 pl-3 ml-1">
            {currentUser.email.split('@')[0]}
          </span>
        ) : null}

        <div className="ml-auto flex items-center">
           <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 relative z-0">
          <MapComponent polygonPoints={polygonPoints} setPolygonPoints={setPolygonPoints} />
        </div>
        
        <MeasurementsPanel polygonPoints={polygonPoints} />
      </div>
    </div>
  );
}
