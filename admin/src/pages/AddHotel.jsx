import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { addHotel } from "../services/api";

const AddHotel = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    address: "",
    lat: "34.0151",
    lng: "71.5249",
    coupleFriendly: true,
    hasWebsite: false,
    websiteURL: "",
    image: "",
    status: "Active",
  });

  const [rooms, setRooms] = useState([
    { name: "Standard Room", persons: 2, price: 3500, available: 3 },
  ]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleRoomChange = (index, field, value) => {
    const updated = [...rooms];
    updated[index][field] = value;
    setRooms(updated);
  };

  const addRoom = () => {
    setRooms([...rooms, { name: "", persons: 2, price: 0, available: 1 }]);
  };

  const removeRoom = (index) => {
    if (rooms.length === 1) {
      alert("At least one room type required");
      return;
    }
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate
    if (!form.name || !form.phone || !form.whatsapp || !form.address) {
      setError("Please fill all required fields");
      return;
    }

    if (rooms.some((r) => !r.name || !r.price)) {
      setError("All rooms must have a name and price");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        whatsapp: form.whatsapp,
        address: form.address,
        location: {
          type: "Point",
          coordinates: [parseFloat(form.lng), parseFloat(form.lat)],
        },
        coupleFriendly: form.coupleFriendly,
        hasWebsite: form.hasWebsite,
        websiteURL: form.websiteURL,
        image: form.image,
        status: form.status,
        roomTypes: rooms.map((r) => ({
          name: r.name,
          persons: parseInt(r.persons),
          price: parseInt(r.price),
          available: parseInt(r.available),
        })),
      };

      await addHotel(payload);
      navigate("/hotels");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save hotel");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {" "}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/hotels"
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Hotel</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in details to add a hotel to your network
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Main info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">
                Basic Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                    placeholder="e.g., Amin Hotel"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                      placeholder="03338974965"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.whatsapp}
                      onChange={(e) => handleChange("whatsapp", e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                      placeholder="923338974965"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Format: 923338974965 (country code, no +)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                    placeholder="University Road, Peshawar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => handleChange("image", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                Location Coordinates
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Peshawar city center: lat 34.0151, lng 71.5249
              </p>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.lat}
                    onChange={(e) => handleChange("lat", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.lng}
                    onChange={(e) => handleChange("lng", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Room Types */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Room Types <span className="text-red-500">*</span>
                </h2>
                <button
                  type="button"
                  onClick={addRoom}
                  className="text-sm text-teal-700 hover:text-teal-800 font-medium"
                >
                  + Add Room
                </button>
              </div>

              <div className="space-y-4">
                {rooms.map((room, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-medium text-gray-500">
                        Room {index + 1}
                      </span>
                      {rooms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoom(index)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={room.name}
                          onChange={(e) =>
                            handleRoomChange(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                          placeholder="Deluxe Room"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Persons
                        </label>
                        <input
                          type="number"
                          value={room.persons}
                          onChange={(e) =>
                            handleRoomChange(index, "persons", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Price (PKR)
                        </label>
                        <input
                          type="number"
                          value={room.price}
                          onChange={(e) =>
                            handleRoomChange(index, "price", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Available
                        </label>
                        <input
                          type="number"
                          value={room.available}
                          onChange={(e) =>
                            handleRoomChange(index, "available", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Settings (1 col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-base font-semibold text-gray-900 mb-6">
                Settings
              </h2>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Couple Friendly
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Allow couples to book
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleChange("coupleFriendly", !form.coupleFriendly)
                    }
                    className={`relative w-12 h-6 rounded-full transition ${
                      form.coupleFriendly ? "bg-teal-700" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        form.coupleFriendly ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Has Website
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Show "Book Now" button
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange("hasWebsite", !form.hasWebsite)}
                    className={`relative w-12 h-6 rounded-full transition ${
                      form.hasWebsite ? "bg-teal-700" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        form.hasWebsite ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>

                {form.hasWebsite && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={form.websiteURL}
                      onChange={(e) =>
                        handleChange("websiteURL", e.target.value)
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                      placeholder="https://..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Hotel"}
                  </button>
                  <Link
                    to="/hotels"
                    className="block text-center w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddHotel;
