import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-serif text-[120px] md:text-[180px] text-teal-700 leading-none mb-4">
          404
        </p>
        <p className="text-xs tracking-[0.2em] text-gray-500 mb-4">
          PAGE NOT FOUND
        </p>
        <h1 className="font-serif text-3xl text-gray-900 mb-4">
          This page has checked out.
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist, or it may have been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded text-sm transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;