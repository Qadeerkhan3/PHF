import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isDetailPage =
    location.pathname.startsWith('/hotel/') ||
    location.pathname.startsWith('/google-hotel/');
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  const links = [
    { name: 'Stays', path: '/' },
    { name: 'Search', path: '/search' },
    { name: 'About', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' }
  ];

  // solid = scrolled, detail page, mobile open, ya non-home page
  const solid = scrolled || isDetailPage || mobileOpen || !isHomePage;

  const textColor = solid ? 'text-gray-700' : 'text-white/90';
  const textActive = solid ? 'text-teal-700' : 'text-teal-300';
  const textHover = solid ? 'hover:text-teal-700' : 'hover:text-white';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          solid
            ? 'bg-[#FAF8F5]/95 backdrop-blur-md border-b border-gray-200'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 md:py-5 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className={`font-serif text-lg md:text-xl transition-colors ${
              solid
                ? 'text-gray-900 hover:text-teal-700'
                : 'text-white hover:text-teal-300'
            }`}
            onClick={() => setMobileOpen(false)}
          >
            Peshawar Hotel Finder
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs tracking-[0.15em] uppercase transition-colors ${
                  location.pathname === link.path
                    ? textActive
                    : `${textColor} ${textHover}`
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 -mr-2 z-[60] relative transition-colors ${
              solid ? 'text-gray-900' : 'text-white'
            }`}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={`block h-0.5 w-6 transition-all duration-300 ${
                  solid ? 'bg-gray-900' : 'bg-white'
                } ${mobileOpen ? 'rotate-45 translate-y-[9px]' : ''}`}
              />
              <span
                className={`block h-0.5 w-6 transition-all duration-300 ${
                  solid ? 'bg-gray-900' : 'bg-white'
                } ${mobileOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`block h-0.5 w-6 transition-all duration-300 ${
                  solid ? 'bg-gray-900' : 'bg-white'
                } ${mobileOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile menu panel — slide from right */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-[#FAF8F5] z-50 md:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ═══════════════════════════════════════ */}
        {/* HEADER — PHF brand (Menu ki jagah)     */}
        {/* ═══════════════════════════════════════ */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <p className="font-serif text-xl text-gray-900">PHF</p>
            <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-0.5">
              Peshawar Hotel Finder
            </p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-500 hover:text-gray-900 transition p-1"
            aria-label="Close menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <nav className="px-6 py-6 space-y-1">
          {links.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block py-3 text-base transition-all duration-300 ${
                location.pathname === link.path
                  ? 'text-teal-700 font-medium'
                  : 'text-gray-800 hover:text-teal-700'
              } ${
                mobileOpen
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-4'
              }`}
              style={{
                transitionDelay: mobileOpen
                  ? `${index * 50 + 100}ms`
                  : '0ms'
              }}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <a
            href="https://wa.me/923351092493?text=Assalam%20o%20Alaikum%2C%20mujhe%20apna%20hotel%20list%20karwana%20hai."
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-teal-700 hover:bg-teal-800 text-white px-4 py-3 rounded-lg text-sm font-medium transition"
          >
            List your hotel
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;