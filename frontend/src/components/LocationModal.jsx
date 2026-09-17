import React, { useEffect, useState } from 'react';

const LocationModal = ({ onLocationSet }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Sirf ek baar per session
    const hasAsked = sessionStorage.getItem('locationAsked');
    if (!hasAsked) {
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleAllow = () => {
    sessionStorage.setItem('locationAsked', 'true');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onLocationSet({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'Your location'
          });
          setShow(false);
        },
        () => {
          // User ne browser popup mein deny kiya
          onLocationSet({
            lat: 34.0151,
            lng: 71.5249,
            label: 'Peshawar City Center'
          });
          setShow(false);
        }
      );
    } else {
      onLocationSet({
        lat: 34.0151,
        lng: 71.5249,
        label: 'Peshawar City Center'
      });
      setShow(false);
    }
  };

  const handleNotNow = () => {
    sessionStorage.setItem('locationAsked', 'true');
    onLocationSet({
      lat: 34.0151,
      lng: 71.5249,
      label: 'Peshawar City Center'
    });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#FAF8F5] border border-gray-200 rounded p-12 max-w-md w-[90%] text-center">
        <svg className="mx-auto mb-6 text-teal-700" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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