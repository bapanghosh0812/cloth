import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white pt-24 pb-8 px-8 md:px-16 lg:px-32 border-t border-white/10 overflow-hidden">
      
      {/* Top Section - Links & Newsletter */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        
        {/* Links Column */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-2 text-white">Explore</h3>
          <a href="#home" className="text-gray-400 hover:text-white transition-colors cursor-pointer w-max font-medium">Home</a>
          <a href="#collection" className="text-gray-400 hover:text-white transition-colors cursor-pointer w-max font-medium">Collection</a>
          <a href="#shop" className="text-gray-400 hover:text-white transition-colors cursor-pointer w-max font-medium">Shop</a>
        </div>

        {/* Help Column */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-2 text-white">Help</h3>
          <a href="#faq" className="text-gray-400 hover:text-white transition-colors cursor-pointer w-max font-medium">FAQ's</a>
          <a href="#contact" className="text-gray-400 hover:text-white transition-colors cursor-pointer w-max font-medium">Contact Us</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer w-max font-medium">Shipping & Returns</a>
        </div>

        {/* Newsletter Column */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-2 text-white">Join the Club</h3>
          <p className="text-gray-400 text-sm mb-2 font-medium">Subscribe for exclusive drops, early access, and 10% off your first order.</p>
          <div className="flex items-center w-full border-b border-gray-600 pb-2">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600 text-sm font-medium"
            />
            <button className="text-white hover:text-gray-400 transition-colors uppercase text-sm font-bold tracking-wider">
              Subscribe
            </button>
          </div>
        </div>

      </div>

      {/* Massive Brand Text */}
      <div className="w-full flex justify-center items-center mt-20 mb-8 select-none">
        <h1 className="text-[12vw] font-black tracking-tighter uppercase leading-none text-white text-center">
          WEARSUPER
        </h1>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10">
        <p className="text-gray-500 text-xs font-medium tracking-wider uppercase">
          &copy; 2026 WEARSUPER. All Rights Reserved.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
