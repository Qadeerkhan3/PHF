import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const LocationModal = ({ onLocationSet }) => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState('ask');
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [manualResults, setManualResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ═══════════════════════════════════════════════════
  // Reverse Geocoding
  // ═══════════════════════════════════════════════════
  const reverseGeocode = async (lat, lng) => {
    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
        { headers: { 'User-Agent': 'PHF-App' } }
      );
      const nomData = await nomRes.json();

      if (nomData.address) {
        const area =
          nomData.address.neighbourhood ||
          nomData.address.suburb ||
          nomData.address.quarter ||
          nomData.address.residential ||
          nomData.address.village ||
          nomData.address.hamlet;
        const city = nomData.address.city || nomData.address.town;

        if (area && area !== city && area !== 'Peshawar') {
          return city ? `${area}, ${city}` : area;
        }
        if (city) return city;
      }
    } catch (err) {
      console.error('Nominatim failed:', err);
    }

    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await res.json();
      const locality = data.locality;
      const city = data.city;

      if (locality && locality !== city) {
        return city ? `${locality}, ${city}` : locality;
      }
      if (city) return city;
    } catch (err) {
      console.error('BigDataCloud failed:', err);
    }

    return null;
  };

  // ═══════════════════════════════════════════════════
  // LAYER 1: IP-BASED LOCATION (Fast — 1-2 sec)
  // ═══════════════════════════════════════════════════
  const getIPLocation = async () => {
    try {
      console.log('📍 Layer 1: IP location...');
      const apiKey = '9f600e40ec8142cf90a307b10ab1ddb2';
      const res = await fetch(
        `https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`
      );
      const data = await res.json();

      if (data.location?.latitude && data.location?.longitude) {
        return {
          lat: data.location.latitude,
          lng: data.location.longitude,
          label: data.city?.name || 'Your city',
          source: 'ip'
        };
      }
      return null;
    } catch (err) {
      console.error('IP failed:', err);
      return null;
    }
  };

  // ═══════════════════════════════════════════════════
  // LAYER 2: GPS LOCATION (Accurate — 5-15 sec)
  // ═══════════════════════════════════════════════════
  const getGPSLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      console.log('📍 Layer 2: GPS location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('✓ GPS:', pos.coords.latitude, pos.coords.longitude, `accuracy: ${pos.coords.accuracy}m`);
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            source: 'gps'
          });
        },
        (err) => {
          console.log('✗ GPS failed:', err.message);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  // ═══════════════════════════════════════════════════
  // LAYER 3: MANUAL SEARCH (Geoapify Autocomplete)
  // ═══════════════════════════════════════════════════
  const searchManualLocation = async (query) => {
    if (!query || query.length < 3) {
      setManualResults([]);
      return;
    }

    setSearching(true);
    try {
      const apiKey = '9f600e40ec8142cf90a307b10ab1ddb2';
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&filter=countrycode:pk&limit=5&apiKey=${apiKey}`
      );
      const data = await res.json();

      const results = (data.features || []).map((f) => ({
        lat: f.properties.lat,
        lng: f.properties.lon,
        label: f.properties.formatted || f.properties.address_line1,
        city: f.properties.city
      }));

      setManualResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setManualResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleManualSelect = (loc) => {
    const selected = {
      lat: loc.lat,
      lng: loc.lng,
      label: loc.label,
      source: 'manual'
    };
    saveLocation(selected);
    setStep('detected');
    setDetectedLocation(selected);

    localStorage.setItem('locationPermissionAsked', 'true');
    localStorage.setItem('locationPermissionState', 'granted');

    setTimeout(() => {
      setShow(false);
    }, 1200);
  };

  const saveLocation = (loc) => {
    const withTimestamp = { ...loc, timestamp: Date.now() };
    localStorage.setItem('userLocation', JSON.stringify(withTimestamp));
    onLocationSet(withTimestamp);
  };

  // ═══════════════════════════════════════════════════
  // SMART LOCATION — 3 layers with 1 min cache
  // ═══════════════════════════════════════════════════
  const getSmartLocation = async (onSuccess, onError) => {
    // Layer 1: IP first (fast)
    const ipLoc = await getIPLocation();

    if (ipLoc) {
      console.log('✓ IP ready:', ipLoc.label);
      onSuccess(ipLoc, false);

      // Layer 2: GPS background
      const gpsLoc = await getGPSLocation();

      if (gpsLoc) {
        const distance = Math.sqrt(
          Math.pow(gpsLoc.lat - ipLoc.lat, 2) +
            Math.pow(gpsLoc.lng - ipLoc.lng, 2)
        );

        // Agar GPS location IP se significantly different hai
        if (distance > 0.02) {
          // ~2km
          const areaName = await reverseGeocode(gpsLoc.lat, gpsLoc.lng);
          console.log('✓ GPS better:', areaName);
          onSuccess(
            {
              lat: gpsLoc.lat,
              lng: gpsLoc.lng,
              label: areaName || 'Your location',
              accuracy: gpsLoc.accuracy,
              source: 'gps'
            },
            true
          );
        }
      }
    } else {
      // IP fail — GPS only
      const gpsLoc = await getGPSLocation();
      if (gpsLoc) {
        const areaName = await reverseGeocode(gpsLoc.lat, gpsLoc.lng);
        onSuccess(
          {
            lat: gpsLoc.lat,
            lng: gpsLoc.lng,
            label: areaName || 'Your location',
            accuracy: gpsLoc.accuracy,
            source: 'gps'
          },
          true
        );
      } else {
        onError();
      }
    }
  };

  // ═══════════════════════════════════════════════════
  // INIT — Page load par
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    const initLocation = async () => {
      const saved = localStorage.getItem('userLocation');
      const permissionAsked = localStorage.getItem('locationPermissionAsked');
      const permissionState = localStorage.getItem('locationPermissionState');

      // Pehli baar — popup
      if (!permissionAsked) {
        const timer = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(timer);
      }

      // "Not now" kiya tha
      if (permissionState === 'denied') {
        if (saved) {
          const { lat, lng, label } = JSON.parse(saved);
          onLocationSet({ lat, lng, label });
        } else {
          const ipLoc = await getIPLocation();
          onLocationSet(
            ipLoc || {
              lat: 34.0151,
              lng: 71.5249,
              label: 'Peshawar City Center'
            }
          );
        }
        return;
      }

      // ═══════════════════════════════════════════════════
      // "Allow" kiya tha — 1 MINUTE CACHE CHECK
      // ═══════════════════════════════════════════════════
      if (saved) {
        const { lat, lng, label, timestamp } = JSON.parse(saved);
        const ageInMinutes = (Date.now() - timestamp) / 1000 / 60;

        // ✅ CACHE 1 MINUTE — agar 1 min se kam purani hai toh use karo
        if (ageInMinutes < 1) {
          console.log(`✓ Cache valid (${ageInMinutes.toFixed(1)} min old) — using cached location`);
          onLocationSet({ lat, lng, label });
          return;
        }

        console.log(`⏰ Cache expired (${ageInMinutes.toFixed(1)} min old) — fetching fresh location`);
      }

      // Fresh location lo (IP + GPS)
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({
            name: 'geolocation'
          });

          if (result.state === 'granted') {
            getSmartLocation(
              (loc) => saveLocation(loc),
              async () => {
                const ipLoc = await getIPLocation();
                if (ipLoc) onLocationSet(ipLoc);
                else if (saved) {
                  const { lat, lng, label } = JSON.parse(saved);
                  onLocationSet({ lat, lng, label });
                } else {
                  onLocationSet({
                    lat: 34.0151,
                    lng: 71.5249,
                    label: 'Peshawar City Center'
                  });
                }
              }
            );
          } else if (result.state === 'denied') {
            const ipLoc = await getIPLocation();
            onLocationSet(
              ipLoc || {
                lat: 34.0151,
                lng: 71.5249,
                label: 'Peshawar City Center'
              }
            );
          } else {
            if (saved) {
              const { lat, lng, label } = JSON.parse(saved);
              onLocationSet({ lat, lng, label });
            } else {
              setShow(true);
            }
          }
        } catch (err) {
          const ipLoc = await getIPLocation();
          onLocationSet(
            ipLoc || {
              lat: 34.0151,
              lng: 71.5249,
              label: 'Peshawar City Center'
            }
          );
        }
      } else {
        const ipLoc = await getIPLocation();
        onLocationSet(
          ipLoc || {
            lat: 34.0151,
            lng: 71.5249,
            label: 'Peshawar City Center'
          }
        );
      }
    };

    initLocation();
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

  // Skip button — 10 sec baad
  useEffect(() => {
    if (step === 'detecting') {
      const timer = setTimeout(() => setShowSkip(true), 10000);
      return () => clearTimeout(timer);
    } else {
      setShowSkip(false);
    }
  }, [step]);

  const handleAllow = async () => {
    setStep('detecting');

    getSmartLocation(
      async (loc) => {
        const areaName = await reverseGeocode(loc.lat, loc.lng);
        const detected = {
          lat: loc.lat,
          lng: loc.lng,
          label: areaName || loc.label || 'Your location'
        };

        setDetectedLocation(detected);
        setStep('detected');

        localStorage.setItem('locationPermissionAsked', 'true');
        localStorage.setItem('locationPermissionState', 'granted');

        setTimeout(() => {
          saveLocation(detected);
          setShow(false);
        }, 1200);
      },
      async () => {
        // Sab fail — manual mode
        setStep('manual');
      }
    );
  };

  const handleNotNow = async () => {
    const ipLoc = await getIPLocation();
    saveLocation(
      ipLoc || {
        lat: 34.0151,
        lng: 71.5249,
        label: 'Peshawar City Center'
      }
    );
    localStorage.setItem('locationPermissionAsked', 'true');
    localStorage.setItem('locationPermissionState', 'denied');
    setShow(false);
  };

  const handleSkip = () => {
    setStep('manual');
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
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="1.5">
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
              We'll show you hotels near you. Your location stays private and is never shared.
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
              This may take a few seconds.
            </p>
            <div className="flex justify-center mb-6">
              <div className="w-10 h-10 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
            </div>
            {showSkip && (
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 underline transition"
              >
                Can't find? Select manually
              </button>
            )}
          </>
        )}

        {step === 'manual' && (
          <>
            <p className="text-[11px] tracking-[0.15em] uppercase text-gray-500 mb-3">
              Manual Location
            </p>
            <h2 className="font-serif text-2xl text-gray-900 mb-4">
              Where are you?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Type your area, city, or landmark
            </p>

            <input
              type="text"
              value={manualSearch}
              onChange={(e) => {
                setManualSearch(e.target.value);
                searchManualLocation(e.target.value);
              }}
              placeholder="e.g., Tehkal, Peshawar"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm mb-4"
              autoFocus
            />

            {searching && (
              <p className="text-xs text-gray-500 mb-2">Searching...</p>
            )}

            {manualResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {manualResults.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => handleManualSelect(loc)}
                    className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition"
                  >
                    <p className="text-sm text-gray-900">{loc.label}</p>
                    {loc.city && (
                      <p className="text-xs text-gray-500">{loc.city}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {manualSearch.length >= 3 && !searching && manualResults.length === 0 && (
              <p className="text-xs text-gray-500">
                No results. Try a different search.
              </p>
            )}
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
              📍 {detectedLocation.lat.toFixed(4)}, {detectedLocation.lng.toFixed(4)}
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