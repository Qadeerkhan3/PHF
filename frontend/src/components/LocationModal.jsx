import React, { useEffect, useState } from 'react';

const LocationModal = ({ onLocationSet }) => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState('ask'); // ask | detecting | detected
  const [detectedLocation, setDetectedLocation] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('userLocation');

    if (saved) {
      const { lat, lng, label, timestamp } = JSON.parse(saved);
      const ageInMinutes = (Date.now() - timestamp) / 1000 / 60;

      if (ageInMinutes < 30) {
        onLocationSet({ lat, lng, label });
        return;
      }

      // Silently refresh if permission granted
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
                onLocationSet({ lat, lng, label });
              }
            );
          } else {
            onLocationSet({ lat, lng, label });
          }
        });
      } else {
        onLocationSet({ lat, lng, label });
      }
      return;
    }

    const timer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const saveLocation = (loc) => {
    const withTimestamp = { ...loc, timestamp: Date.now() };
    localStorage.setItem('userLocation', JSON.stringify(withTimestamp));
    onLocationSet(withTimestamp);
  };

  const handleAllow = () => {
    setStep('detecting');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          let label = 'Your location';
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
              { headers: { 'User-Agent': 'PHF-App' } }
            );
            const geoData = await geoRes.json();
            if (geoData.address) {
              const area =
                geoData.address.suburb ||
                geoData.address.neighbourhood ||
                geoData.address.city_district ||
                geoData.address.city ||
                '';
              if (area) label = area;
            }
          } catch (err) {
            console.log('Reverse geocode failed');
          }

          const detected = { lat: latitude, lng: longitude, label };
          setDetectedLocation(detected);
          setStep('detected');

          setTimeout(() => {
            saveLocation(detected);
            setShow(false);
          }, 1800);
        },
        () => {
          const fallback = {
            lat: 34.0151,
            lng: 71.5249,
            label: 'Peshawar City Center'
          };
          setDetectedLocation(fallback);
          setStep('detected');
          setTimeout(() => {
            saveLocation(fallback);
            setShow(false);
          }, 1800);
        }
      );
    } else {
      const fallback = {
        lat: 34.0151,
        lng: 71.5249,
        label: 'Peshawar City Center'
      };
      setDetectedLocation(fallback);
      setStep('detected');
      setTimeout(() => {
        saveLocation(fallback);
        setShow(false);
      }, 1800);
    }
  };

  const handleNotNow = () => {
    saveLocation({
      lat: 34.0151,
      lng: 71.5249,
      label: 'Peshawar City Center'
    });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#FAF8F5] border border-gray-200 rounded-xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-teal-700/10 flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0F766E"
            strokeWidth="1.5"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        {step === 'ask' && (
          <>
            <p className="text-[11px] tracking-[0.15em] uppercase text-gray-500 mb-3">
              Location
            </p>
            <h2 className="font-serif text-3xl text-gray-900 mb-4">
              Allow location access?
            </h2>
            <p className="text-sm text-gray-600 mb-8 max-w-xs mx-auto leading-relaxed">
              We'll show you hotels near you in Peshawar. Your location stays
              private and is never shared.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleAllow}
                className="px-6 py-3 bg-teal-700 text-white text-sm rounded-lg hover:bg-teal-800 transition font-medium"
              >
                Allow location
              </button>
              <button
                onClick={handleNotNow}
                className="px-6 py-3 border border-gray-300 text-gray-900 text-sm rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Not now
              </button>
            </div>
          </>
        )}

        {step === 'detecting' && (
          <>
            <p className="text-[11px] tracking-[0.15em] uppercase text-gray-500 mb-3">
              Detecting
            </p>
            <h2 className="font-serif text-3xl text-gray-900 mb-4">
              Finding your location...
            </h2>
            <p className="text-sm text-gray-600 mb-8">
              Please allow location access in your browser.
            </p>
            <div className="flex justify-center">
              <div className="w-10 h-10 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
            </div>
          </>
        )}

        {step === 'detected' && detectedLocation && (
          <>
            <p className="text-[11px] tracking-[0.15em] uppercase text-teal-700 mb-3 font-medium">
              ✓ Location detected
            </p>
            <h2 className="font-serif text-3xl text-gray-900 mb-4">
              {detectedLocation.label}
            </h2>
            <p className="text-sm text-gray-600 mb-8">
              Showing hotels near you in Peshawar.
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-xs text-gray-500 font-mono">
              📍 {detectedLocation.lat.toFixed(4)},{' '}
              {detectedLocation.lng.toFixed(4)}
            </div>
            <div className="mt-6 flex justify-center">
              <div className="w-2 h-2 rounded-full bg-teal-700 animate-pulse" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LocationModal;