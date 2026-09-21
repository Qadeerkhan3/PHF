import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import HotelDetail from "./pages/HotelDetail";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import GoogleHotelDetail from "./pages/GoogleHotelDetail";

gsap.registerPlugin(ScrollTrigger);

// Page transition wrapper
const PageWrapper = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Page fade-in
    gsap.fromTo(
      ".page-content",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
    );

    // ScrollTrigger refresh
    setTimeout(() => ScrollTrigger.refresh(), 100);
  }, [location.pathname]);

  return <div className="page-content">{children}</div>;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <PageWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotel/:id" element={<HotelDetail />} />
          <Route path="/google-hotel/:id" element={<GoogleHotelDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageWrapper>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
