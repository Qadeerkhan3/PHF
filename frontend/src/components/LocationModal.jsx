import React, { useEffect, useState } from 'react';

const LocationModal = ({ onLocationSet }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('userLocation');

    if (saved) {
      const { lat, lng, label, timestamp } = JSON.parse(saved);
      const ageInMinutes = (Date.now() - timestamp) / 1000 / 60;

      // Agar location 30 minute se kam purani hai — cache use karo
      if (ageInMinutes < 30) {
        onLocationSet({ lat, lng, label });
        return;
      }

      // Agar purani hai aur permission already granted hai — silently refresh karo
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const newLoc = {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  label: 'Your location',
                  timestamp: Date.now()
                };
                localStorage.setItem('userLocation', JSON.stringify(newLoc));
                onLocationSet(newLoc);
              },
              () => {
                // Agar fail ho jaye, purani cache use karo
                onLocationSet({ lat, lng, label });
              }
            );
          } else {
            // Permission denied ya prompt — cache use karo
            onLocationSet({ lat, lng, label });
          }
        });
      } else {
        onLocationSet({ lat, lng, label });
      }
      return;
    }

    // Pehli baar — popup dikhao
    const timer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const saveLocation = (loc) => {
    const withTimestamp = { ...loc, timestamp: Date.now() };
    localStorage.setItem('userLocation', JSON.stringify(withTimestamp));
    onLocationSet(withTimestamp);
    setShow(false);
  };

  const handleAllow = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          saveLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'Your location'
          });
        },
        () => {
          saveLocation({
            lat: 34.0151,
            lng: 71.5249,
            label: 'Peshawar City Center'
          });
        }
      );
    } else {
      saveLocation({
        lat: 34.0151,
        lng: 71.5249,
        label: 'Peshawar City Center'
      });
    }
  };

  const handleNotNow = () => {
    saveLocation({
      lat: 34.0151,
      lng: 71.5249,
      label: 'Peshawar City Center'
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#FAF8F5] border border-gray-200 rounded p-12 max-w-md w-[90%] text-center">
        <svg
          className="mx-auto mb-6 text-teal-700"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>

        <p className="text-[11px] tracking-[0.15em] uppercase text-gray-500 mb-3">
          Location
        </p>
        <h2 className="font-serif text-3xl text-gray-900 mb-4">
          Allow location access?
        </h2>
        <p className="text-sm text-gray-600 mb-8 max-w-xs mx-auto leading-relaxed">
          We'll show you hotels near you in Peshawar. Your location stays private and is never shared.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleAllow}
            className="px-6 py-3 bg-teal-700 text-white text-sm rounded hover:bg-teal-800 transition-colors"
          >
            Allow location
          </button>
          <button
            onClick={handleNotNow}
            className="px-6 py-3 border border-gray-200 text-gray-900 text-sm rounded hover:bg-gray-50 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;