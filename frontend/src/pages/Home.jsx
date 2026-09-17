import React, { useEffect, useState } from 'react';
import HotelCard from '../components/HotelCard';
import LocationModal from '../components/LocationModal';
import { getNearbyHotels } from '../services/api';

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(3000);

  const handleLocationSet = (loc) => {
    setLocation(loc);
  };

  useEffect(() => {
    if (!location) return;

    const fetchHotels = async () => {
      setLoading(true);
      try {
        const res = await getNearbyHotels(location.lat, location.lng, radius);
        setHotels(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [location, radius]);

  return (
    <div className="min-h-screen">
      <LocationModal onLocationSet={handleLocationSet} />

      <section className="px-6 pt-40 pb-16 text-center">
        <p className="text-xs tracking-[0.2em] text-gray-500 mb-4">
          THE CITY OF HOSPITALITY
        </p>
        <h1 className="font-serif text-5xl md:text-7xl text-gray-900 mb-6 leading-tight">
          Stay somewhere<br />worth remembering.
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Your trusted guide to Peshawar's finest stays. Compare real prices, discover welcoming spaces, and book directly.
        </p>
      </section>

      {location && (
        <section className="px-6 max-w-3xl mx-auto pb-16 text-center">
          <p className="text-sm text-gray-600 mb-3">
            📍 Your location: {location.label}
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs text-gray-500">Within: {(radius / 1000).toFixed(1)}km</span>
            <input
              type="range"
              min="1000"
              max="8000"
              step="1000"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-64 accent-teal-700"
            />
            <span className="text-xs text-gray-500">8km</span>
          </div>
        </section>
      )}

      <section className="px-6 max-w-6xl mx-auto pb-24">
        <p className="text-xs tracking-[0.2em] text-gray-500 mb-3">A GOOD PLACE TO BEGIN</p>
        <h2 className="font-serif text-4xl text-gray-900 mb-12">
          Stays with a sense of place.
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading hotels...</p>
        ) : hotels.length === 0 ? (
          <p className="text-gray-500">No hotels found in this area.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map(hotel => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;