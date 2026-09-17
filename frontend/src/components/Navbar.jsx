import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Stays', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-gray-200' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl text-gray-900">
          Peshawar Hotel Finder
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs tracking-[0.15em] uppercase transition-colors ${
                location.pathname === link.path
                  ? 'text-teal-700'
                  : 'text-gray-700 hover:text-teal-700'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <button className="md:hidden text-gray-900">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;