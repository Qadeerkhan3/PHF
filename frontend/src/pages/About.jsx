import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const containerRef = useRef(null);

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

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAF8F5] pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        {/* Hero */}
        <p className="fade-up text-xs tracking-[0.2em] text-gray-500 mb-4">
          OUR POINT OF VIEW
        </p>
        <h1 className="fade-up font-serif text-5xl md:text-6xl text-gray-900 mb-8 leading-tight">
          A better welcome<br />starts here.
        </h1>
        <p className="fade-up text-lg text-gray-600 leading-relaxed mb-16">
          We believe finding a place to stay should feel as personal as the
          city you're visiting. Peshawar Hotel Finder brings together the best
          of our city — its generous hospitality, its hidden corners, and the
          people who make every visit memorable.
        </p>

        {/* Image */}
        <div className="fade-up my-16 overflow-hidden rounded">
          <img
            src="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200"
            alt="Peshawar"
            className="w-full h-[400px] object-cover"
          />
        </div>

        {/* Mission */}
        <div className="fade-up grid grid-cols-1 md:grid-cols-2 gap-12 my-16">
          <div>
            <p className="text-xs tracking-[0.2em] text-gray-500 mb-3">
              OUR MISSION
            </p>
            <h2 className="font-serif text-3xl text-gray-900 mb-4">
              Transparent. Local. Honest.
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We're building a more transparent way to travel, one that puts
              local hotels and curious travelers in touch. No middlemen. No
              hidden fees. Just direct connections with the people who know
              Peshawar best.
            </p>
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] text-gray-500 mb-3">
              WHY PESHAWAR
            </p>
            <h2 className="font-serif text-3xl text-gray-900 mb-4">
              The city of hospitality.
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Peshawar has welcomed travelers for centuries. From the bustling
              bazaars of Qissa Khwani to the quiet courtyards of its historic
              hotels, our city has a warmth that's hard to find elsewhere. We
              want to make sure every visitor feels it.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="fade-up border-t border-gray-200 pt-16 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-serif text-5xl text-teal-700 mb-2">24+</p>
              <p className="text-sm text-gray-500">Hotels listed</p>
            </div>
            <div>
              <p className="font-serif text-5xl text-teal-700 mb-2">1,200+</p>
              <p className="text-sm text-gray-500">Leads generated</p>
            </div>
            <div>
              <p className="font-serif text-5xl text-teal-700 mb-2">100%</p>
              <p className="text-sm text-gray-500">Free to use</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="fade-up mt-24 text-center border-t border-gray-200 pt-16">
          <p className="text-xs tracking-[0.2em] text-gray-500 mb-3">
            FOR HOTEL OWNERS
          </p>
          <h2 className="font-serif text-4xl text-gray-900 mb-6">
            Have a place worth sharing?
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto mb-8">
            Put your hotel in front of travelers who are ready to discover
            Peshawar. Listing is free, and our team is here to help.
          </p>
          <a
            href="https://wa.me/923351092493?text=Assalam%20o%20Alaikum%2C%20mujhe%20apna%20hotel%20Peshawar%20Hotel%20Finder%20par%20list%20karwana%20hai."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-gray-300 hover:bg-gray-50 text-gray-900 px-8 py-3 rounded text-sm transition"
          >
            List your hotel on WhatsApp
          </a>
          <p className="text-xs text-gray-400 mt-4">
            Ya email karein: qadeeru89@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;