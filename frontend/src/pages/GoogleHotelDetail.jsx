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
  const address = place.formattedAddress || 'Address not available';
  const rating = place.rating;
  const reviewCount = place.userRatingCount;
  const phone = place.internationalPhoneNumber;
  const website = place.websiteUri;

  // Clean phone for tel: and WhatsApp
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : null;
  const whatsappPhone = cleanPhone
    ? cleanPhone.startsWith('0')
      ? '92' + cleanPhone.substring(1)
      : cleanPhone.startsWith('92')
      ? cleanPhone
      : '92' + cleanPhone
    : null;

  // Google Maps search URL
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${name}, ${address}`
  )}`;

  // ─── Smart CTA Logic ───
  // Priority: Website > Phone > WhatsApp > Google Maps
  let primaryAction = null;

  if (website) {
    primaryAction = {
      target: website,
      label: 'Visit Official Website',
      heading: 'Visit their official website',
      description:
        'This hotel has an official website. Click below to check availability, prices, and book directly.',
      icon: 'globe',
      external: true
    };
  } else if (phone) {
    primaryAction = {
      target: `tel:${cleanPhone}`,
      label: 'Call Hotel',
      heading: 'Call the hotel directly',
      description: `Reach out to ${name} on ${phone} for bookings, availability, and prices.`,
      icon: 'phone',
      external: false
    };
  } else {
    primaryAction = {
      target: googleMapsSearchUrl,
      label: 'View on Google Maps',
      heading: 'Find them on Google Maps',
      description:
        'See photos, reviews, phone number, and directions on Google Maps.',
      icon: 'map',
      external: true
    };
  }

  // ─── Secondary Actions (agar available hain) ───
  const secondaryActions = [];

  if (website && phone) {
    secondaryActions.push({
      target: `tel:${cleanPhone}`,
      label: 'Call Hotel',
      icon: 'phone',
      external: false
    });
  }

  if (phone) {
    secondaryActions.push({
      target: `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        `Assalam o Alaikum, mujhe ${name} ke baare mein maloomat chahiye. Please availability aur prices batayein.`
      )}`,
      label: 'Chat on WhatsApp',
      icon: 'whatsapp',
      external: true
    });
  }

  if (website || phone) {
    secondaryActions.push({
      target: googleMapsSearchUrl,
      label: 'View on Google Maps',
      icon: 'map',
      external: true
    });
  }

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

  // ─── Icon helper ───
  const renderIcon = (iconName) => {
    if (iconName === 'globe') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    }
    if (iconName === 'phone') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    }
    if (iconName === 'whatsapp') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
        </svg>
      );
    }
    if (iconName === 'map') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    }
    return null;
  };

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
                href={`tel:${cleanPhone}`}
                className="text-gray-800 hover:text-teal-700 transition font-medium"
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

        {/* ─── CTA Section — Smart Contact Options ─── */}
        <div className="bg-gradient-to-br from-teal-800 to-teal-600 rounded-2xl p-8 text-white text-center">
          <p className="text-xs tracking-[0.2em] text-teal-100 mb-3 font-medium">
            READY TO BOOK?
          </p>
          <h2 className="font-serif text-3xl mb-4">{primaryAction.heading}</h2>
          <p className="text-teal-50 text-sm mb-6 max-w-md mx-auto">
            {primaryAction.description}
          </p>

          {/* Primary Action Button */}
          <a
            href={primaryAction.target}
            {...(primaryAction.external && {
              target: '_blank',
              rel: 'noopener noreferrer'
            })}
            className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-full hover:bg-teal-50 transition text-sm font-medium shadow-lg"
          >
            {renderIcon(primaryAction.icon)}
            {primaryAction.label}
          </a>

          {/* Secondary Actions */}
          {secondaryActions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-teal-500/30">
              <p className="text-xs tracking-[0.15em] text-teal-100 mb-4 uppercase">
                Other ways to reach
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {secondaryActions.map((action, idx) => (
                  <a
                    key={idx}
                    href={action.target}
                    {...(action.external && {
                      target: '_blank',
                      rel: 'noopener noreferrer'
                    })}
                    className="inline-flex items-center gap-2 bg-teal-700/40 hover:bg-teal-700/60 border border-teal-400/40 text-white px-5 py-2.5 rounded-full text-sm font-medium transition backdrop-blur-sm"
                  >
                    {renderIcon(action.icon)}
                    {action.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Info Message */}
          {!website && !phone && (
            <p className="text-xs text-teal-100 mt-4">
              Contact information not available. Use Google Maps to find
              details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleHotelDetail;