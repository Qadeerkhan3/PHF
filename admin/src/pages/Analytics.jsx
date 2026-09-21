import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getLeads, getHotels } from "../services/api";

const Analytics = () => {
  const [leads, setLeads] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, hotelsRes] = await Promise.all([
          getLeads(),
          getHotels(),
        ]);
        setLeads(leadsRes.data);
        setHotels(hotelsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ─── Compute stats ───

  // Top hotels by leads
  const hotelCounts = {};
  leads.forEach((l) => {
    hotelCounts[l.hotelName] = (hotelCounts[l.hotelName] || 0) + 1;
  });
  const topHotelsData = Object.entries(hotelCounts)
    .map(([name, count]) => ({
      name: name.split(" ")[0],
      fullName: name,
      leads: count,
    }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 10);

  // Leads by room type
  const roomCounts = {};
  leads.forEach((l) => {
    if (l.roomType) {
      roomCounts[l.roomType] = (roomCounts[l.roomType] || 0) + 1;
    }
  });
  const roomTypeData = Object.entries(roomCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Daily trend (last 7 days)
  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const count = leads.filter((l) => {
      const leadDate = new Date(l.createdAt);
      return leadDate >= date && leadDate < nextDay;
    }).length;

    dailyData.push({
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      leads: count,
    });
  }

  // Status breakdown
  const statusCounts = {
    New: leads.filter((l) => l.status === "New").length,
    Contacted: leads.filter((l) => l.status === "Contacted").length,
    Booked: leads.filter((l) => l.status === "Booked").length,
    Lost: leads.filter((l) => l.status === "Lost").length,
  };

  // Conversion rate
  const conversionRate =
    leads.length > 0
      ? ((statusCounts.Booked / leads.length) * 100).toFixed(1)
      : 0;

  // Colors
  const PIE_COLORS = ["#0F766E", "#D97706", "#B85C38", "#6B7280", "#3B82F6"];

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        {" "}
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Insights from your hotel network
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center text-2xl">
            📊
          </div>
          <p className="text-gray-700 font-medium mb-2">No data yet</p>
          <p className="text-sm text-gray-400">
            Analytics will appear once users start clicking WhatsApp on hotel
            pages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Insights from your hotel network
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatMiniCard label="New" value={statusCounts.New} color="blue" />
        <StatMiniCard
          label="Contacted"
          value={statusCounts.Contacted}
          color="yellow"
        />
        <StatMiniCard
          label="Booked"
          value={statusCounts.Booked}
          color="green"
        />
        <StatMiniCard
          label="Conversion"
          value={`${conversionRate}%`}
          color="teal"
        />
      </div>

      {/* Row 1: Daily trend (full width) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Daily leads trend
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Lead activity over the last 7 days
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
            <p className="text-xs text-gray-500">total leads</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="day"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#6B7280" }}
            />
            <Line
              type="monotone"
              dataKey="leads"
              stroke="#0F766E"
              strokeWidth={2.5}
              dot={{ fill: "#0F766E", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Row 2: Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top hotels */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">
              Top hotels by leads
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Your best performing properties
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topHotelsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                type="number"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="leads" fill="#0F766E" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by room type */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">
              Leads by room type
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Distribution across your network
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={roomTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {roomTypeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", color: "#6B7280" }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Top performing table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Top performing hotels
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ranked by number of leads
          </p>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hotel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leads
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Share
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topHotelsData.map((hotel, index) => {
              const maxLeads = topHotelsData[0]?.leads || 1;
              const percent = ((hotel.leads / leads.length) * 100).toFixed(1);
              const barWidth = (hotel.leads / maxLeads) * 100;
              return (
                <tr key={hotel.fullName} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {hotel.fullName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {hotel.leads}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {percent}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-100 rounded-full h-2 max-w-xs">
                      <div
                        className="bg-teal-700 h-2 rounded-full transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatMiniCard = ({ label, value, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700",
    yellow: "bg-yellow-50 text-yellow-700",
    green: "bg-green-50 text-green-700",
    teal: "bg-teal-50 text-teal-700",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
        {label}
      </p>
      <p
        className={`text-3xl font-bold inline-block px-3 py-1 rounded-lg ${
          colorMap[color]
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default Analytics;
