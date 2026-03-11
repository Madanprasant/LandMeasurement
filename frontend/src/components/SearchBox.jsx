import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';

export default function SearchBox({ onSelectLocation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search via OpenStreetMap free API
  useEffect(() => {
    const searchPlaces = async () => {
      if (!query.trim() || query.length < 3) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9'
          }
        });
        const data = await response.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error("Geocoding failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timerId = setTimeout(() => {
      searchPlaces();
    }, 500);

    return () => clearTimeout(timerId);
  }, [query]);

  const handleSelect = (place) => {
    onSelectLocation({ lat: parseFloat(place.lat), lng: parseFloat(place.lon) });
    
    // Update recent searches
    const newRecent = [
      { 
        place_id: place.place_id, 
        display_name: place.display_name, 
        lat: place.lat, 
        lon: place.lon 
      },
      ...recentSearches.filter(s => s.place_id !== place.place_id)
    ].slice(0, 5); // Keep top 5

    setRecentSearches(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));
    
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="absolute top-4 left-4 right-16 sm:right-auto sm:w-80 z-[1000]">
      <div className="relative flex items-center bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
        <div className="pl-3 text-gray-400 dark:text-gray-500">
          {isLoading ? <Loader2 size={20} className="animate-spin text-emerald-600 dark:text-emerald-500" /> : <Search size={20} />}
        </div>
        <input
          type="text"
          className="w-full py-3 px-3 outline-none text-gray-700 dark:text-gray-200 bg-transparent placeholder-gray-500 dark:placeholder-gray-500 font-medium"
          placeholder="Search for a place or village..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => { setIsOpen(true); }}
        />
        {query && (
          <button onClick={clearSearch} className="pr-3 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {isOpen && (results.length > 0 || (recentSearches.length > 0 && !query.trim())) && (
        <div className="mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden max-h-80 overflow-y-auto">
          {/* Recent Searches Header */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Searches</span>
              <button 
                onClick={clearHistory}
                className="text-xs text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold"
              >
                Clear All
              </button>
            </div>
          )}
          
          <ul>
            {/* Show Results if searching */}
            {query.trim() ? (
              results.map((place) => (
                <li 
                  key={place.place_id}
                  onClick={() => handleSelect(place)}
                  className="flex items-start gap-3 p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors"
                >
                  <MapPin size={18} className="text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2 leading-snug">{place.display_name}</span>
                </li>
              ))
            ) : (
              /* Show Recent Searches if query is empty */
              recentSearches.map((place) => (
                <li 
                  key={place.place_id}
                  onClick={() => handleSelect(place)}
                  className="flex items-start gap-3 p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors"
                >
                  <Loader2 size={18} className="text-gray-400 dark:text-gray-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug italic">{place.display_name}</span>
                </li>
              ))
            )}
          </ul>
          
          {query.trim().length >= 1 && query.trim().length < 3 && !results.length && (
            <div className="p-4 text-center text-gray-400 dark:text-gray-600 text-sm italic">
              Type at least 3 characters...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
