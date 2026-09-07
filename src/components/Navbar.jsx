import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

const IconBtn = ({ onClick, label, children, badge, textColor }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`relative ${textColor} hover:text-[#c6a15b] transition-colors`}
  >
    {children}
    {badge > 0 && (
      <span className="absolute -top-2 -right-2 bg-[#c6a15b] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const { cartCount, wishlist, user, openModal } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY && y > 80) setIsVisible(false);
      else if (y < lastScrollY) setIsVisible(true);
      setScrolled(y > window.innerHeight * 0.85);
      setLastScrollY(y);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Over the light hero frames text is black; once scrolled onto dark sections it goes light.
  const textColor = scrolled ? 'text-white' : 'text-black';
  const navBg = scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent';

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'collection', label: 'Collection' },
    { id: 'shop', label: 'Shop' },
    { id: 'faq', label: "FAQ's" },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-8 left-0 w-full z-50 py-4 px-6 md:px-8 lg:px-12 flex justify-between items-center transition-all duration-300 ${navBg} ${
          isVisible ? 'translate-y-0' : '-translate-y-[200%]'
        }`}
      >
        {/* Logo */}
        <div
          onClick={() => scrollToSection('home')}
          className={`font-display text-2xl md:text-[1.7rem] tracking-[0.15em] uppercase cursor-pointer ${textColor}`}
        >
          WEAR<span className="text-[#c6a15b]">SUPER</span>
        </div>

        {/* Center links */}
        <ul className="hidden lg:flex items-center gap-9 text-[14px] font-medium">
          {links.map((l) => (
            <li
              key={l.id}
              onClick={() => scrollToSection(l.id)}
              className={`${textColor} hover:text-[#c6a15b] transition-colors cursor-pointer tracking-wide`}
            >
              {l.label}
            </li>
          ))}
        </ul>

        {/* Right icons */}
        <div className="flex items-center gap-5 md:gap-6">
          <IconBtn onClick={() => openModal('search')} label="Search" textColor={textColor}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </IconBtn>

          <IconBtn onClick={() => openModal('wishlist')} label="Wishlist" badge={wishlist.length} textColor={textColor}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
          </IconBtn>

          <IconBtn onClick={() => openModal('cart')} label="Cart" badge={cartCount} textColor={textColor}>
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
          </IconBtn>

          {user ? (
            <button
              onClick={() => openModal('orders')}
              className="hidden md:flex items-center gap-2 bg-[#c6a15b] text-black px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#d8b877] transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center text-xs font-bold uppercase">
                {user.name.charAt(0)}
              </span>
              {user.name.split(' ')[0]}
            </button>
          ) : (
            <button
              onClick={() => openModal('auth')}
              className="hidden md:flex items-center gap-2 bg-[#c6a15b] text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#d8b877] transition-colors"
            >
              Sign In
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" className={`lg:hidden ${textColor}`}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={menuOpen ? 'M18 6 6 18M6 6l12 12' : 'M3 12h18M3 6h18M3 18h18'} /></svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollToSection(l.id)}
              className="text-white font-display text-3xl hover:text-[#c6a15b] transition-colors"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => { setMenuOpen(false); openModal(user ? 'orders' : 'auth'); }}
            className="mt-4 bg-[#c6a15b] text-black px-8 py-3 rounded-full font-semibold uppercase tracking-widest text-sm"
          >
            {user ? `Account · ${user.name.split(' ')[0]}` : 'Sign In'}
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
