import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-24 right-6 z-50 px-6 py-4 rounded shadow-lg transform transition-all duration-300 ${
        type === 'success'
          ? 'bg-teal-700 text-white'
          : type === 'error'
          ? 'bg-red-600 text-white'
          : 'bg-gray-800 text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm">{message}</span>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;