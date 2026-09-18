import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import { searchHotels } from '../services/api';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await searchHotels(query);
      setResults(res.data);
      setSearchParams({ q: query });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      (async () => {
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
      })();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-xs tracking-[0.2em] text-gray-500 mb-4">
          FIND A STAY
        </p>
        <h1 className="font-serif text-5xl text-gray-900 mb-12">
          Search hotels by name.
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="flex border-b-2 border-gray-300 focus-within:border-teal-700 transition">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Pearl Continental, Shelton..."
              className="flex-1 bg-transparent outline-none py-4 text-lg text-gray-900 placeholder-gray-400"
            />
            <button
              type="submit"
              className="px-6 text-teal-700 font-medium hover:text-teal-800 transition"
            >
              Search →
            </button>
          </div>
        </form>

        {/* Results */}
        {loading && <p className="text-gray-500">Searching...</p>}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">No hotels found.</p>
            <p className="text-sm text-gray-400">
              Try a different name or check the spelling.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {results.length} {results.length === 1 ? 'hotel' : 'hotels'} found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {results.map(hotel => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Search;