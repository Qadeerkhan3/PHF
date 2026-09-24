import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GoogleHotelDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [heroImgError, setHeroImgError] = useState(false);

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
  const address = place.formattedAddress || 'Peshawar';
  const rating = place.rating;
  const reviewCount = place.userRatingCount;
  const phone = place.internationalPhoneNumber;

  // ─── Website / Map logic ───
  const website = place.websiteUri;

  // Google Maps search URL (fallback)
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${name}, ${address}`
  )}`;

  // Priority: website > Google Maps
  const bookTarget = website || googleMapsSearchUrl;
  const bookLabel = website ? 'Visit Official Website' : 'View on Map';
  const bookHeading = website
    ? 'Visit their official website'
    : 'View on Map';
  const bookDescription = website
    ? 'This hotel has an official website. Click below to check availability, prices, and book directly.'
    : 'Get directions, view location, and more details on Google Maps.';

  // ─── Unsplash fallback images ───
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
          Discover · OpenStreetMap
        </span>
      </div>

      {/* Hotel Info */}
      <div className="max-w-4xl mx-auto px-6 -mt-20 relative bg-[#FAF8F5] pt-8 pb-16 rounded-t-lg">
        <p className="text-xs tracking-[0.2em] text-amber-600 mb-3 font-medium">
          DISCOVERED ON OPENSTREETMAP
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
          {name}
        </h1>

        {rating && (
          <div className="flex items-center gap-2 mb-8">
            <span className="text-amber-500 text-lg">
              ★ {rating.toFixed(1)}
            </span>
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
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                className="text-gray-800 hover:text-teal-700 transition"
              >
                {phone}
              </a>
            </div>
          )}

          {website && (
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
                Website
              </p>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 hover:text-teal-800 transition break-all"
              >
                {website}
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
            This hotel was discovered via OpenStreetMap and is not yet listed
            on Peshawar Hotel Finder. We're working to add it soon. In the
            meantime, click below to view more details.
          </p>
        </div>

        {/* Gallery */}
        <div className="mb-12 pb-12 border-b border-gray-200">
          <p className="text-xs tracking-[0.2em] text-gray-500 mb-4">
            MORE PHOTOS
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {galleryIndexes.map((idx, i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden rounded-lg"
              >
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

        {/* CTA — Website ya Map */}
        <div className="bg-gradient-to-br from-teal-800 to-teal-600 rounded-2xl p-8 text-white text-center">
          <p className="text-xs tracking-[0.2em] text-teal-100 mb-3 font-medium">
            READY TO BOOK?
          </p>
          <h2 className="font-serif text-3xl mb-4">{bookHeading}</h2>
          <p className="text-teal-50 text-sm mb-6 max-w-md mx-auto">
            {bookDescription}
          </p>
          <a
            href={bookTarget}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-full hover:bg-teal-50 transition text-sm font-medium shadow-lg"
          >
            {bookLabel}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </a>

          {!website && (
            <p className="text-xs text-teal-100 mt-4">
              Official website not available. Google Maps par details dekhein.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleHotelDetail;