import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAnalytics, getLeads } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalLeads: 0,
    leadsToday: 0,
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [topHotel, setTopHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, leadsRes] = await Promise.all([
          getAnalytics(),
          getLeads(),
        ]);
        setStats(analyticsRes.data);
        const leads = leadsRes.data;
        setRecentLeads(leads.slice(0, 5));

        const countMap = {};
        leads.forEach((lead) => {
          countMap[lead.hotelName] = (countMap[lead.hotelName] || 0) + 1;
        });
        const top = Object.entries(countMap).sort((a, b) => b[1] - a[1])[0];
        if (top) setTopHotel({ name: top[0], leads: top[1] });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusColors = {
    New: "bg-blue-50 text-blue-700",
    Contacted: "bg-yellow-50 text-yellow-700",
    Booked: "bg-green-50 text-green-700",
    Lost: "bg-red-50 text-red-700",
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {" "}
      <div className="mb-8">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getGreeting()}, Admin
        </h1>
        <p className="text-sm text-gray-500">
          Here's what's happening with your hotel network today.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total hotels"
          value={stats.totalHotels}
          trend="+12%"
          trendLabel="vs. last month"
          icon="🏨"
        />
        <StatCard
          label="Total leads"
          value={stats.totalLeads}
          trend="+8.4%"
          trendLabel="vs. last month"
          icon="💬"
        />
        <StatCard
          label="Leads today"
          value={stats.leadsToday}
          trend="+3.2%"
          trendLabel="vs. yesterday"
          icon="📅"
        />
        <StatCard
          label="Top hotel"
          value={topHotel ? topHotel.name.split(" ")[0] : "—"}
          subtitle={topHotel?.name || "No data"}
          trend={topHotel ? `${topHotel.leads} leads` : ""}
          trendLabel="performing best"
          icon="⭐"
        />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent leads
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Latest inquiries from potential guests
            </p>
          </div>
          <Link
            to="/leads"
            className="text-sm text-teal-700 hover:text-teal-800 font-medium"
          >
            View all →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-2">No leads yet.</p>
            <p className="text-sm text-gray-400">
              Leads will appear when users click WhatsApp on hotel pages.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentLeads.map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-medium">
                        {lead.hotelName?.charAt(0) || "H"}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {lead.hotelName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {lead.roomType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {lead.persons} adults
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        statusColors[lead.status] || statusColors.New
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, subtitle, trend, trendLabel, icon }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-start justify-between mb-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <span className="text-xl">{icon}</span>
    </div>
    <div className="flex items-baseline gap-2 mb-2">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
    </div>
    {trend && (
      <p className="text-xs">
        <span className="text-teal-600 font-medium">{trend}</span>{" "}
        <span className="text-gray-400">{trendLabel}</span>
      </p>
    )}
  </div>
);

export default Dashboard;
