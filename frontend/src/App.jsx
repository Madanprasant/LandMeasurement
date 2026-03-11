import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="h-screen w-full bg-gray-100 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 overflow-hidden flex flex-col transition-colors duration-300">
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

export default App;
