import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const LocationModal = ({ onLocationSet }) => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState('ask'); // ask | detecting | detected
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

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

        if (city && city !== 'Peshawar') {
          return city;
        }
      }
    } catch (err) {
      console.error('Nominatim failed:', err);
    }

    // BigDataCloud fallback
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await res.json();

      const locality = data.locality;
      const city = data.city;

      if (locality && locality !== city && locality !== 'Peshawar') {
        return city ? `${locality}, ${city}` : locality;
      }

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

      if (city) return city;
    } catch (err) {
      console.error('BigDataCloud failed:', err);
    }

    return null;
  };

  // ═══════════════════════════════════════════════════
  // SMART GEOLOCATION — 3-Step Fallback
  // ═══════════════════════════════════════════════════
  const getLocationSmart = (onSuccess, onError) => {
    // ─── Step 1: Fast low-accuracy (WiFi/Cell) ───
    console.log('📍 Step 1: Fast location (WiFi/Cell)...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log(
          '✓ Fast location success:',
          pos.coords.latitude,
          pos.coords.longitude
        );
        onSuccess(pos, false);

        // Background high-accuracy update
        navigator.geolocation.getCurrentPosition(
          (accuratePos) => {
            console.log(
              '✓ Accurate location:',
              accuratePos.coords.latitude,
              accuratePos.coords.longitude
            );
            onSuccess(accuratePos, true);
          },
          (err) => {
            console.log('High accuracy update failed:', err.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 30000
          }
        );
      },
      (err) => {
        console.error('✗ Fast location failed:', err.message);

        // ─── Step 2: High accuracy (GPS) ───
        console.log('📍 Step 2: High accuracy (GPS)...');

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log(
              '✓ High accuracy success:',
              pos.coords.latitude,
              pos.coords.longitude
            );
            onSuccess(pos, true);
          },
          (err2) => {
            console.error('✗ High accuracy failed:', err2.message);

            // ─── Step 3: Last resort (long timeout) ───
            console.log('📍 Step 3: Last resort (long timeout)...');

            navigator.geolocation.getCurrentPosition(
              (pos) => {
                console.log(
                  '✓ Last resort success:',
                  pos.coords.latitude,
                  pos.coords.longitude
                );
                onSuccess(pos, true);
              },
              (err3) => {
                console.error('✗ All geolocation attempts failed');
                onError(err3);
              },
              {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 300000
              }
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  // ═══════════════════════════════════════════════════
  // SAVE LOCATION
  // ═══════════════════════════════════════════════════
  const saveLocation = (loc) => {
    const withTimestamp = { ...loc, timestamp: Date.now() };
    localStorage.setItem('userLocation', JSON.stringify(withTimestamp));
    onLocationSet(withTimestamp);
  };

  // ═══════════════════════════════════════════════════
  // INIT — Page load par
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    const initLocation = async () => {
      const saved = localStorage.getItem('userLocation');
      const permissionAsked = localStorage.getItem('locationPermissionAsked');
      const permissionState = localStorage.getItem('locationPermissionState');

      // ─── Pehli baar user aaya — popup dikhao ───
      if (!permissionAsked) {
        const timer = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(timer);
      }

      // ─── User ne "Not now" kiya tha ───
      if (permissionState === 'denied') {
        if (saved) {
          const { lat, lng, label } = JSON.parse(saved);
          onLocationSet({ lat, lng, label });
        } else {
          onLocationSet({
            lat: 34.0151,
            lng: 71.5249,
            label: 'Peshawar City Center'
          });
        }
        return;
      }

      // ─── User ne "Allow" kiya tha — silently fresh location lo ───
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({
            name: 'geolocation'
          });

          if (result.state === 'granted') {
            console.log('Permission granted — fetching fresh location...');

            getLocationSmart(
              async (pos, isAccurate) => {
                const { latitude, longitude } = pos.coords;

                const areaName = await reverseGeocode(latitude, longitude);

                const finalLoc = {
                  lat: latitude,
                  lng: longitude,
                  label: areaName || 'Your location',
                  timestamp: Date.now()
                };

                localStorage.setItem(
                  'userLocation',
                  JSON.stringify(finalLoc)
                );
                onLocationSet(finalLoc);
              },
              (err) => {
                // Saare attempts fail — cached ya default use karo
                console.log('All geolocation failed, using cache/default');

                if (saved) {
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
            // Browser-level deny
            onLocationSet({
              lat: 34.0151,
              lng: 71.5249,
              label: 'Peshawar City Center'
            });
          } else {
            // Prompt state
            if (saved) {
              const { lat, lng, label } = JSON.parse(saved);
              onLocationSet({ lat, lng, label });
            } else {
              setShow(true);
            }
          }
        } catch (err) {
          console.error('Permissions API failed:', err);
          if (saved) {
            const { lat, lng, label } = JSON.parse(saved);
            onLocationSet({ lat, lng, label });
          }
        }
      } else {
        // Permissions API support nahi
        if (saved) {
          const { lat, lng, label } = JSON.parse(saved);
          onLocationSet({ lat, lng, label });
        }
      }
    };

    initLocation();
  }, []);

  // ═══════════════════════════════════════════════════
  // Body scroll lock
  // ═══════════════════════════════════════════════════
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
  // Skip button — 8 sec baad dikhao
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    if (step === 'detecting') {
      const timer = setTimeout(() => setShowSkip(true), 8000);
      return () => clearTimeout(timer);
    } else {
      setShowSkip(false);
    }
  }, [step]);

  // ═══════════════════════════════════════════════════
  // User "Allow" dabata hai
  // ═══════════════════════════════════════════════════
  const handleAllow = () => {
    setStep('detecting');

    if (navigator.geolocation) {
      getLocationSmart(
        async (pos, isAccurate) => {
          const { latitude, longitude } = pos.coords;
          const areaName = await reverseGeocode(latitude, longitude);

          const detected = {
            lat: latitude,
            lng: longitude,
            label:
              areaName || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
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
          // Saare attempts fail — Peshawar default
          const fallback = {
            lat: 34.0151,
            lng: 71.5249,
            label: 'Peshawar City Center'
          };
          setDetectedLocation(fallback);
          setStep('detected');

          localStorage.setItem('locationPermissionAsked', 'true');
          localStorage.setItem('locationPermissionState', 'denied');

          setTimeout(() => {
            saveLocation(fallback);
            setShow(false);
          }, 1200);
        }
      );
    } else {
      const fallback = {
        lat: 34.0151,
        lng: 71.5249,
        label: 'Peshawar City Center'
      };
      saveLocation(fallback);
      localStorage.setItem('locationPermissionAsked', 'true');
      localStorage.setItem('locationPermissionState', 'denied');
      setShow(false);
    }
  };

  const handleNotNow = () => {
    saveLocation({
      lat: 34.0151,
      lng: 71.5249,
      label: 'Peshawar City Center'
    });
    localStorage.setItem('locationPermissionAsked', 'true');
    localStorage.setItem('locationPermissionState', 'denied');
    setShow(false);
  };

  const handleSkip = () => {
    saveLocation({
      lat: 34.0151,
      lng: 71.5249,
      label: 'Peshawar City Center'
    });
    localStorage.setItem('locationPermissionAsked', 'true');
    localStorage.setItem('locationPermissionState', 'denied');
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
                Skip for now
              </button>
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