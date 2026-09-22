import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const LocationModal = ({ onLocationSet }) => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState('ask'); // ask | detecting | detected
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('userLocation');

    if (saved) {
      const { lat, lng, label, timestamp } = JSON.parse(saved);
      const ageInMinutes = (Date.now() - timestamp) / 1000 / 60;

      if (ageInMinutes < 30) {
        onLocationSet({ lat, lng, label });
        return;
      }

      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const { latitude, longitude } = pos.coords;
                const areaName = await reverseGeocode(latitude, longitude);
                const newLoc = {
                  lat: latitude,
                  lng: longitude,
                  label: areaName || 'Your location',
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

  // Body scroll lock
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  // ═══════════════════════════════════════════════════
  // Reverse Geocoding — Nominatim pehle (specific area),
  // BigDataCloud fallback
  // ═══════════════════════════════════════════════════
  const reverseGeocode = async (lat, lng) => {
    // ─── 1. Nominatim pehle try karo (specific area name) ───
    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
        { headers: { 'User-Agent': 'PHF-App' } }
      );
      const nomData = await nomRes.json();

      console.log('=== Nominatim Full Data ===');
      console.log(JSON.stringify(nomData.address, null, 2));

      if (nomData.address) {
        // Area name — priority order (chhota se bada)
        const area =
          nomData.address.neighbourhood ||     // "Tehkal"
          nomData.address.suburb ||             // "University Town"
          nomData.address.quarter ||            // "Jahangir Abad"
          nomData.address.residential ||        // Residential
          nomData.address.village ||            // Village
          nomData.address.hamlet ||             // Small settlement
          nomData.address.city_district;        // "Peshawar City"

        // City name
        const city =
          nomData.address.city ||
          nomData.address.town ||
          nomData.address.municipality;

        console.log('Nominatim area:', area);
        console.log('Nominatim city:', city);

        // Combine
        if (area && area !== city && area !== 'Peshawar') {
          return city ? `${area}, ${city}` : area;
        }

        if (city && city !== 'Peshawar') {
          return city;
        }

        if (city === 'Peshawar') {
          // Peshawar hai, lekin area nahi mila — BigDataCloud try karo
          console.log('Only Peshawar from Nominatim, trying BigDataCloud...');
        } else if (city) {
          return city;
        }
      }
    } catch (err) {
      console.error('Nominatim failed:', err);
    }

    // ─── 2. BigDataCloud fallback ───
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await res.json();

      console.log('=== BigDataCloud Full Data ===');
      console.log(JSON.stringify(data, null, 2));

      const locality = data.locality;
      const city = data.city;

      // Priority 1: locality (specific area)
      if (locality && locality !== city && locality !== 'Peshawar') {
        return city ? `${locality}, ${city}` : locality;
      }

      // Priority 2: administrative array (deepest first)
      if (data.localityInfo?.administrative) {
        const sorted = [...data.localityInfo.administrative].sort(
          (a, b) => (b.adminLevel || 0) - (a.adminLevel || 0)
        );

        for (const item of sorted) {
          if (
            item.name &&
            item.name !== 'Pakistan' &&
            item.name !== 'Khyber Pakhtunkhwa' &&
            item.name !== 'Peshawar' &&
            item.name !== city
          ) {
            return city ? `${item.name}, ${city}` : item.name;
          }
        }
      }

      if (city) {
        return city;
      }

      return 'Your location';
    } catch (err) {
      console.error('BigDataCloud failed:', err);
      return null;
    }
  };

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

          console.log('=== GPS Coordinates ===');
          console.log('Lat:', latitude, 'Lng:', longitude);

          const areaName = await reverseGeocode(latitude, longitude);

          const detected = {
            lat: latitude,
            lng: longitude,
            label:
              areaName || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
          };

          setDetectedLocation(detected);
          setStep('detected');

          setTimeout(() => {
            saveLocation(detected);
            setShow(false);
          }, 2000);
        },
        async () => {
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
          }, 2000);
        }
      );
    } else {
      const fallback = {
        lat: 34.0151,
        lng: 71.5249,
        label: 'Peshawar City Center'
      };
      saveLocation(fallback);
      setShow(false);
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

  if (!show || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-24 md:pt-32 overflow-y-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      <div className="bg-[#FAF8F5] border border-gray-200 rounded-xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl my-4">
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
              We'll show you hotels near you. Your location stays private and
              is never shared.
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
            <h2 className="font-serif text-2xl text-gray-900 mb-4 px-4">
              {detectedLocation.label}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Showing hotels near you.
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-500 font-mono">
              📍 {detectedLocation.lat.toFixed(4)},{' '}
              {detectedLocation.lng.toFixed(4)}
            </div>
            <div className="mt-6 flex justify-center">
              <div className="w-2 h-2 rounded-full bg-teal-700 animate-pulse" />
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default LocationModal;