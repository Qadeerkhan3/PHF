import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HotelCard from '../components/HotelCard';
import GoogleHotelCard from '../components/GoogleHotelCard';
import LocationModal from '../components/LocationModal';
import { getNearbyHotels, getNearbyGoogleHotels } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

const PESHAWAR_LAT = 34.0151;
const PESHAWAR_LNG = 71.5249;

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Home = () => {
  const [dbHotels, setDbHotels] = useState([]);
  const [googleHotels, setGoogleHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [location, setLocation] = useState({
    lat: PESHAWAR_LAT,
    lng: PESHAWAR_LNG,
    label: 'Peshawar City Center'
  });
  const [radius, setRadius] = useState(5000);

  const heroRef = useRef(null);
  const hotelsRef = useRef(null);
  const googleRef = useRef(null);
  const stepsRef = useRef(null);
  const testimonialRef = useRef(null);

  const isUserInPeshawar =
    getDistanceKm(location.lat, location.lng, PESHAWAR_LAT, PESHAWAR_LNG) < 50;

  // Fetch DB + Google
  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      setLoading(true);
      setLoadingGoogle(true);

      let dbResults = [];

      // 1. DB hotels
      if (isUserInPeshawar) {
        try {
          const dbRes = await getNearbyHotels(
            location.lat,
            location.lng,
            radius
          );
          dbResults = dbRes.data || [];
          if (isMounted) setDbHotels(dbResults);
        } catch (err) {
          console.error('DB fetch failed:', err);
          if (isMounted) setDbHotels([]);
        }
      } else {
        if (isMounted) setDbHotels([]);
      }

      if (isMounted) setLoading(false);

      // 2. Google hotels
      try {
        const googleRes = await getNearbyGoogleHotels(
          location.lat,
          location.lng,
          radius
        );

        const dbNames = new Set(
          (isUserInPeshawar ? dbResults : []).map((h) =>
            h.name.toLowerCase().trim()
          )
        );

        const uniqueGoogle = (googleRes.data || []).filter((gh) => {
          const gName = gh.displayName?.text?.toLowerCase().trim();
          if (!gName) return false;
          for (const dbName of dbNames) {
            if (gName.includes(dbName) || dbName.includes(gName)) {
              return false;
            }
          }
          return true;
        });

        if (isMounted) setGoogleHotels(uniqueGoogle);
      } catch (err) {
        console.error('Google fetch failed:', err);
        if (isMounted) setGoogleHotels([]);
      } finally {
        if (isMounted) setLoadingGoogle(false);
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, [location.lat, location.lng, radius, isUserInPeshawar]);

  // Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.8, delay: 0.2 });
      gsap.from('.hero-title', { y: 40, opacity: 0, duration: 1, delay: 0.4 });
      gsap.from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.8, delay: 0.7 });
      gsap.from('.hero-divider', { scaleX: 0, opacity: 0, duration: 1, delay: 1 });
      gsap.to('.hero-bg', {
        scale: 1.1,
        duration: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!loading && dbHotels.length > 0 && hotelsRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.hotel-card-item', {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: hotelsRef.current,
            start: 'top 80%'
          }
        });
      }, hotelsRef);
      return () => ctx.revert();
    }
  }, [loading, dbHotels]);

  useEffect(() => {
    if (!loadingGoogle && googleHotels.length > 0 && googleRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.google-card-item', {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: googleRef.current,
            start: 'top 80%'
          }
        });
      }, googleRef);
      return () => ctx.revert();
    }
  }, [loadingGoogle, googleHotels]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.step-item', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: { trigger: stepsRef.current, start: 'top 75%' }
      });
    }, stepsRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.testimonial-content', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: testimonialRef.current, start: 'top 80%' }
      });
    }, testimonialRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <LocationModal onLocationSet={setLocation} />

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1920&q=80"
            alt="Peshawar"
            className="hero-bg w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/80" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAF8F5] to-transparent" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="hero-eyebrow text-xs tracking-[0.3em] text-teal-300 mb-6 font-medium">
            THE CITY OF HOSPITALITY
          </p>
          <h1 className="hero-title font-serif text-4xl md:text-6xl lg:text-7xl text-white mb-8 leading-[1.05]">
            Stay somewhere<br />worth remembering.
          </h1>
          <p className="hero-subtitle text-base md:text-lg text-gray-200 leading-relaxed max-w-xl mx-auto">
            Your trusted guide to Peshawar's finest stays. Compare real prices,
            discover welcoming spaces, and book directly.
          </p>
          <div className="hero-divider mt-12 flex items-center justify-center gap-3">
            <div className="w-16 h-px bg-white/40" />
            <div className="w-2 h-2 rounded-full bg-teal-400" />
            <div className="w-16 h-px bg-white/40" />
          </div>
        </div>
      </section>

      {/* LOCATION BAR */}
      <section className="px-6 max-w-4xl mx-auto -mt-12 relative z-20 pb-16">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-700/10 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-1">
                Your location
              </p>
              <p className="text-sm font-medium text-gray-900">{location.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          </div>
          <div className="hidden md:block w-px h-12 bg-gray-200" />
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Within {(radius / 1000).toFixed(1)}km
            </span>
            <input
              type="range"
              min="1000"
              max="15000"
              step="1000"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-40 accent-teal-700"
            />
            <span className="text-xs text-gray-500">15km</span>
          </div>
        </div>
      </section>

      {/* DB HOTELS */}
      {isUserInPeshawar ? (
        <section ref={hotelsRef} className="px-6 max-w-6xl mx-auto pb-16">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.2em] text-teal-700 mb-3 font-medium">
                BOOK DIRECTLY
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-gray-900 leading-tight">
                Stays with a sense<br />of place.
              </h2>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-gray-500">
                {dbHotels.length} {dbHotels.length === 1 ? 'stay' : 'stays'} on our platform
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-56 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : dbHotels.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
              <p className="text-gray-500 mb-2">No platform hotels in this area.</p>
              <p className="text-sm text-gray-400">Try increasing the radius.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dbHotels.map((hotel) => (
                <div key={hotel._id} className="hotel-card-item">
                  <HotelCard hotel={hotel} />
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="px-6 max-w-4xl mx-auto pb-16">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-10 md:p-12 text-center">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <p className="text-xs tracking-[0.2em] text-amber-700 mb-3 font-medium">
              NOT FOR YOUR CITY YET
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4">
              We're not in your city yet.
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-6 leading-relaxed">
              Peshawar Hotel Finder's curated listings are currently only available in Peshawar. We're working to expand to more cities soon. In the meantime, explore hotels discovered nearby below.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-amber-800 bg-white/60 px-4 py-2 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Your location: {location.label}
            </div>
          </div>
        </section>
      )}

      {/* GOOGLE HOTELS */}
      <section
        ref={googleRef}
        className="px-6 max-w-6xl mx-auto pb-24 pt-16 border-t border-gray-200"
      >
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.2em] text-amber-600 mb-3 font-medium">
              {isUserInPeshawar ? 'DISCOVER MORE' : 'NEARBY HOTELS'}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900 leading-tight">
              {isUserInPeshawar ? 'More stays nearby.' : 'Hotels near you.'}
            </h2>
            <p className="text-sm text-gray-500 mt-4 max-w-xl">
              Hotels around {location.label} — discovered via OpenStreetMap.
            </p>
          </div>
          {!loadingGoogle && googleHotels.length > 0 && (
            <div className="hidden md:block">
              <p className="text-sm text-gray-500">
                {googleHotels.length} found nearby
              </p>
            </div>
          )}
        </div>

        {loadingGoogle ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-56 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : googleHotels.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl text-gray-900 mb-3">
              No hotels found on OpenStreetMap
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
              We couldn't find hotels in this area on OpenStreetMap. Try
              increasing the radius above, or search directly on Google Maps.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href={`https://www.google.com/maps/search/hotels/@${location.lat},${location.lng},14z`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-full text-sm font-medium transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Search on Google Maps
              </a>
              <button
                onClick={() => setRadius(15000)}
                className="text-sm text-teal-700 hover:text-teal-800 font-medium underline"
              >
                Increase radius to 15km
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {googleHotels.map((place) => (
              <div key={place.id} className="google-card-item">
                <GoogleHotelCard place={place} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section
        ref={stepsRef}
        className="px-6 py-24 bg-gray-900 text-white relative overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 border border-teal-700/20 rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 border border-teal-700/10 rounded-full" />
        <div className="relative max-w-6xl mx-auto">
          <p className="text-xs tracking-[0.2em] text-teal-400 mb-3 font-medium">
            SIMPLE BY DESIGN
          </p>
          <h2 className="font-serif text-4xl md:text-5xl mb-16 leading-tight">
            Find your next stay<br />in three easy steps.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="step-item">
              <p className="font-serif text-7xl text-teal-700/40 mb-6">01</p>
              <div className="w-10 h-px bg-teal-500 mb-6" />
              <h3 className="font-serif text-2xl mb-3">Choose your area</h3>
              <p className="text-gray-400 leading-relaxed">
                Tell us where you want to be, or let your location guide you to nearby stays.
              </p>
            </div>
            <div className="step-item">
              <p className="font-serif text-7xl text-teal-700/40 mb-6">02</p>
              <div className="w-10 h-px bg-teal-500 mb-6" />
              <h3 className="font-serif text-2xl mb-3">Compare with confidence</h3>
              <p className="text-gray-400 leading-relaxed">
                Browse real prices, honest details, and the local knowledge you need.
              </p>
            </div>
            <div className="step-item">
              <p className="font-serif text-7xl text-teal-700/40 mb-6">03</p>
              <div className="w-10 h-px bg-teal-500 mb-6" />
              <h3 className="font-serif text-2xl mb-3">Book directly</h3>
              <p className="text-gray-400 leading-relaxed">
                Message your chosen hotel on WhatsApp. No middlemen, no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section ref={testimonialRef} className="px-6 py-24 bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.2em] text-teal-700 mb-3 font-medium">
              THE LOCAL WORD
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900">
              Good stays. Good stories.
            </h2>
          </div>
          <div className="testimonial-content bg-white border border-gray-200 rounded-2xl p-10 md:p-16 shadow-sm relative">
            <div className="absolute -top-6 left-10 text-8xl text-teal-700/20 font-serif leading-none">"</div>
            <p className="relative font-serif text-2xl md:text-3xl text-gray-800 italic leading-relaxed mb-10 text-center">
              Finally, a simple way to find a clean, comfortable stay in the city. The WhatsApp booking made everything effortless.
            </p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center text-sm font-medium">
                AK
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Ayesha K.</p>
                <p className="text-xs text-gray-500">Peshawar local</p>
              </div>
            </div>
            <p className="text-amber-500 text-center text-sm tracking-widest">★★★★★</p>
          </div>
        </div>
      </section>

      {/* FOR HOTEL OWNERS */}
      <section className="px-6 py-24 bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] text-teal-100 mb-4 font-medium">
            FOR HOTEL OWNERS
          </p>
          <h2 className="font-serif text-4xl md:text-5xl mb-6 leading-tight">
            Have a place worth sharing?
          </h2>
          <p className="text-teal-50 max-w-lg mx-auto mb-10 leading-relaxed">
            Put your hotel in front of travelers who are ready to discover Peshawar. Listing is free, and our team is here to help.
          </p>
          <a
            href="https://wa.me/923351092493?text=Assalam%20o%20Alaikum%2C%20mujhe%20apna%20hotel%20Peshawar%20Hotel%20Finder%20par%20list%20karwana%20hai."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-full hover:bg-teal-50 transition text-sm font-medium shadow-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
            </svg>
            List your hotel on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;