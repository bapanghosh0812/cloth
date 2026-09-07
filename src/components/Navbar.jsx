import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 py-4 px-6 md:px-8 lg:px-12 flex justify-between items-center bg-transparent transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Logo */}
      <div onClick={() => scrollToSection('home')} className="text-2xl md:text-3xl font-black tracking-widest uppercase cursor-pointer text-black">
        WEARSUPER
      </div>

      {/* Center Links */}
      <ul className="hidden lg:flex items-center gap-10 text-[15px] font-medium">
        <li onClick={() => scrollToSection('home')} className="text-black hover:text-gray-600 transition-colors cursor-pointer">Home</li>
        <li onClick={() => scrollToSection('collection')} className="text-gray-400 hover:text-black transition-colors cursor-pointer">Collection</li>
        <li onClick={() => scrollToSection('shop')} className="text-gray-400 hover:text-black transition-colors cursor-pointer">Shop</li>
        <li onClick={() => scrollToSection('faq')} className="text-gray-400 hover:text-black transition-colors cursor-pointer">FAQ's</li>
        <li onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-black transition-colors cursor-pointer">Contact us</li>
      </ul>

      {/* Right Icons */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <button className="text-black hover:text-gray-600 transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>

        {/* Cart */}
        <button className="relative text-black hover:text-gray-600 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            2
          </span>
        </button>

        {/* Sign In Button */}
        <button className="hidden md:flex bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full items-center gap-2 hover:bg-black transition-colors text-sm font-semibold shadow-md ml-2">
          Sign In
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
