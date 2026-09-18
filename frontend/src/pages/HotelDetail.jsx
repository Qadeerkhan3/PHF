import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHotel, saveLead } from '../services/api';

// WhatsApp number formatter — 0333... ko 92333... mein convert karta hai
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

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await getHotel(id);
        setHotel(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  const handleWhatsApp = async (room) => {
    try {
      await saveLead({
        hotelId: hotel._id,
        hotelName: hotel.name,
        roomType: room.name,
        persons: room.persons,
        priceShown: room.price,
        userLocation: { lat: 34.0151, lng: 71.5249 }
      });
    } catch (err) {
      console.error('Lead save failed:', err);
    }

    const message = `Assalam o Alaikum,\n\nMujhe ${hotel.name} mein ${room.persons} person ka ${room.name} chahiye.\nPrice: PKR ${room.price}\n\nPlease confirm availability.`;

    const whatsappNumber = formatWhatsApp(hotel.whatsapp);
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const handleGeneralInquiry = () => {
    const message = `Assalam o Alaikum,\n\nMujhe ${hotel.name} ke baare mein maloomat chahiye. Please room types aur prices batayein.`;
    const whatsappNumber = formatWhatsApp(hotel.whatsapp);
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <p className="text-gray-500">Hotel not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">

      {/* Hero Image Section */}
      <div className="relative h-[500px] overflow-hidden mt-20">
        <img
          src={
            hotel.image ||
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600'
          }
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 text-sm rounded hover:bg-white transition z-10 flex items-center gap-1"
        >
          <span>←</span>
          <span>Back</span>
        </button>
      </div>

      {/* Hotel Info */}
      <div className="max-w-4xl mx-auto px-6 -mt-20 relative bg-[#FAF8F5] pt-8 pb-16 rounded-t-lg">
        <p className="text-xs tracking-[0.2em] text-gray-500 mb-3">
          {hotel.coupleFriendly ? 'COUPLE FRIENDLY' : 'STANDARD STAY'}
        </p>
        <h1 className="font-serif text-5xl text-gray-900 mb-6">{hotel.name}</h1>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 pb-12 border-b border-gray-200">
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
              Address
            </p>
            <p className="text-gray-800">{hotel.address}</p>
          </div>
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
              Phone
            </p>
            <p className="text-gray-800">{hotel.phone}</p>
          </div>
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
              Couple Status
            </p>
            <p
              className={
                hotel.coupleFriendly ? 'text-green-700' : 'text-red-700'
              }
            >
              {hotel.coupleFriendly
                ? '✓ Couple Allowed'
                : '✗ Couple Not Allowed'}
            </p>
          </div>
        </div>

        {/* Rooms Section */}
        <p className="text-xs tracking-[0.2em] text-gray-500 mb-3">
          AVAILABLE ROOMS
        </p>
        <h2 className="font-serif text-3xl text-gray-900 mb-8">
          Choose your room.
        </h2>

        <div className="space-y-6">
          {hotel.roomTypes &&
            hotel.roomTypes.map((room, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h3 className="font-serif text-2xl text-gray-900 mb-2">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {room.persons}{' '}
                    {room.persons === 1 ? 'person' : 'persons'} · {room.available}{' '}
                    {room.available === 1 ? 'room' : 'rooms'} available
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">From</p>
                    <p className="text-2xl font-medium text-teal-700">
                      PKR {room.price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleWhatsApp(room)}
                    className="bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded text-sm font-medium flex items-center gap-2 transition"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    Book on WhatsApp
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* General Inquiry */}
        <div className="mt-12 pt-12 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Room pasand nahi aaya? Hotel se direct baat karein.
          </p>
          <button
            onClick={handleGeneralInquiry}
            className="border border-gray-300 hover:bg-gray-50 text-gray-900 px-8 py-3 rounded text-sm transition"
          >
            General Inquiry on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;