import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Gallery = () => {
  const [filter, setFilter] = useState('All');
  const containerRef = useRef(null);

  const images = [
    { id: 1, src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', category: 'Luxury', alt: 'Pearl Continental' },
    { id: 2, src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', category: 'Luxury', alt: 'Hotel Grand' },
    { id: 3, src: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', category: 'Budget', alt: 'Shelton House' },
    { id: 4, src: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', category: 'Family', alt: 'Fort Continental' },
    { id: 5, src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', category: 'Luxury', alt: 'Serena Hotel' },
    { id: 6, src: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', category: 'Budget', alt: 'Regency Hotel' },
    { id: 7, src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', category: 'Family', alt: 'Nishat Hotel' },
    { id: 8, src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', category: 'Luxury', alt: 'Ramada' },
    { id: 9, src: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', category: 'Budget', alt: 'Green Hotel' },
  ];

  const categories = ['All', 'Luxury', 'Budget', 'Family'];

  const filteredImages =
    filter === 'All' ? images : images.filter((img) => img.category === filter);

  // GSAP — page load + filter change par animate
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.fade-up', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
      });

      gsap.from('.gallery-item', {
        y: 40,
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, [filter]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FAF8F5] pt-32 pb-24"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Hero */}
        <p className="fade-up text-xs tracking-[0.2em] text-gray-500 mb-4">
          A VISUAL JOURNEY
        </p>
        <h1 className="fade-up font-serif text-5xl md:text-6xl text-gray-900 mb-6">
          Inside Peshawar's finest stays.
        </h1>
        <p className="fade-up text-lg text-gray-600 max-w-2xl mb-12">
          A collection of moments from hotels across the city — from grand
          landmarks to quiet neighborhood stays.
        </p>

        {/* Filter */}
        <div className="fade-up flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 text-sm rounded-full transition ${
                filter === cat
                  ? 'bg-teal-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-teal-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="gallery-item group relative overflow-hidden rounded cursor-pointer aspect-[4/5]"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-xs tracking-[0.15em] uppercase mb-1">
                  {img.category}
                </p>
                <p className="font-serif text-xl">{img.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;