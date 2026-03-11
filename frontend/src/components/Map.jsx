import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Locate, Navigation, Trash2, Undo, MousePointerClick, Hand } from 'lucide-react';
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

export default function MapComponent({ polygonPoints, setPolygonPoints }) {
  const [center, setCenter] = useState([20.5937, 78.9629]); // Default center India
  const [mapObj, setMapObj] = useState(null);
  const [mapMode, setMapMode] = useState('measure'); // 'view' or 'measure'
  const tracker = useLocationTracker();

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

  return (
    <>
      {showClearModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all">
             <div className="flex items-center gap-3 mb-4">
                 <div className="bg-red-100 p-2 rounded-full">
                    <Trash2 className="text-red-600" size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">Clear Map?</h3>
             </div>
             <p className="text-gray-600 mb-6">Are you sure you want to delete all boundary points? This action cannot be undone.</p>
             <div className="flex justify-end gap-3">
               <button onClick={() => setShowClearModal(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
               <button onClick={confirmClearPoints} className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm">Delete</button>
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
      </MapContainer>

      {/* Floating Action Buttons */}
      <div className="absolute right-4 top-20 z-[400] flex flex-col gap-3">
        {/* Map Modes Switcher */}
        <div className="flex flex-col bg-white rounded-full shadow-xl border border-gray-200 overflow-hidden mb-2">
           <button 
             onClick={() => setMapMode('view')}
             className={`p-3 transition-colors ${mapMode === 'view' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}
             title="View / Pan Mode (Safe)"
           >
             <Hand size={22} />
           </button>
           <div className="h-px bg-gray-200 w-full"></div>
           <button 
             onClick={() => setMapMode('measure')}
             className={`p-3 transition-colors ${mapMode === 'measure' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}
             title="Measure / Draw Mode"
           >
             <MousePointerClick size={22} />
           </button>
        </div>

        {/* Toggle Live Tracking */}
        <button 
          onClick={tracker.toggleTracking}
          className={`p-3 rounded-full shadow-xl border focus:outline-none transition-colors ${
            tracker.isTracking 
            ? 'bg-blue-100 border-blue-200 text-blue-600 animate-pulse' 
            : 'bg-white border-gray-200 text-gray-700 hover:text-blue-600'
          }`}
          title="Live GPS Tracking"
        >
          <Navigation size={24} />
        </button>

        {/* Find Me (One off) */}
        <button 
          onClick={centerOnUser}
          className="bg-white p-3 rounded-full shadow-xl border border-gray-200 text-gray-700 hover:text-emerald-600 focus:outline-none"
          title="My Location"
        >
          <Locate size={24} />
        </button>

        <div className="h-4"></div> {/* Separator */}

        {/* Drawing Tools */}
        {polygonPoints.length > 0 && (
          <button 
            onClick={removeLastPoint}
            className="bg-white p-3 rounded-full shadow-xl border border-gray-200 text-gray-700 hover:text-amber-600 focus:outline-none"
            title="Undo Last Click"
          >
            <Undo size={24} />
          </button>
        )}
        {polygonPoints.length > 0 && (
          <button 
            onClick={attemptClearPoints}
            className="bg-white p-3 rounded-full shadow-xl border border-gray-200 text-red-600 hover:bg-red-50 focus:outline-none"
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
