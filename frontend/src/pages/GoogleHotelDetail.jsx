import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GoogleHotelDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    // Data location.state se aaya
    if (location.state?.place) {
      setPlace(location.state.place);
    } else {
      // Direct URL access — wapas home
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
  const website = place.websiteUri;
  const mapsUri =
    place.googleMapsUri ||
    `https://www.google.com/maps/place/?q=place_id:${place.id}`;
  const photos = place.photos || [];

  // Book Now target: website agar hai, warna Google Maps
  const bookTarget = website || mapsUri;
  const bookLabel = website ? 'Visit Official Website' : 'View on Google Maps';

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden mt-20">
        {photos[0] ? (
          <img
            src={`http://localhost:5000/api/hotels/photo-proxy?name=${encodeURIComponent(
              photos[0].name
            )}`}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-900 to-teal-700 flex items-center justify-center">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            >
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 text-sm rounded hover:bg-white transition z-10 flex items-center gap-1"
        >
          <span>←</span>
          <span>Back</span>
        </button>

        {/* "Discover" badge */}
        <span className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-teal-700 rounded-full shadow-sm">
          Discover · Google Maps
        </span>
      </div>

      {/* Hotel Info */}
      <div className="max-w-4xl mx-auto px-6 -mt-20 relative bg-[#FAF8F5] pt-8 pb-16 rounded-t-lg">
        <p className="text-xs tracking-[0.2em] text-amber-600 mb-3 font-medium">
          DISCOVERED ON GOOGLE
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
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                className="text-gray-800 hover:text-teal-700 transition"
              >
                {phone}
              </a>
            </div>
          )}
        </div>

        {/* About this listing */}
        <div className="mb-12 pb-12 border-b border-gray-200">
          <p className="text-xs tracking-[0.2em] text-gray-500 mb-3">
            ABOUT THIS LISTING
          </p>
          <h2 className="font-serif text-2xl text-gray-900 mb-4">
            Not yet on our platform.
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This hotel was discovered via Google Maps and is not yet listed on
            Peshawar Hotel Finder. We're working to add it soon. In the
            meantime, click below to view more details, photos, and reviews on
            Google.
          </p>
        </div>

        {/* Photos gallery */}
        {photos.length > 1 && (
          <div className="mb-12 pb-12 border-b border-gray-200">
            <p className="text-xs tracking-[0.2em] text-gray-500 mb-4">
              MORE PHOTOS
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.slice(1, 4).map((photo, idx) => (
                <div
                  key={idx}
                  className="aspect-square overflow-hidden rounded-lg"
                >
                  <img
                    src={`http://localhost:5000/api/hotels/photo-proxy?name=${encodeURIComponent(
                      photo.name
                    )}`}
                    alt={`${name} ${idx + 2}`}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book Now CTA */}
        <div className="bg-gradient-to-br from-teal-800 to-teal-600 rounded-2xl p-8 text-white text-center">
          <p className="text-xs tracking-[0.2em] text-teal-100 mb-3 font-medium">
            READY TO BOOK?
          </p>
          <h2 className="font-serif text-3xl mb-4">
            {website ? 'Visit their official website' : 'View on Google Maps'}
          </h2>
          <p className="text-teal-50 text-sm mb-6 max-w-md mx-auto">
            {website
              ? 'This hotel has an official website. Click below to check availability, prices, and book directly.'
              : 'Get directions, call, view photos, and read reviews on Google Maps.'}
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
              Official website not available on Google for this hotel.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleHotelDetail;