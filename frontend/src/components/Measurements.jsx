import React, { useMemo, useState } from 'react';
import { calculateLandMetrics } from '../utils/geoCalculations';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Share2, FileDown, MessageCircle, CloudOff, CheckCircle2 } from 'lucide-react';
import { getWhatsAppShareLink, generatePDFReport } from '../utils/shareUtils';
import useOfflineSync from '../hooks/useOfflineSync';

export default function MeasurementsPanel({ polygonPoints, record }) {
  const metrics = useMemo(() => calculateLandMetrics(polygonPoints), [polygonPoints]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("New Survey");
  const [saveNotes, setSaveNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const { isOnline, saveOffline } = useOfflineSync();

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
    
    const recordData = {
      userId: currentUser.uid,
      title: saveTitle || "Nameless Survey",
      boundary: polygonPoints,
      area: {
        sqMeters: metrics.areaSqMeters,
        sqFt: metrics.areaSqFt,
        cents: metrics.areaCents,
        acres: metrics.areaAcres
      },
      perimeters: metrics.perimeters,
      notes: saveNotes
    };

    if (!isOnline) {
      try {
        await saveOffline(recordData);
        setIsSaving(false);
        setShowSyncSuccess(true);
        setTimeout(() => navigate('/'), 2000);
        return;
      } catch (err) {
        setErrorMsg("Failed to save even to local storage. Try again.");
        setIsSaving(false);
        return;
      }
    }

    try {
      const response = await fetch('http://localhost:5005/api/lands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 border border-gray-100 dark:border-gray-700">
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Save Land Survey</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter a descriptive name for this property boundary.</p>
             <input 
               type="text" 
               value={saveTitle} 
               onChange={e => setSaveTitle(e.target.value)} 
               placeholder="Property Name"
               className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none" 
             />
             <textarea 
               value={saveNotes} 
               onChange={e => setSaveNotes(e.target.value)} 
               placeholder="Additional notes (optional)..."
               rows={3}
               className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 mb-6 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none resize-none text-sm" 
             />
             <div className="flex justify-end gap-3">
               <button onClick={() => setShowSaveModal(false)} className="px-5 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
               <button onClick={confirmSave} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">Save Record</button>
             </div>
           </div>
        </div>
      )}

      {/* Error Popup Modal */}
      {errorMsg && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 border border-red-100 dark:border-red-900/30">
             <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error Saving Record</h3>
             <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">{errorMsg}</p>
             <div className="flex justify-end">
               <button onClick={() => setErrorMsg(null)} className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm">Close</button>
             </div>
           </div>
        </div>
      )}

      {/* Offline Success Modal */}
      {showSyncSuccess && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-center">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-sm transform transition-all border border-emerald-500/30">
              <div className="flex flex-col items-center">
                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-4 rounded-full mb-4">
                  <CloudOff className="text-emerald-600 dark:text-emerald-400" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Saved Offline</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  You are currently offline. Your survey is safe in local storage and will automatically sync to our servers as soon as you reconnect to the internet.
                </p>
                <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle2 size={18} />
                  <span>Redirecting to Dashboard...</span>
                </div>
              </div>
           </div>
        </div>
      )}

      <div className="w-full md:w-80 bg-white dark:bg-gray-900 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 shadow-xl z-20 flex flex-col h-1/3 md:h-full transition-all duration-300">
        <div className="p-4 bg-emerald-700 text-white shadow-md">
          <h2 className="text-xl font-bold">Land Survey Data</h2>
          <p className="text-sm text-emerald-100 opacity-90">Points plotted: {polygonPoints.length}</p>
        </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {polygonPoints.length < 3 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            <p className="text-lg mb-2">Not enough points</p>
            <p className="text-sm">Tap on the map to add at least 3 points to form a boundary and calculate area.</p>
          </div>
        ) : (
          <>
            {/* Area Section */}
            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-4 border border-emerald-100 dark:border-emerald-900/30">
              <h3 className="text-sm uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-semibold mb-3">Total Area</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sq. Feet</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{metrics.areaSqFt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cents</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{metrics.areaCents.toLocaleString(undefined, { maximumFractionDigits: 3 })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Acres</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{metrics.areaAcres.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sq. Meters</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{metrics.areaSqMeters.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            {/* Perimeter/Sides Section */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-3 border-b dark:border-gray-800 pb-2">Boundary Sides</h3>
              <ul className="space-y-3">
                {metrics.perimeters.map((side, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded border border-gray-100 dark:border-gray-800">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{side.segment}</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{side.feet.toFixed(2)} ft</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{side.meters.toFixed(2)} m</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Sharing & Reports Section */}
            <div className="flex flex-col gap-3">
               <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1 border-b dark:border-gray-800 pb-2">Share & Reports</h3>
               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                        const shareLink = getWhatsAppShareLink(record || { title: "New Survey", boundary: polygonPoints }, metrics);
                        window.open(shareLink, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all border border-emerald-200 dark:border-emerald-800"
                  >
                    <MessageCircle size={20} />
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => generatePDFReport(record || { title: "New Survey", boundary: polygonPoints }, metrics)}
                    className="flex items-center justify-center gap-2 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border border-blue-100 dark:border-blue-900/30"
                  >
                    <FileDown size={20} />
                    PDF Report
                  </button>
               </div>
            </div>
            
            {/* Save Button */}
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
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
