import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen w-full bg-gray-100 font-sans text-gray-900 overflow-hidden flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
