import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Settings = () => {
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [toast, setToast] = useState(null);

  // General
  const [siteName, setSiteName] = useState('Peshawar Hotel Finder');
  const [defaultRadius, setDefaultRadius] = useState(3);
  const [maxRadius, setMaxRadius] = useState(8);

  // WhatsApp
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    `Assalam o Alaikum,\n\nMujhe {hotel_name} mein {persons} person ka {room_type} chahiye.\nPrice: PKR {price}\n\nPlease confirm availability.`
  );

  // Location
  const [cityLat, setCityLat] = useState('34.0151');
  const [cityLng, setCityLng] = useState('71.5249');

  // Account — password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = (section) => {
    showToast(`${section} settings saved (local only)`, 'success');
  };

  // ═══════════════════════════════════════════════════
  // Change Password — WORKING
  // ═══════════════════════════════════════════════════
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All fields are required', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      showToast(
        'Password must include uppercase, lowercase, and number',
        'error'
      );
      return;
    }

    setPasswordLoading(true);

    try {
      await API.put('/admin/change-password', {
        currentPassword,
        newPassword
      });

      showToast('✓ Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || 'Failed to change password';
      showToast(errorMsg, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'location', label: 'Location' },
    { key: 'account', label: 'Account' }
  ];

  // Template preview
  const previewMessage = whatsappTemplate
    .replace('{hotel_name}', 'Pearl Continental')
    .replace('{persons}', '2')
    .replace('{room_type}', 'Deluxe Room')
    .replace('{price}', '18,500');

  return (
    <div className="p-4 md:p-8 relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-24 right-4 md:right-8 z-50 px-6 py-3 rounded-lg shadow-lg text-sm font-medium max-w-xs ${
            toast.type === 'success'
              ? 'bg-teal-700 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your admin panel preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8 overflow-x-auto">
        <div className="flex gap-6 md:gap-8 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-teal-700 text-teal-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl">
        {/* GENERAL */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              General Settings
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Basic configuration for your website
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Radius (km)
                  </label>
                  <input
                    type="number"
                    value={defaultRadius}
                    onChange={(e) => setDefaultRadius(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Radius (km)
                  </label>
                  <input
                    type="number"
                    value={maxRadius}
                    onChange={(e) => setMaxRadius(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => handleSave('General')}
                  className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WHATSAPP */}
        {activeTab === 'whatsapp' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              WhatsApp Message Template
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Default message pre-filled when user clicks "Book on WhatsApp"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <textarea
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm font-mono resize-none"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">Variables:</span>
                  {['{hotel_name}', '{room_type}', '{persons}', '{price}'].map(
                    (v) => (
                      <button
                        key={v}
                        onClick={() =>
                          setWhatsappTemplate(whatsappTemplate + ' ' + v)
                        }
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-mono transition"
                      >
                        {v}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="bg-[#E5DDD5] rounded-lg p-4 min-h-[200px]">
                  <div className="bg-white rounded-lg p-3 shadow-sm max-w-[85%] whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
                    {previewMessage}
                    <div className="text-right text-xs text-gray-400 mt-1">
                      12:34 PM ✓✓
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => handleSave('WhatsApp')}
                className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Save Template
              </button>
            </div>
          </div>
        )}

        {/* LOCATION */}
        {activeTab === 'location' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Default Location
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              City center coordinates — used when user denies location access
            </p>

            <div className="grid grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={cityLat}
                  onChange={(e) => setCityLat(e.target.value)}
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
                  value={cityLng}
                  onChange={(e) => setCityLng(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="inline-flex items-center gap-2 text-gray-700 text-sm">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0F766E"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="font-mono">
                  {cityLat}, {cityLng}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Peshawar city center (default)
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => handleSave('Location')}
                className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Save Location
              </button>
            </div>
          </div>
        )}

        {/* ACCOUNT */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                Account Information
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Your admin credentials
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={admin?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 outline-none text-sm cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Email change requires backend support
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                Change Password
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Update your admin password
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Min 8 chars, uppercase, lowercase, number
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;