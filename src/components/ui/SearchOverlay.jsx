import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../context/StoreContext';
import { searchProducts, formatPrice } from '../../data/products';

const SUGGESTIONS = ['Hoodie', 'Tee', 'High-Top', 'Jacket', 'Dress'];

const SearchPanel = () => {
  const { products, closeModal, openQuickView } = useStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeModal();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeModal]);

  const results = useMemo(() => (query ? searchProducts(products, query) : []), [products, query]);

  return createPortal(
    <div className="fixed inset-0 z-[160] flex flex-col">
      <div onClick={closeModal} className="ws-backdrop absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="ws-search relative w-full max-w-3xl mx-auto mt-16 sm:mt-24 px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4 border-b-2 border-[#c6a15b] pb-3 sm:pb-4">
          <svg className="text-[#c6a15b] shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, brands, categories…"
            className="flex-1 min-w-0 bg-transparent text-white text-xl sm:text-2xl md:text-3xl font-display outline-none placeholder:text-white/25"
          />
          <button
            onClick={closeModal}
            aria-label="Close search"
            className="shrink-0 w-9 h-9 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/40 flex items-center justify-center transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {!query && (
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2">
            <span className="text-white/40 text-xs uppercase tracking-widest mr-1">Trending</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="px-4 py-1.5 rounded-full border border-white/15 text-white/70 text-sm hover:border-[#c6a15b] hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 sm:mt-6 max-h-[60vh] overflow-y-auto overscroll-contain">
          {query && results.length === 0 && (
            <p className="text-white/40 py-10 text-center">No results for “{query}”.</p>
          )}
          {!query && <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Popular picks</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {(query ? results : products.slice(0, 4)).map((p) => (
              <button
                key={p.id}
                onClick={() => openQuickView(p)}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left border border-transparent hover:border-white/10"
              >
                <div className="w-14 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0">
                  <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{p.name}</p>
                  <p className="text-white/40 text-xs">{p.category}</p>
                </div>
                <span className="text-[#c6a15b] font-semibold">{formatPrice(p.price)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Mounted only while open, so each search starts with an empty query.
const SearchOverlay = () => {
  const { activeModal } = useStore();
  return activeModal === 'search' ? <SearchPanel /> : null;
};

export default SearchOverlay;
