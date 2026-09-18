import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HotelCard from '../components/HotelCard';
import { searchHotels, getNearbyHotels } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const containerRef = useRef(null);
  const resultsRef = useRef(null);

  const popularSearches = [
    'Pearl Continental',
    'Shelton',
    'Hotel Grand',
    'Fort Continental',
    'Serena',
  ];

  // Featured hotels (default Peshawar city center)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await getNearbyHotels(34.0151, 71.5249, 8000);
        setFeatured(res.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  // GSAP — page load
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.search-fade', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const doSearch = async (q) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchHotels(q);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query });
    doSearch(query);
  };

  const handlePopularClick = (term) => {
    setQuery(term);
    setSearchParams({ q: term });
    doSearch(term);
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, []);

  // GSAP — results stagger
  useEffect(() => {
    if (!loading && results.length > 0 && resultsRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.result-item', {
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out'
        });
      }, resultsRef);

      return () => ctx.revert();
    }
  }, [loading, results]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FAF8F5] pt-32 pb-24 relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute top-40 -left-40 w-96 h-96 bg-teal-700/5 rounded-full blur-3xl" />
      <div className="absolute top-80 -right-40 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6">
        {/* HERO */}
        <div className="text-center mb-16">
          <p className="search-fade text-xs tracking-[0.3em] text-teal-700 mb-6 font-medium">
            FIND A STAY
          </p>
          <h1 className="search-fade font-serif text-5xl md:text-6xl text-gray-900 mb-6 leading-tight">
            Search hotels<br />by name.
          </h1>
          <p className="search-fade text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Know the hotel you're looking for? Type its name and we'll find
            it in our Peshawar directory.
          </p>
        </div>

        {/* SEARCH CARD */}
        <div className="search-fade bg-white border border-gray-200 rounded-2xl p-2 shadow-lg mb-8">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="pl-6 text-gray-400">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pearl Continental, Shelton..."
              className="flex-1 bg-transparent outline-none py-5 px-4 text-lg text-gray-900 placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-4 rounded-xl text-sm font-medium transition m-1"
            >
              Search
            </button>
          </form>
        </div>

        {/* POPULAR SEARCHES */}
        <div className="search-fade mb-16 text-center">
          <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-4">
            Popular searches
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => handlePopularClick(term)}
                className="px-4 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-full hover:border-teal-700 hover:text-teal-700 transition"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-56 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-2">
              No hotels found for "{query}"
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Try a different name or check the spelling.
            </p>
            <Link
              to="/"
              className="inline-block text-teal-700 hover:text-teal-800 text-sm font-medium"
            >
              Browse all hotels →
            </Link>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div ref={resultsRef}>
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">
                  {results.length}
                </span>{' '}
                {results.length === 1 ? 'hotel' : 'hotels'} found for "{query}"
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {results.map((hotel) => (
                <div key={hotel._id} className="result-item">
                  <HotelCard hotel={hotel} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEATURED — jab tak search na ho */}
        {!searched && !loadingFeatured && featured.length > 0 && (
          <section className="border-t border-gray-200 pt-16">
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.2em] text-teal-700 mb-3 font-medium">
                OR EXPLORE
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900">
                Featured stays in Peshawar
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 text-sm font-medium transition"
              >
                View all hotels
                <span>→</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Search;