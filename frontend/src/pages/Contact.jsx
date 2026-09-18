import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [toast, setToast] = useState(null);
  const containerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.fade-up').forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `Assalam o Alaikum,%0A%0AName: ${form.name}%0AEmail: ${form.email}%0A%0AMessage: ${form.message}`;
    window.open(`https://wa.me/923351092493?text=${message}`, '_blank');
    showToast('WhatsApp khul raha hai... Message bhejein.', 'success');
    setForm({ name: '', email: '', message: '' });
  };

  const handleWhatsApp = () => {
    if (!form.name && !form.message) {
      showToast('Pehle form bharein.', 'error');
      return;
    }
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FAF8F5] pt-32 pb-24 relative"
    >
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-teal-700 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6">
        <p className="fade-up text-xs tracking-[0.2em] text-gray-500 mb-4">
          GET IN TOUCH
        </p>
        <h1 className="fade-up font-serif text-5xl md:text-6xl text-gray-900 mb-6">
          Let's talk.
        </h1>
        <p className="fade-up text-lg text-gray-600 max-w-xl mb-16">
          Hotel owner? Traveler with a question? We'd love to hear from you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Form */}
          <div className="fade-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full bg-transparent border-b border-gray-300 focus:border-teal-700 outline-none py-3 text-gray-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full bg-transparent border-b border-gray-300 focus:border-teal-700 outline-none py-3 text-gray-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                  rows="4"
                  className="w-full bg-transparent border-b border-gray-300 focus:border-teal-700 outline-none py-3 text-gray-900 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded text-sm transition-colors"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-900 px-6 py-3 rounded text-sm transition-colors"
                >
                  WhatsApp
                </button>
              </div>
            </form>
          </div>

          {/* Contact Info */}
          <div className="fade-up space-y-8">
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
                Email
              </p>
              <a
                href="mailto:qadeeru89@gmail.com"
                className="text-gray-800 hover:text-teal-700 transition"
              >
                qadeeru89@gmail.com
              </a>
            </div>

            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
                WhatsApp
              </p>
              <a
                href="https://wa.me/923351092493"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-teal-700 transition"
              >
                +92 335 1092493
              </a>
            </div>

            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
                Location
              </p>
              <p className="text-gray-800">
                Peshawar, Khyber Pakhtunkhwa
                <br />
                Pakistan
              </p>
            </div>

            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
                Hotel Owners
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Want to list your hotel? Send us a message with your hotel name
                and contact details. Listing is free.
              </p>
              <a
                href="https://wa.me/923351092493?text=Assalam%20o%20Alaikum%2C%20mujhe%20apna%20hotel%20list%20karwana%20hai."
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 hover:text-teal-800 text-sm font-medium transition"
              >
                Message on WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;