import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Map, Plus, LogOut, Calendar, MapPin, Loader2, Trash2, X, Sun, Moon, CloudOff, RefreshCw, MessageCircle, FileDown } from 'lucide-react';
import { offlineDb } from '../db/offlineDb';
import { getWhatsAppShareLink, generatePDFReport } from '../utils/shareUtils';

export default function HomePage() {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorHeader, setErrorHeader] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchRecords();
    }
  }, [currentUser]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // 1. Fetch from Server
      let serverRecords = [];
      try {
        const res = await fetch(`http://localhost:5005/api/lands/${currentUser.uid}`);
        if (res.ok) {
          serverRecords = await res.json();
        }
      } catch (e) {
        console.warn("Server fetch failed, using offline fallback if available");
      }

      // 2. Fetch from IndexedDB (Pending Sync)
      const offlineRecords = await offlineDb.pendingLands
        .where('userId').equals(currentUser.uid)
        .toArray();

      // Merge them
      setRecords([...offlineRecords, ...serverRecords]);
    } catch (error) {
      console.error("Failed to fetch records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setErrorHeader(null);
    try {
      const res = await fetch(`http://localhost:5005/api/lands/${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRecords(records.filter(r => r._id !== deleteId));
        setDeleteId(null);
      } else {
        const err = await res.json();
        setErrorHeader(err.error || "Failed to delete record");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      setErrorHeader("Network error. Could not delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-emerald-50 dark:bg-gray-900 p-6 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-emerald-100 dark:border-gray-700">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg overflow-hidden border-2 border-emerald-500">
            <img src="/logo.png" alt="GeoMeasure Elite Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">GeoMeasure Elite</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Professional land surveying tools directly from satellite imagery.</p>
          <button 
            onClick={loginWithGoogle}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-lg flex justify-center items-center gap-2"
          >
            Sign in to start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden transition-colors duration-300">
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-gray-900 dark:text-white">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <Trash2 className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <h3 className="text-xl font-bold dark:text-white">Delete Survey?</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this land record? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)} 
                disabled={isDeleting}
                className="px-5 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {errorHeader && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] bg-red-50 dark:bg-red-900/90 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-100 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="font-medium text-sm">{errorHeader}</span>
          <button onClick={() => setErrorHeader(null)} className="hover:bg-red-100 dark:hover:bg-red-800 p-1 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <header className="bg-white dark:bg-gray-900 shadow-sm z-10 px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 invert brightness-200" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">GeoMeasure Elite</h1>
          {currentUser?.displayName ? (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:block border-l border-gray-300 dark:border-gray-700 pl-3 ml-1">
              Welcome, {currentUser.displayName}
            </span>
          ) : currentUser?.email ? (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:block border-l border-gray-300 dark:border-gray-700 pl-3 ml-1">
              Welcome, {currentUser.email.split('@')[0]}
            </span>
          ) : null}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 mr-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          <button 
            onClick={() => navigate('/map')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Survey</span>
          </button>
          
          <button 
            onClick={logout}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Logout"
          >
            <LogOut size={22} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-emerald-600">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <MapPin size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No surveys yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">Create your first polygon strictly by tapping points on the map.</p>
            <button 
              onClick={() => navigate('/map')}
              className="bg-white border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition"
            >
              Start Measuring
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {records.map((record, idx) => (
              <div 
                key={record._id || `offline-${idx}`} 
                onClick={() => navigate('/map', { state: { record } })}
                className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1 ${
                  record.isOffline 
                  ? 'border-amber-200 dark:border-amber-900/40 border-l-4 border-l-amber-500' 
                  : 'border-gray-100 dark:border-gray-800'
                }`}
              >
                <div className={`${record.isOffline ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-emerald-50 dark:bg-emerald-900/10'} p-4 border-b ${record.isOffline ? 'border-amber-100 dark:border-amber-900/30' : 'border-emerald-100 dark:border-emerald-900/30'} flex justify-between items-start`}>
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate flex items-center gap-2">
                      {record.title}
                      {record.isOffline && <CloudOff size={14} className="text-amber-600" title="Pending Sync" />}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!record.isOffline && (
                      <button 
                        onClick={(e) => handleDeleteClick(e, record._id)}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Delete Record"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <div className={`${record.isOffline ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400'} text-xs font-bold px-2 py-1 rounded-md`}>
                      {record.boundary.length} Pts
                    </div>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Total Area</span>
                    <span className="text-2xl font-black text-gray-800 dark:text-white">
                      {record.area.cents.toFixed(2)} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Cents</span>
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      ({record.area.sqFt.toLocaleString(undefined, { maximumFractionDigits: 0 })} Sq.Ft)
                    </span>
                  </div>

                  {record.notes && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800">
                        "{record.notes}"
                      </p>
                    </div>
                  )}

                  {/* Quick Productivity Actions */}
                  {!record.isOffline && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           const metrics = {
                             areaCents: record.area.cents,
                             areaSqFt: record.area.sqFt,
                             areaAcres: record.area.acres,
                             areaSqMeters: record.area.sqMeters,
                             perimeters: record.perimeters
                           };
                           const link = getWhatsAppShareLink(record, metrics);
                           window.open(link, '_blank');
                         }}
                         className="flex items-center justify-center gap-1.5 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all border border-emerald-100 dark:border-emerald-800/50"
                       >
                         <MessageCircle size={14} />
                         Share
                       </button>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           const metrics = {
                             areaCents: record.area.cents,
                             areaSqFt: record.area.sqFt,
                             areaAcres: record.area.acres,
                             areaSqMeters: record.area.sqMeters,
                             perimeters: record.perimeters
                           };
                           generatePDFReport(record, metrics);
                         }}
                         className="flex items-center justify-center gap-1.5 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border border-blue-100 dark:border-blue-800/50"
                       >
                         <FileDown size={14} />
                         PDF
                       </button>
                    </div>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between">
                     <div className="flex items-center gap-1.5">
                       <Calendar size={14} />
                       {new Date(record.createdAt).toLocaleDateString()}
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Mobile FAB */}
      <button 
        onClick={() => navigate('/map')}
        className="sm:hidden fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all z-50 focus:outline-none"
      >
        <Plus size={32} />
      </button>
    </div>
  );
}
