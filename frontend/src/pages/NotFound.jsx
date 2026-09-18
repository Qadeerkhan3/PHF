import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const NotFound = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.not-found-404', {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
      gsap.from('.not-found-text', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: 'power2.out'
      });
      gsap.from('.not-found-btn', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.5,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-6"
    >
      <div className="text-center">
        <p className="not-found-404 font-serif text-[120px] md:text-[180px] text-teal-700 leading-none mb-4">
          404
        </p>
        <p className="not-found-text text-xs tracking-[0.2em] text-gray-500 mb-4">
          PAGE NOT FOUND
        </p>
        <h1 className="not-found-text font-serif text-3xl text-gray-900 mb-4">
          This page has checked out.
        </h1>
        <p className="not-found-text text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist, or it may have been moved.
        </p>
        <Link
          to="/"
          className="not-found-btn inline-block bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded text-sm transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;