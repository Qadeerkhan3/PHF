import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HotelCard from '../components/HotelCard';
import LocationModal from '../components/LocationModal';
import { getNearbyHotels } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({
    lat: 34.0151,
    lng: 71.5249,
    label: 'Peshawar City Center'
  });
  const [radius, setRadius] = useState(3000);

  const heroRef = useRef(null);
  const hotelsRef = useRef(null);
  const stepsRef = useRef(null);
  const testimonialRef = useRef(null);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const res = await getNearbyHotels(location.lat, location.lng, radius);
        setHotels(res.data);
      } catch (err) {
        console.error('Error fetching hotels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [location, radius]);

  // Hero animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-eyebrow', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power2.out'
      });
      gsap.from('.hero-title', {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: 'power2.out'
      });
      gsap.from('.hero-subtitle', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.7,
        ease: 'power2.out'
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Hotels stagger
  useEffect(() => {
    if (!loading && hotels.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from('.hotel-card-item', {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: hotelsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      }, hotelsRef);

      return () => ctx.revert();
    }
  }, [loading, hotels]);

  // Steps
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.step-item', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: stepsRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      });
    }, stepsRef);

    return () => ctx.revert();
  }, []);

  // Testimonial
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.testimonial-content', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: testimonialRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }, testimonialRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <LocationModal onLocationSet={setLocation} />

      {/* ═══════════════════════════════════════ */}
      {/* HERO — Warm tinted background          */}
      {/* ═══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative px-6 pt-40 pb-24 text-center overflow-hidden"
      >
        {/* Decorative background shapes */}
        <div className="absolute top-20 -left-40 w-96 h-96 bg-teal-700/5 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto">
          <p className="hero-eyebrow text-xs tracking-[0.3em] text-teal-700 mb-6 font-medium">
            THE CITY OF HOSPITALITY
          </p>
          <h1 className="hero-title font-serif text-5xl md:text-7xl text-gray-900 mb-8 leading-[1.05]">
            Stay somewhere<br />worth remembering.
          </h1>
          <p className="hero-subtitle text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
            Your trusted guide to Peshawar's finest stays. Compare real prices,
            discover welcoming spaces, and book directly.
          </p>

          {/* Divider */}
          <div className="mt-12 flex items-center justify-center gap-3">
            <div className="w-12 h-px bg-gray-400" />
            <div className="w-2 h-2 rounded-full bg-teal-700" />
            <div className="w-12 h-px bg-gray-400" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* LOCATION BAR — Card style              */}
      {/* ═══════════════════════════════════════ */}
      <section className="px-6 max-w-4xl mx-auto pb-16">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-700/10 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0F766E"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-1">
                Your location
              </p>
              <p className="text-sm font-medium text-gray-900">
                {location.label}
              </p>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-gray-200" />

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">
              Within {(radius / 1000).toFixed(1)}km
            </span>
            <input
              type="range"
              min="1000"
              max="8000"
              step="1000"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-40 accent-teal-700"
            />
            <span className="text-xs text-gray-500">8km</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* HOTELS GRID                            */}
      {/* ═══════════════════════════════════════ */}
      <section ref={hotelsRef} className="px-6 max-w-6xl mx-auto pb-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.2em] text-teal-700 mb-3 font-medium">
              A GOOD PLACE TO BEGIN
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900 leading-tight">
              Stays with a sense<br />of place.
            </h2>
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-gray-500">
              {hotels.length} {hotels.length === 1 ? 'stay' : 'stays'} nearby
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-56 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
            <p className="text-gray-500 mb-2">No hotels found in this area.</p>
            <p className="text-sm text-gray-400">
              Try increasing the radius.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <div key={hotel._id} className="hotel-card-item">
                <HotelCard hotel={hotel} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* HOW IT WORKS — Dark section            */}
      {/* ═══════════════════════════════════════ */}
      <section
        ref={stepsRef}
        className="px-6 py-24 bg-gray-900 text-white relative overflow-hidden"
      >
        {/* Decorative circle */}
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
              <h3 className="font-serif text-2xl mb-3">
                Choose your area
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Tell us where you want to be, or let your location guide you to
                nearby stays.
              </p>
            </div>

            <div className="step-item">
              <p className="font-serif text-7xl text-teal-700/40 mb-6">02</p>
              <div className="w-10 h-px bg-teal-500 mb-6" />
              <h3 className="font-serif text-2xl mb-3">
                Compare with confidence
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Browse real prices, honest details, and the local knowledge you
                need.
              </p>
            </div>

            <div className="step-item">
              <p className="font-serif text-7xl text-teal-700/40 mb-6">03</p>
              <div className="w-10 h-px bg-teal-500 mb-6" />
              <h3 className="font-serif text-2xl mb-3">Book directly</h3>
              <p className="text-gray-400 leading-relaxed">
                Message your chosen hotel on WhatsApp. No middlemen, no hidden
                fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* TESTIMONIAL — Cream card               */}
      {/* ═══════════════════════════════════════ */}
      <section
        ref={testimonialRef}
        className="px-6 py-24 bg-[#FAF8F5]"
      >
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
            {/* Quote mark */}
            <div className="absolute -top-6 left-10 text-8xl text-teal-700/20 font-serif leading-none">
              "
            </div>

            <p className="relative font-serif text-2xl md:text-3xl text-gray-800 italic leading-relaxed mb-10 text-center">
              Finally, a simple way to find a clean, comfortable stay in the
              city. The WhatsApp booking made everything effortless.
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
            <p className="text-amber-500 text-center text-sm tracking-widest">
              ★★★★★
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* FOR HOTEL OWNERS — Teal CTA            */}
      {/* ═══════════════════════════════════════ */}
      <section className="px-6 py-24 bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 text-white relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full"
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
            Put your hotel in front of travelers who are ready to discover
            Peshawar. Listing is free, and our team is here to help.
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