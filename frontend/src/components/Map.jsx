import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Locate, Navigation, Trash2, Undo, MousePointerClick, Hand, Footprints, Check } from 'lucide-react';
import SearchBox from './SearchBox';
import useLocationTracker from '../hooks/useLocationTracker';

// Fix default Leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map clicks
function MapInteractionHandler({ points, setPoints, mode }) {
  useMapEvents({
    click(e) {
      if (mode === 'measure') {
        setPoints([...points, { lat: e.latlng.lat, lng: e.latlng.lng }]);
      }
    }
  });
  return null;
}

export default function MapComponent({ polygonPoints, setPolygonPoints, isSavedRecord }) {
  const [center, setCenter] = useState([20.5937, 78.9629]); // Default center India
  const [mapObj, setMapObj] = useState(null);
  const [mapMode, setMapMode] = useState(isSavedRecord ? 'view' : 'measure'); // Default to view for saved records
  const tracker = useLocationTracker();

  // Auto-zoom to land when points are loaded
  useEffect(() => {
    if (mapObj && polygonPoints.length >= 3) {
      const bounds = L.latLngBounds(polygonPoints.map(p => [p.lat, p.lng]));
      mapObj.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [mapObj, polygonPoints]);

  // Ask for user's accurate location on launch
  useEffect(() => {
    if (navigator.geolocation && mapObj && polygonPoints.length === 0) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLoc = [position.coords.latitude, position.coords.longitude];
        setCenter(userLoc);
        mapObj.flyTo(userLoc, 18);
      }, (err) => {
        console.warn("Geolocation denied or error:", err);
      }, { enableHighAccuracy: true });
    }
  }, [mapObj]); // Only run once on mount

  // Watch for tracked location changes and pan map if tracking is active
  useEffect(() => {
    if (tracker.isTracking && tracker.location && mapObj) {
        mapObj.flyTo([tracker.location.lat, tracker.location.lng], mapObj.getZoom(), { animate: true, duration: 1.5 });
    }
  }, [tracker.location, tracker.isTracking, mapObj]);

  const [showClearModal, setShowClearModal] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const removeLastPoint = () => {
    setPolygonPoints(polygonPoints.slice(0, -1));
  };

  const attemptClearPoints = () => {
    setShowClearModal(true);
  };

  const confirmClearPoints = () => {
    setPolygonPoints([]);
    setShowClearModal(false);
  };

  const centerOnUser = () => {
    if (navigator.geolocation && mapObj) {
      navigator.geolocation.getCurrentPosition((position) => {
        mapObj.flyTo([position.coords.latitude, position.coords.longitude], 18);
      });
    }
  };

  const handleSearchSelect = (loc) => {
    if (mapObj) {
      mapObj.flyTo([loc.lat, loc.lng], 16);
    }
  };

  const handleModeSwitch = (newMode) => {
    if (isSavedRecord && newMode === 'measure' && mapMode === 'view') {
      setShowEditConfirm(true);
    } else {
      setMapMode(newMode);
    }
  };

  const confirmEnableEdit = () => {
    setMapMode('measure');
    setShowEditConfirm(false);
  };

  return (
    <>
      {showClearModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all border border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-3 mb-4">
                 <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <Trash2 className="text-red-600 dark:text-red-400" size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white">Clear Map?</h3>
             </div>
             <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete all boundary points? This action cannot be undone.</p>
             <div className="flex justify-end gap-3">
               <button onClick={() => setShowClearModal(false)} className="px-5 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
               <button onClick={confirmClearPoints} className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm">Delete</button>
             </div>
           </div>
        </div>
      )}

      {showEditConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-center">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all border-l-4 border-amber-500 shadow-amber-500/10">
             <div className="mb-4 flex flex-col items-center">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full mb-3">
                  <MousePointerClick className="text-amber-600 dark:text-amber-400" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enable Editing?</h3>
             </div>
             <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
               You are viewing a saved survey. Switching to edit mode allows you to change the boundary points. Be careful not to make accidental changes!
             </p>
             <div className="flex flex-col gap-2">
               <button onClick={confirmEnableEdit} className="w-full py-2.5 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors shadow-sm">
                 Yes, I want to Edit
               </button>
               <button onClick={() => setShowEditConfirm(false)} className="w-full py-2 text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                 Cancel
               </button>
             </div>
           </div>
        </div>
      )}

      <div className="relative w-full h-full">
        <SearchBox onSelectLocation={handleSearchSelect} />

      <MapContainer 
        center={center} 
        zoom={5} 
        style={{ width: '100%', height: '100%' }}
        ref={setMapObj}
        zoomControl={false} // Disable default zoom to position our own FABs better
      >
        {/* Free Esri World Imagery Satellite Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        
        <MapInteractionHandler points={polygonPoints} setPoints={setPolygonPoints} mode={mapMode} />

        {polygonPoints.map((pt, idx) => (
          <Marker key={idx} position={[pt.lat, pt.lng]} />
        ))}

        {polygonPoints.length >= 2 && (
          <Polygon 
            positions={polygonPoints.map(p => [p.lat, p.lng])}
            pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.4, weight: 3 }}
          />
        )}

        {/* Live GPS Tracking Dot */}
        {tracker.isTracking && tracker.location && (
            <CircleMarker 
              center={[tracker.location.lat, tracker.location.lng]} 
              radius={8}
              pathOptions={{ fillColor: '#3b82f6', fillOpacity: 1, color: '#ffffff', weight: 2 }}
            />
        )}

        {/* Walk Mode Path Visualization */}
        {tracker.walkMode && tracker.walkPath.length > 0 && (
          <Polygon
            positions={tracker.walkPath.map(p => [p.lat, p.lng])}
            pathOptions={{ 
              color: '#3b82f6', 
              dashArray: '10, 10', 
              fillColor: '#3b82f6', 
              fillOpacity: 0.2, 
              weight: 2 
            }}
          />
        )}
      </MapContainer>

      {/* Walk Mode Active Banner */}
      {tracker.walkMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
           <Footprints size={20} />
           <span className="font-bold text-sm">Walk Mode: {tracker.walkPath.length} points collected</span>
           <button 
             onClick={() => {
               if (tracker.walkPath.length >= 3) {
                 setPolygonPoints(tracker.walkPath);
               }
               tracker.toggleWalkMode();
             }}
             className="ml-2 bg-white text-blue-600 px-3 py-1 rounded-lg text-xs font-black hover:bg-blue-50 transition-colors"
           >
             FINISH WALK
           </button>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute right-4 top-20 z-[400] flex flex-col gap-3">
        {/* Map Modes Switcher */}
        <div className="flex flex-col bg-white dark:bg-gray-900 rounded-full shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-2 transition-colors duration-300">
           <button 
             onClick={() => handleModeSwitch('view')}
             className={`p-3 transition-colors ${mapMode === 'view' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
             title="View / Pan Mode (Safe)"
           >
             <Hand size={22} />
           </button>
           <div className="h-px bg-gray-200 dark:bg-gray-800 w-full"></div>
           <button 
             onClick={() => handleModeSwitch('measure')}
             className={`p-3 transition-colors ${mapMode === 'measure' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
             title="Measure / Draw Mode"
           >
             <MousePointerClick size={22} />
           </button>
        </div>

        {/* Toggle Walk Mode */}
        <button 
          onClick={tracker.toggleWalkMode}
          className={`p-3 rounded-full shadow-xl border focus:outline-none transition-all duration-300 ${
            tracker.walkMode 
            ? 'bg-blue-600 border-blue-700 text-white shadow-blue-500/50' 
            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          title="GPS Walk Mode (Auto-drop points)"
        >
          <Footprints size={24} />
        </button>

        {/* Toggle Live Tracking */}
        <button 
          onClick={tracker.toggleTracking}
          className={`p-3 rounded-full shadow-xl border focus:outline-none transition-all duration-300 ${
            tracker.isTracking 
            ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 animate-pulse' 
            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          title="Live GPS Tracking"
        >
          <Navigation size={24} />
        </button>

        {/* Find Me (One off) */}
        <button 
          onClick={centerOnUser}
          className="bg-white dark:bg-gray-900 p-3 rounded-full shadow-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500 focus:outline-none transition-colors duration-300"
          title="My Location"
        >
          <Locate size={24} />
        </button>

        <div className="h-4"></div> {/* Separator */}

        {/* Drawing Tools */}
        {polygonPoints.length > 0 && (
          <button 
            onClick={removeLastPoint}
            className="bg-white dark:bg-gray-900 p-3 rounded-full shadow-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 focus:outline-none transition-colors duration-300"
            title="Undo Last Click"
          >
            <Undo size={24} />
          </button>
        )}
        {polygonPoints.length > 0 && (
          <button 
            onClick={attemptClearPoints}
            className="bg-white dark:bg-gray-900 p-3 rounded-full shadow-xl border border-gray-200 dark:border-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none transition-colors duration-300"
            title="Clear Map"
          >
            <Trash2 size={24} />
          </button>
        )}
      </div>
    </div>
    </>
  );
}
