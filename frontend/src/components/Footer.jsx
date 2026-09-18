import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.footer-col', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const currentYear = new Date().getFullYear();

  const exploreLinks = [
    { name: 'Stays', path: '/' },
    { name: 'Search', path: '/search' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <footer ref={footerRef} className="bg-gray-900 text-white relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 border border-teal-700/10 rounded-full" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 border border-teal-700/10 rounded-full" />

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        {/* Top: Brand + tagline */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand */}
          <div className="footer-col md:col-span-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-teal-500" />
              <h3 className="font-serif text-2xl">
                Peshawar Hotel Finder
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              Your trusted guide to Peshawar's finest stays. Made for Peshawar,
              by people who know it.
            </p>

            {/* Small trust badges */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full">
                ✓ Verified listings
              </span>
              <span className="text-xs px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full">
                ✓ Direct booking
              </span>
              <span className="text-xs px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full">
                ✓ Local insight
              </span>
            </div>
          </div>

          {/* Explore */}
          <div className="footer-col md:col-span-3">
            <h4 className="text-xs tracking-[0.2em] uppercase text-teal-400 mb-6 font-medium">
              Explore
            </h4>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-teal-500 group-hover:w-4 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col md:col-span-4">
            <h4 className="text-xs tracking-[0.2em] uppercase text-teal-400 mb-6 font-medium">
              Get in touch
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:qadeeru89@gmail.com"
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-3"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 6 10 7 10-7" />
                    </svg>
                  </span>
                  qadeeru89@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/923351092493"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-3"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                    </svg>
                  </span>
                  +92 335 1092493
                </a>
              </li>
              <li>
                <div className="text-sm text-gray-400 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  Peshawar, Khyber Pakhtunkhwa
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © {currentYear} Peshawar Hotel Finder. Made with ❤️ for Peshawar.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <Link to="/about" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="/about" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;