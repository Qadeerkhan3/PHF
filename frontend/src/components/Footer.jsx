import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <h3 className="font-serif text-xl text-gray-900 mb-3">
            Peshawar Hotel Finder
          </h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Made for Peshawar, by people who know it.
          </p>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><Link to="/" className="hover:text-teal-700">Stays</Link></li>
            <li><Link to="/about" className="hover:text-teal-700">About</Link></li>
            <li><Link to="/gallery" className="hover:text-teal-700">Gallery</Link></li>
            <li><Link to="/contact" className="hover:text-teal-700">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-4">Connect</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><a href="#" className="hover:text-teal-700">Instagram</a></li>
            <li><a href="#" className="hover:text-teal-700">WhatsApp</a></li>
            <li><a href="#" className="hover:text-teal-700">Email</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between text-xs text-gray-500">
          <span>© 2026 Peshawar Hotel Finder</span>
          <span>Privacy · Terms</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;