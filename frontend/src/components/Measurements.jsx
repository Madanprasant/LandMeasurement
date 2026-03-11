import React, { useMemo, useState } from 'react';
import { calculateLandMetrics } from '../utils/geoCalculations';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MeasurementsPanel({ polygonPoints }) {
  const metrics = useMemo(() => calculateLandMetrics(polygonPoints), [polygonPoints]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("New Survey");
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSaveClick = () => {
    if (!currentUser) {
      setErrorMsg("You must be logged in to save records.");
      return;
    }
    setErrorMsg(null);
    setShowSaveModal(true);
  };

  const confirmSave = async () => {
    setShowSaveModal(false);
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5005/api/lands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          title: saveTitle || "Nameless Survey",
          boundary: polygonPoints,
          area: {
            sqMeters: metrics.areaSqMeters,
            sqFt: metrics.areaSqFt,
            cents: metrics.areaCents,
            acres: metrics.areaAcres
          },
          perimeters: metrics.perimeters
        })
      });

      if (response.ok) {
        setIsSaving(false);
        navigate('/'); // go to dashboard to see it
      } else {
        const err = await response.json();
        setErrorMsg(`Failed to save: ${err.error || 'Unknown server error'}`);
        setIsSaving(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while saving. Is your internet on?');
      setIsSaving(false);
    }
  };

  return (
    <>
      {showSaveModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
             <h3 className="text-xl font-bold text-gray-900 mb-2">Save Land Survey</h3>
             <p className="text-sm text-gray-500 mb-4">Enter a descriptive name for this property boundary.</p>
             <input 
               type="text" 
               value={saveTitle} 
               onChange={e => setSaveTitle(e.target.value)} 
               autoFocus
               className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none" 
             />
             <div className="flex justify-end gap-3">
               <button onClick={() => setShowSaveModal(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
               <button onClick={confirmSave} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">Save Record</button>
             </div>
           </div>
        </div>
      )}

      {/* Error Popup Modal */}
      {errorMsg && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
             <h3 className="text-xl font-bold text-red-600 mb-2">Error Saving Record</h3>
             <p className="text-sm text-gray-700 mb-6">{errorMsg}</p>
             <div className="flex justify-end">
               <button onClick={() => setErrorMsg(null)} className="px-5 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors shadow-sm">Close</button>
             </div>
           </div>
        </div>
      )}

      <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-gray-200 shadow-xl z-10 flex flex-col h-1/3 md:h-full transition-all">
        <div className="p-4 bg-emerald-700 text-white shadow-md">
          <h2 className="text-xl font-bold">Land Survey Data</h2>
          <p className="text-sm text-emerald-100 opacity-90">Points plotted: {polygonPoints.length}</p>
        </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {polygonPoints.length < 3 ? (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-lg mb-2">Not enough points</p>
            <p className="text-sm">Tap on the map to add at least 3 points to form a boundary and calculate area.</p>
          </div>
        ) : (
          <>
            {/* Area Section */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <h3 className="text-sm uppercase tracking-wider text-emerald-800 font-semibold mb-3">Total Area</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Sq. Feet</p>
                  <p className="text-xl font-bold text-gray-800">{metrics.areaSqFt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cents</p>
                  <p className="text-xl font-bold text-gray-800">{metrics.areaCents.toLocaleString(undefined, { maximumFractionDigits: 3 })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Acres</p>
                  <p className="text-xl font-bold text-gray-800">{metrics.areaAcres.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sq. Meters</p>
                  <p className="text-xl font-bold text-gray-800">{metrics.areaSqMeters.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            {/* Perimeter/Sides Section */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3 border-b pb-2">Boundary Sides</h3>
              <ul className="space-y-3">
                {metrics.perimeters.map((side, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                    <span className="font-medium text-gray-700">{side.segment}</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">{side.feet.toFixed(2)} ft</p>
                      <p className="text-xs text-gray-500">{side.meters.toFixed(2)} m</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Save Button */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <button 
                onClick={handleSaveClick}
                disabled={isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Land Record'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
