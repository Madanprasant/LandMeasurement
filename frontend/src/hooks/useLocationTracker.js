import { useState, useRef, useCallback, useEffect } from 'react';
import * as turf from '@turf/turf';

export default function useLocationTracker() {
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [walkMode, setWalkMode] = useState(false);
  const [walkPath, setWalkPath] = useState([]); // Points collected during walk
  const watchIdRef = useRef(null);
  const lastDroppedRef = useRef(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(newLoc);

        // Walk Mode Logic: Auto-drop point every 5 meters
        if (walkMode) {
          if (!lastDroppedRef.current) {
            lastDroppedRef.current = newLoc;
            setWalkPath((prev) => [...prev, newLoc]);
          } else {
            const from = turf.point([lastDroppedRef.current.lng, lastDroppedRef.current.lat]);
            const to = turf.point([newLoc.lng, newLoc.lat]);
            const distance = turf.distance(from, to, { units: 'meters' });

            if (distance >= 5) { // 5 meter threshold
              lastDroppedRef.current = newLoc;
              setWalkPath((prev) => [...prev, newLoc]);
            }
          }
        }
      },
      (err) => {
        setIsTracking(false);
        setError(err.message);
        console.error("Tracking Error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );
  }, [walkMode]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setLocation(null);
  }, []);

  const toggleTracking = useCallback(() => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  const toggleWalkMode = () => {
    const newState = !walkMode;
    setWalkMode(newState);
    if (newState) {
      setWalkPath([]);
      lastDroppedRef.current = null;
      if (!isTracking) startTracking();
    }
  };

  return {
    location,
    isTracking,
    walkMode,
    walkPath,
    error,
    startTracking,
    stopTracking,
    toggleTracking,
    toggleWalkMode,
    setWalkPath
  };
}
