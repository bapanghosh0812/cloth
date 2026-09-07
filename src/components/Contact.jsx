import React from 'react';
import img1 from '../assets/shop/image.png';
import img2 from '../assets/shop/image copy.png';
import img3 from '../assets/shop/image copy 2.png';
import img4 from '../assets/shop/image copy 3.png';
import img5 from '../assets/shop/image copy 4.png';
import img6 from '../assets/shop/image copy 5.png';

const Contact = () => {
  const images = [img1, img2, img3, img4, img5, img6];
  
  // We duplicate the array multiple times so that when it translates by -50%, it seamlessly loops
  const marqueeImages = [...images, ...images, ...images, ...images, ...images, ...images];

  return (
    <section className="relative w-screen min-h-screen bg-white overflow-hidden flex items-center justify-center py-24">
      
      {/* Inline styles for infinite scrolling marquee */}
      <style>
        {`
          @keyframes marqueeLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marqueeRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee-left {
            animation: marqueeLeft 60s linear infinite;
            width: max-content;
          }
          .animate-marquee-right {
            animation: marqueeRight 60s linear infinite;
            width: max-content;
          }
        `}
      </style>

      {/* Marquee Background (4 Rows moving opposite directions) */}
      <div className="absolute inset-0 z-0 flex flex-col justify-center gap-6 opacity-30 pointer-events-none scale-110">
        
        {/* Row 1 - Left */}
        <div className="flex gap-6 animate-marquee-left">
          {marqueeImages.map((src, i) => (
            <img key={`r1-${i}`} src={src} alt="bg" className="w-[300px] h-[220px] object-cover rounded-2xl shrink-0 shadow-lg" />
          ))}
        </div>
        
        {/* Row 2 - Right */}
        <div className="flex gap-6 animate-marquee-right">
          {marqueeImages.map((src, i) => (
            <img key={`r2-${i}`} src={src} alt="bg" className="w-[300px] h-[220px] object-cover rounded-2xl shrink-0 shadow-lg" />
          ))}
        </div>
        
        {/* Row 3 - Left */}
        <div className="flex gap-6 animate-marquee-left">
          {marqueeImages.map((src, i) => (
            <img key={`r3-${i}`} src={src} alt="bg" className="w-[300px] h-[220px] object-cover rounded-2xl shrink-0 shadow-lg" />
          ))}
        </div>

        {/* Row 4 - Right */}
        <div className="flex gap-6 animate-marquee-right">
          {marqueeImages.map((src, i) => (
            <img key={`r4-${i}`} src={src} alt="bg" className="w-[300px] h-[220px] object-cover rounded-2xl shrink-0 shadow-lg" />
          ))}
        </div>
      </div>

      {/* Transparent Glassmorphism Contact Form (Light Mode) */}
      <div className="relative z-10 w-full max-w-lg px-8">
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-10 shadow-2xl flex flex-col items-center">
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-2 uppercase text-center">
            Let's Connect
          </h2>
          <p className="text-gray-600 mb-10 text-center text-sm md:text-base font-medium">
            Have a question or collaboration idea? Drop us a line.
          </p>

          <form className="w-full flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-black text-sm font-bold tracking-wide ml-2 uppercase">Name</label>
              <input 
                type="text" 
                id="name"
                placeholder="John Doe" 
                className="w-full bg-white/80 border border-gray-200 text-black rounded-full px-6 py-4 outline-none focus:border-gray-400 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-black text-sm font-bold tracking-wide ml-2 uppercase">Email</label>
              <input 
                type="email" 
                id="email"
                placeholder="john@example.com" 
                className="w-full bg-white/80 border border-gray-200 text-black rounded-full px-6 py-4 outline-none focus:border-gray-400 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-black text-sm font-bold tracking-wide ml-2 uppercase">Message</label>
              <textarea 
                id="message"
                rows="4"
                placeholder="How can we help you?" 
                className="w-full bg-white/80 border border-gray-200 text-black rounded-3xl px-6 py-4 outline-none focus:border-gray-400 focus:bg-white transition-all resize-none placeholder:text-gray-400 shadow-sm"
              ></textarea>
            </div>

            <button 
              type="button" 
              className="mt-4 w-full bg-black text-white font-bold uppercase tracking-widest py-4 rounded-full hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex justify-center items-center gap-3"
            >
              Send Message
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>

        </div>
      </div>
    </section>
  );
};

export default Contact;
