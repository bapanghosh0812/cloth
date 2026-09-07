import { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, CATEGORIES, formatPrice } from '../data/products';

const BADGE_STYLES = {
  'Best Seller': 'bg-[#c6a15b] text-black',
  New: 'bg-white text-black',
  Sale: 'bg-rose-500 text-white',
  Signature: 'bg-black text-[#c6a15b] border border-[#c6a15b]/40',
  Iconic: 'bg-black/70 text-white backdrop-blur-md',
};

const ShopCard = ({ product }) => {
  const { addToCart, openQuickView, toggleWishlist, isWished } = useStore();
  const wished = isWished(product.id);

  return (
    <div className="bg-white rounded-[1.75rem] p-3.5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.25)] w-full group hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] transition-shadow duration-500">
      {/* Image */}
      <div className="relative h-[320px] w-full rounded-[1.3rem] overflow-hidden mb-4 bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          onClick={() => openQuickView(product)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
        />

        {product.badge && (
          <span className={`absolute top-3.5 left-3.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${BADGE_STYLES[product.badge] || 'bg-black text-white'}`}>
            {product.badge}
          </span>
        )}

        <button
          onClick={() => toggleWishlist(product)}
          aria-label="Wishlist"
          className={`absolute top-3.5 right-3.5 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${
            wished ? 'bg-rose-500 text-white' : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
        </button>

        {/* Quick view on hover */}
        <button
          onClick={() => openQuickView(product)}
          className="absolute bottom-3.5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-widest px-5 py-2.5 rounded-full opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap"
        >
          Quick View
        </button>
      </div>

      {/* Content */}
      <div className="px-2">
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-[13px] font-medium uppercase tracking-wide">{product.brand}</p>
          <div className="flex items-center gap-1 text-[13px] text-gray-500">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#c6a15b" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" /></svg>
            {product.rating}
          </div>
        </div>
        <h3
          onClick={() => openQuickView(product)}
          className="text-black text-[20px] font-bold tracking-tight leading-tight mt-0.5 cursor-pointer hover:text-[#a17c2e] transition-colors"
        >
          {product.name}
        </h3>
        <p className="text-gray-400 text-sm mt-1.5 leading-snug line-clamp-2 pr-2">{product.description}</p>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between px-2 mb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-black font-bold text-[19px]">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="text-gray-300 line-through text-sm">{formatPrice(product.oldPrice)}</span>}
        </div>
        <button
          onClick={() => addToCart(product)}
          className="bg-[#0a0a0a] text-white hover:bg-[#c6a15b] hover:text-black transition-colors flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full font-semibold text-sm"
        >
          Add
          <span className="bg-white text-black rounded-full w-7 h-7 flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </span>
        </button>
      </div>
    </div>
  );
};

const Shop = () => {
  const { shopCategory, setShopCategory } = useStore();

  const filtered = useMemo(
    () => (shopCategory === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === shopCategory)),
    [shopCategory]
  );

  return (
    <section className="w-full bg-[#f5f1ea] py-24 px-6 md:px-8">
      <div className="max-w-[1240px] mx-auto">
        <div className="text-center mb-4">
          <p className="text-[#a17c2e] text-[12px] font-semibold uppercase tracking-[0.3em] mb-3">The Boutique</p>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight text-black">Featured Apparel</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            A curated edit of the season's most-wanted pieces — hand-picked, premium, and ready to ship.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 my-12">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setShopCategory(c)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wide transition-colors ${
                shopCategory === c
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {filtered.map((product) => (
            <ShopCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-16">No products in this category yet.</p>
        )}
      </div>
    </section>
  );
};

export default Shop;
