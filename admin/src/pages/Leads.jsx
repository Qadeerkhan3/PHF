import React, { useEffect, useState } from "react";
import { getLeads, updateLeadStatus } from "../services/api";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const fetchLeads = async () => {
    try {
      const res = await getLeads();
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateLeadStatus(id, status);
      setLeads(leads.map((l) => (l._id === id ? { ...l, status } : l)));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const statusColors = {
    New: "bg-blue-50 text-blue-700 border-blue-200",
    Contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Booked: "bg-green-50 text-green-700 border-green-200",
    Lost: "bg-red-50 text-red-700 border-red-200",
  };

  const filteredLeads = leads
    .filter((l) => l.hotelName?.toLowerCase().includes(search.toLowerCase()))
    .filter((l) => {
      if (statusFilter === "All") return true;
      return l.status === statusFilter;
    });

  // Counts
  const counts = {
    All: leads.length,
    New: leads.filter((l) => l.status === "New").length,
    Contacted: leads.filter((l) => l.status === "Contacted").length,
    Booked: leads.filter((l) => l.status === "Booked").length,
    Lost: leads.filter((l) => l.status === "Lost").length,
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = [
      "Date",
      "Hotel",
      "Room Type",
      "Persons",
      "Price",
      "Status",
      "User Lat",
      "User Lng",
    ];
    const rows = filteredLeads.map((l) => [
      new Date(l.createdAt).toISOString(),
      l.hotelName,
      l.roomType,
      l.persons,
      l.priceShown,
      l.status,
      l.userLocation?.lat || "",
      l.userLocation?.lng || "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phf-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8">
      {" "}
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track every inquiry from your hotel network
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredLeads.length === 0}
          className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 inline-flex items-center gap-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV
        </button>
      </div>
      {/* Status filter tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { key: "All", label: "All Leads", color: "text-gray-900" },
          { key: "New", label: "New", color: "text-blue-600" },
          { key: "Contacted", label: "Contacted", color: "text-yellow-600" },
          { key: "Booked", label: "Booked", color: "text-green-600" },
          { key: "Lost", label: "Lost", color: "text-red-600" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`text-left p-4 rounded-xl border transition ${
              statusFilter === tab.key
                ? "bg-teal-700 border-teal-700 text-white shadow-md"
                : "bg-white border-gray-200 hover:border-teal-300"
            }`}
          >
            <p
              className={`text-xs uppercase tracking-wider mb-1 ${
                statusFilter === tab.key ? "text-teal-100" : "text-gray-500"
              }`}
            >
              {tab.label}
            </p>
            <p
              className={`text-2xl font-bold ${
                statusFilter === tab.key ? "text-white" : tab.color
              }`}
            >
              {counts[tab.key]}
            </p>
          </button>
        ))}
      </div>
      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search by hotel name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
          />
        </div>

        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center text-2xl">
              💬
            </div>
            <p className="text-gray-700 font-medium mb-2">No leads found</p>
            <p className="text-sm text-gray-400">
              {search || statusFilter !== "All"
                ? "Try changing the filter or search term."
                : "Leads will appear when users click WhatsApp on hotel pages."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => (
                  <React.Fragment key={lead._id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <div>
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(lead.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-medium shrink-0">
                            {lead.hotelName?.charAt(0) || "H"}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {lead.hotelName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {lead.roomType || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {lead.persons} {lead.persons === 1 ? "adult" : "adults"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        PKR {lead.priceShown?.toLocaleString() || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChange(lead._id, e.target.value)
                          }
                          className={`text-xs px-2.5 py-1.5 rounded-full font-medium border cursor-pointer outline-none ${
                            statusColors[lead.status] || statusColors.New
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Booked">Booked</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            setExpanded(expanded === lead._id ? null : lead._id)
                          }
                          className="text-teal-700 hover:text-teal-800 text-sm font-medium"
                        >
                          {expanded === lead._id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>

                    {expanded === lead._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <div>
                              <p className="text-xs uppercase text-gray-500 mb-1">
                                Lead ID
                              </p>
                              <p className="text-gray-700 font-mono text-xs">
                                {lead._id}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase text-gray-500 mb-1">
                                User Location
                              </p>
                              <p className="text-gray-700">
                                {lead.userLocation?.lat
                                  ? `${lead.userLocation.lat.toFixed(
                                      4,
                                    )}, ${lead.userLocation.lng.toFixed(4)}`
                                  : "Not available"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase text-gray-500 mb-1">
                                Full Timestamp
                              </p>
                              <p className="text-gray-700">
                                {new Date(lead.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;
