import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/Map';
import MeasurementsPanel from '../components/Measurements';

export default function MapPage() {
  const { currentUser } = useAuth();
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
    <div className="flex flex-col h-full w-full">
      <header className="bg-white shadow z-10 p-3 flex items-center gap-3">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
          title="Back to Dashboard"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-emerald-700">Survey Area</h2>
        
        {currentUser?.displayName ? (
          <span className="text-sm font-medium text-gray-400 hidden sm:block border-l border-gray-200 pl-3 ml-1">
            {currentUser.displayName}
          </span>
        ) : currentUser?.email ? (
          <span className="text-sm font-medium text-gray-400 hidden sm:block border-l border-gray-200 pl-3 ml-1">
            {currentUser.email.split('@')[0]}
          </span>
        ) : null}
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
