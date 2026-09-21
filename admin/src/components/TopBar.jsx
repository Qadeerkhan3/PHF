import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const TopBar = () => {
  const location = useLocation();
  const { admin } = useAuth();
  const { toggle } = useSidebar();

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/hotels/add')) return 'Hotels / Add New';
    if (path.startsWith('/hotels/edit')) return 'Hotels / Edit';
    if (path.startsWith('/hotels')) return 'Hotels';
    if (path.startsWith('/leads')) return 'Leads';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Hamburger — sirf mobile par */}
        <button
          onClick={toggle}
          className="md:hidden text-gray-700 hover:text-teal-700 transition p-1 -ml-1"
          aria-label="Toggle sidebar"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <p className="text-sm text-gray-500">{getTitle()}</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600 transition relative">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          <div className="text-right hidden md:block">
            <p className="text-xs font-medium text-gray-900">
              {admin?.email?.split('@')[0] || 'Admin'}
            </p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center text-sm font-medium">
            {admin?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;