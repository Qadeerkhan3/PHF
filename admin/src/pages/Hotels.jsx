import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHotels, deleteHotel } from "../services/api";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHotels = async () => {
    try {
      const res = await getHotels();
      setHotels(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteHotel(id);
      setHotels(hotels.filter((h) => h._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const filteredHotels = hotels
    .filter((h) => h.name.toLowerCase().includes(search.toLowerCase()))
    .filter((h) => {
      if (filter === "All") return true;
      if (filter === "Couple") return h.coupleFriendly;
      if (filter === "NonCouple") return !h.coupleFriendly;
      if (filter === "Active") return h.status === "Active";
      if (filter === "Inactive") return h.status === "Inactive";
      return true;
    });

  return (
    <div className="p-4 md:p-8">
      {" "}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
          <p className="text-sm text-gray-500 mt-1">
            {hotels.length} {hotels.length === 1 ? "hotel" : "hotels"} in your
            network
          </p>
        </div>
        <Link
          to="/hotels/add"
          className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition inline-flex items-center gap-2"
        >
          <span>+</span> Add New Hotel
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search hotels by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white"
          >
            <option value="All">All Hotels</option>
            <option value="Couple">Couple Friendly</option>
            <option value="NonCouple">Not Couple Friendly</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center text-2xl">
              🏨
            </div>
            <p className="text-gray-700 font-medium mb-2">No hotels found</p>
            <p className="text-sm text-gray-400 mb-6">
              {search
                ? `No results for "${search}"`
                : "Add your first hotel to get started."}
            </p>
            <Link
              to="/hotels/add"
              className="text-teal-700 hover:text-teal-800 text-sm font-medium"
            >
              + Add hotel
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rooms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Couple
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHotels.map((hotel) => (
                  <tr key={hotel._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={hotel.image || "https://via.placeholder.com/40"}
                          alt={hotel.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {hotel.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {hotel.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {hotel.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {hotel.roomTypes?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          hotel.coupleFriendly
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {hotel.coupleFriendly ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          hotel.status === "Active"
                            ? "bg-teal-50 text-teal-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {hotel.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/hotels/edit/${hotel._id}`}
                        className="text-teal-700 hover:text-teal-800 text-sm font-medium mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(hotel)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-[90%] p-8">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
              >
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete hotel?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <strong>{deleteConfirm.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;
