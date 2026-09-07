import { useState } from 'react';
import { useStore } from '../context/StoreContext';

const Footer = () => {
  const { toast, openModal } = useStore();
  const [email, setEmail] = useState('');

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const subscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast('Enter a valid email', 'error');
      return;
    }
    toast('Subscribed — enjoy 10% off your first order');
    setEmail('');
  };

  return (
    <footer className="w-full bg-black text-white pt-24 pb-8 px-8 md:px-16 lg:px-32 border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-2 text-[#c6a15b]">Explore</h3>
          {['home', 'collection', 'shop'].map((id) => (
            <button key={id} onClick={() => scrollTo(id)} className="text-gray-400 hover:text-white transition-colors cursor-pointer w-max font-medium capitalize text-left">
              {id}
            </button>
          ))}
          <button onClick={() => openModal('wishlist')} className="text-gray-400 hover:text-white transition-colors w-max font-medium text-left">Wishlist</button>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-2 text-[#c6a15b]">Help</h3>
          <button onClick={() => scrollTo('faq')} className="text-gray-400 hover:text-white transition-colors w-max font-medium text-left">FAQ's</button>
          <button onClick={() => scrollTo('contact')} className="text-gray-400 hover:text-white transition-colors w-max font-medium text-left">Contact Us</button>
          <button onClick={() => openModal('orders')} className="text-gray-400 hover:text-white transition-colors w-max font-medium text-left">Track Orders</button>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-2 text-[#c6a15b]">Join the Club</h3>
          <p className="text-gray-400 text-sm mb-2 font-medium">Subscribe for exclusive drops, early access, and 10% off your first order.</p>
          <form onSubmit={subscribe} className="flex items-center w-full border-b border-gray-600 pb-2 focus-within:border-[#c6a15b] transition-colors">
            <input
              type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600 text-sm font-medium"
            />
            <button type="submit" className="text-[#c6a15b] hover:text-white transition-colors uppercase text-sm font-bold tracking-wider whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="w-full flex justify-center items-center mt-20 mb-8 select-none">
        <h1 className="font-display text-[13vw] tracking-tighter uppercase leading-none text-center bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent">
          WEARSUPER
        </h1>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10">
        <p className="text-gray-500 text-xs font-medium tracking-wider uppercase">
          &copy; 2026 WEARSUPER. All Rights Reserved.
        </p>
        <div className="flex items-center gap-6">
          {['fb', 'ig', 'tw'].map((s, i) => (
            <a key={s} href="#" onClick={(e) => e.preventDefault()} className="text-gray-500 hover:text-[#c6a15b] transition-colors">
              {i === 0 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>}
              {i === 1 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>}
              {i === 2 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
