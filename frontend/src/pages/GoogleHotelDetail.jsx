import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveLead } from '../services/api';

// WhatsApp number formatter
const formatWhatsApp = (num) => {
  let cleaned = num.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('92')) {
    cleaned = '92' + cleaned;
  }
  return cleaned;
};

const GoogleHotelDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [heroImgError, setHeroImgError] = useState(false);

  // ═══════════════════════════════════════════════════
  // DUPLICATE PREVENTION — useRef
  // ═══════════════════════════════════════════════════
  const leadsSentRef = useRef(new Set());

  useEffect(() => {
    if (location.state?.place) {
      setPlace(location.state.place);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  if (!place) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const name = place.displayName?.text || 'Unknown Hotel';
  const address = place.formattedAddress || 'Address not available';
  const rating = place.rating;
  const reviewCount = place.userRatingCount;
  const phone = place.internationalPhoneNumber;

  // Website / Map logic
  const website = place.websiteUri;
  const mapsUri = place.googleMapsUri || `https://www.openstreetmap.org/`;

  const bookTarget = website || mapsUri;
  const bookLabel = website ? 'Visit Official Website' : 'View on Map';

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : null;

  // WhatsApp handler
  const handleWhatsApp = async () => {
    if (!cleanPhone) {
      alert('WhatsApp number not available for this hotel');
      return;
    }

    const leadKey = `${place.id}_general`;

    // Step 1: WhatsApp kholo pehle
    const message = `Assalam o Alaikum,\n\nMujhe ${name} ke baare mein maloomat chahiye. Please availability aur prices batayein.`;
    const whatsappNumber = formatWhatsApp(cleanPhone);

    const whatsappWindow = window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );

    // Step 2: Lead save — sirf agar WhatsApp khula + duplicate nahi
    if (whatsappWindow && !leadsSentRef.current.has(leadKey)) {
      leadsSentRef.current.add(leadKey);

      try {
        await saveLead({
          hotelId: place.id,
          hotelName: name,
          roomType: 'General Inquiry',
          persons: 2,
          priceShown: 0,
          userLocation: { lat: 34.0151, lng: 71.5249 }
        });
        console.log('✓ Lead saved');
      } catch (err) {
        console.error('Lead save failed:', err);
      }
    }
  };

  // Unsplash fallback images
  const unsplashImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1600&q=80',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1600&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80'
  ];

  const getImageIndex = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % unsplashImages.length;
  };

  const heroImage = unsplashImages[getImageIndex(name)];

  const galleryIndexes = [
    (getImageIndex(name) + 2) % unsplashImages.length,
    (getImageIndex(name) + 4) % unsplashImages.length,
    (getImageIndex(name) + 6) % unsplashImages.length
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden mt-20">
        <img
          src={heroImgError ? unsplashImages[0] : heroImage}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setHeroImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 text-sm rounded hover:bg-white transition z-10 flex items-center gap-1 shadow-sm"
        >
          <span>←</span>
          <span>Back</span>
        </button>

        <span className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-teal-700 rounded-full shadow-sm">
          Discover · Nearby
        </span>
      </div>

      {/* Hotel Info */}
      <div className="max-w-4xl mx-auto px-6 -mt-20 relative bg-[#FAF8F5] pt-8 pb-16 rounded-t-lg">
        <p className="text-xs tracking-[0.2em] text-amber-600 mb-3 font-medium">
          DISCOVERED NEARBY
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
          {name}
        </h1>

        {rating && (
          <div className="flex items-center gap-2 mb-8">
            <span className="text-amber-500 text-lg">★ {rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">
              ({reviewCount?.toLocaleString()} reviews)
            </span>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 pb-12 border-b border-gray-200">
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
              Address
            </p>
            <p className="text-gray-800">{address}</p>
          </div>

          {phone && (
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
                Phone
              </p>
              <a
                href={`tel:${cleanPhone}`}
                className="text-gray-800 hover:text-teal-700 transition font-medium"
              >
                {phone}
              </a>
            </div>
          )}
        </div>

        {/* About */}
        <div className="mb-12 pb-12 border-b border-gray-200">
          <p className="text-xs tracking-[0.2em] text-gray-500 mb-3">
            ABOUT THIS LISTING
          </p>
          <h2 className="font-serif text-2xl text-gray-900 mb-4">
            Not yet on our platform.
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This hotel was discovered nearby and is not yet listed on Peshawar
            Hotel Finder. We're working to add it soon. In the meantime, use
            the contact options below.
          </p>
        </div>

        {/* Gallery */}
        <div className="mb-12 pb-12 border-b border-gray-200">
          <p className="text-xs tracking-[0.2em] text-gray-500 mb-4">
            MORE PHOTOS
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {galleryIndexes.map((idx, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={unsplashImages[idx]}
                  alt={`${name} ${i + 2}`}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-teal-800 to-teal-600 rounded-2xl p-8 text-white text-center">
          <p className="text-xs tracking-[0.2em] text-teal-100 mb-3 font-medium">
            READY TO BOOK?
          </p>
          <h2 className="font-serif text-3xl mb-4">
            {website ? 'Visit their official website' : 'Get in touch'}
          </h2>
          <p className="text-teal-50 text-sm mb-6 max-w-md mx-auto">
            {website
              ? 'This hotel has an official website. Click below to check availability, prices, and book directly.'
              : 'Contact the hotel directly via phone or WhatsApp.'}
          </p>

          {/* Primary Action — Website or Map */}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-full hover:bg-teal-50 transition text-sm font-medium shadow-lg"
            >
              Visit Official Website
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          )}

          {/* Secondary Actions — WhatsApp + Map */}
          <div className="mt-6 pt-6 border-t border-teal-500/30">
            <p className="text-xs tracking-[0.15em] text-teal-100 mb-4 uppercase">
              Other ways to reach
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {cleanPhone && (
                <button
                  onClick={handleWhatsApp}
                  className="inline-flex items-center gap-2 bg-teal-700/40 hover:bg-teal-700/60 border border-teal-400/40 text-white px-5 py-2.5 rounded-full text-sm font-medium transition backdrop-blur-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                  </svg>
                  Chat on WhatsApp
                </button>
              )}

              <a
                href={mapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-teal-700/40 hover:bg-teal-700/60 border border-teal-400/40 text-white px-5 py-2.5 rounded-full text-sm font-medium transition backdrop-blur-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                View on Map
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleHotelDetail;