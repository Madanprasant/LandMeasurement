import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import useOfflineSync from './hooks/useOfflineSync';
import { WifiOff, RefreshCw } from 'lucide-react';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="h-screen w-full bg-gray-100 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 overflow-hidden flex flex-col transition-colors duration-300">
            <OfflineStatusBar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<MapPage />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

function OfflineStatusBar() {
  const { isOnline, isSyncing, pendingCount } = useOfflineSync();

  if (isOnline && !isSyncing && pendingCount === 0) return null;

  return (
    <div className={`z-[9999] px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
      !isOnline ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
    }`}>
      {!isOnline ? (
        <>
          <WifiOff size={14} />
          <span>OFFLINE MODE ACTIVE • Records saved locally</span>
        </>
      ) : isSyncing ? (
        <>
          <RefreshCw size={14} className="animate-spin" />
          <span>SYNCING {pendingCount} RECORDS...</span>
        </>
      ) : pendingCount > 0 ? (
        <>
          <RefreshCw size={14} />
          <span>{pendingCount} RECORDS PENDING SYNC</span>
        </>
      ) : null}
    </div>
  );
}

export default App;
