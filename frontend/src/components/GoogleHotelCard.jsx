import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GoogleHotelCard = ({ place }) => {
  const [imgError, setImgError] = useState(false);
  const name = place.displayName?.text || 'Unknown Hotel';
  const address = place.formattedAddress || 'Address not available';
  const rating = place.rating;
  const reviewCount = place.userRatingCount;
  const phone = place.internationalPhoneNumber;
  const photoName = place.photos?.[0]?.name;

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const photoUrl = photoName
    ? `${API_BASE}/hotels/photo-proxy?name=${encodeURIComponent(photoName)}`
    : null;

  // Unsplash fallback images
  const unsplashImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80'
  ];

  const getImageIndex = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % unsplashImages.length;
  };

  const imageIndex = getImageIndex(name);
  const displayImage = photoUrl && !imgError ? photoUrl : unsplashImages[imageIndex];

  return (
    <Link
      to={`/google-hotel/${place.id}`}
      state={{ place }}
      className="group block bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-teal-50 to-amber-50">
        <img
          src={displayImage}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={() => setImgError(true)}
        />

        <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-medium text-teal-700 rounded-full shadow-sm">
          Discover
        </span>

        {rating && (
          <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-medium text-amber-600 rounded-full shadow-sm flex items-center gap-1">
            ★ {rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-serif text-2xl text-gray-900 mb-2 line-clamp-1">{name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{address}</p>

        {phone && <p className="text-xs text-gray-400 mb-3">📞 {phone}</p>}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {reviewCount ? `${reviewCount} reviews` : 'On Google Maps'}
          </span>
          <span className="text-xs text-teal-700 group-hover:underline flex items-center gap-1">
            View details
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GoogleHotelCard;