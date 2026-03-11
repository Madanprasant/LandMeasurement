import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Map, Plus, LogOut, Calendar, MapPin, Loader2, Trash2, X } from 'lucide-react';

export default function HomePage() {
  const { currentUser, loginWithGoogle, logout } = useAuth();
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
      // In a real app we hit the backend on port 5005:
      const res = await fetch(`http://localhost:5005/api/lands/${currentUser.uid}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
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
      <div className="flex flex-col items-center justify-center h-full bg-emerald-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-emerald-100">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Map size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Land Measure Pro</h1>
          <p className="text-gray-500 mb-8">Professional land surveying tools directly from satellite imagery.</p>
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
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Survey?</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this land record? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)} 
                disabled={isDeleting}
                className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
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
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="font-medium text-sm">{errorHeader}</span>
          <button onClick={() => setErrorHeader(null)} className="hover:bg-red-100 p-1 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <header className="bg-white shadow-sm z-10 px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Map size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 hidden sm:block">My Surveys</h1>
          {currentUser?.displayName ? (
            <span className="text-sm font-medium text-gray-500 hidden md:block border-l border-gray-300 pl-3 ml-1">
              Welcome, {currentUser.displayName}
            </span>
          ) : currentUser?.email ? (
            <span className="text-sm font-medium text-gray-500 hidden md:block border-l border-gray-300 pl-3 ml-1">
              Welcome, {currentUser.email.split('@')[0]}
            </span>
          ) : null}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/map')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Survey</span>
          </button>
          
          <button 
            onClick={logout}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
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
            {records.map(record => (
              <div 
                key={record._id} 
                onClick={() => navigate('/map', { state: { record } })}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1"
              >
                <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-gray-800 text-lg truncate">{record.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={(e) => handleDeleteClick(e, record._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Record"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md">
                      {record.boundary.length} Pts
                    </div>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Area</span>
                    <span className="text-2xl font-black text-gray-800">
                      {record.area.cents.toFixed(2)} <span className="text-sm font-medium text-gray-500">Cents</span>
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                      ({record.area.sqFt.toLocaleString(undefined, { maximumFractionDigits: 0 })} Sq.Ft)
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 text-xs text-gray-400 flex items-center justify-between">
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
