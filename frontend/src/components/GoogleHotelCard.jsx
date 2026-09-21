import React from 'react';
import { Link } from 'react-router-dom';

const GoogleHotelCard = ({ place }) => {
  const name = place.displayName?.text || 'Unknown Hotel';
  const address = place.formattedAddress || 'Address not available';
  const rating = place.rating;
  const reviewCount = place.userRatingCount;
  const phone = place.internationalPhoneNumber;
  const photoName = place.photos?.[0]?.name;

  const photoUrl = photoName
    ? `http://localhost:5000/api/hotels/photo-proxy?name=${encodeURIComponent(photoName)}`
    : null;

  return (
    <Link
      to={`/google-hotel/${place.id}`}
      state={{ place }}
      className="group block bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-teal-50 to-amber-50">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0F766E"
              strokeWidth="1"
              opacity="0.3"
            >
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
            </svg>
          </div>
        )}

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
        <h3 className="font-serif text-2xl text-gray-900 mb-2 line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{address}</p>

        {phone && <p className="text-xs text-gray-400 mb-3">📞 {phone}</p>}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {reviewCount ? `${reviewCount} reviews` : 'On Google Maps'}
          </span>
          <span className="text-xs text-teal-700 group-hover:underline flex items-center gap-1">
            View details
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GoogleHotelCard;