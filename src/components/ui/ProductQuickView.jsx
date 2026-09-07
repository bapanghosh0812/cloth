import { useState, useEffect } from 'react';
import Modal, { CloseButton } from './Modal';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../data/products';

const Stars = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#c6a15b' : 'none'} stroke="#c6a15b" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const ProductQuickView = () => {
  const { activeModal, closeModal, quickViewProduct, addToCart, toggleWishlist, isWished } = useStore();
  const open = activeModal === 'quickview' && !!quickViewProduct;
  const p = quickViewProduct;

  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (p) {
      setSize(p.sizes?.[0] || null);
      setColor(p.colors?.[0]?.name || null);
      setActiveImg(0);
      setQty(1);
    }
  }, [p]);

  if (!p) return null;
  const wished = isWished(p.id);
  const images = p.images?.length ? p.images : [p.image];

  return (
    <Modal open={open} onClose={closeModal} maxWidth="max-w-3xl" label={p.name}>
      <CloseButton onClose={closeModal} />
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Gallery */}
        <div className="bg-[#141414] p-6 flex flex-col gap-4">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-white/5">
            <img src={images[activeImg]} alt={p.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImg ? 'border-[#c6a15b]' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-7 md:p-8 flex flex-col">
          <p className="text-[#c6a15b] text-[11px] font-semibold uppercase tracking-[0.25em]">{p.brand}</p>
          <h2 className="font-display text-3xl text-white mt-1 leading-tight">{p.name}</h2>

          <div className="flex items-center gap-3 mt-3">
            <Stars rating={p.rating} />
            <span className="text-white/40 text-sm">{p.rating} · {p.reviews} reviews</span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-bold text-white">{formatPrice(p.price)}</span>
            {p.oldPrice && <span className="text-white/30 line-through text-lg">{formatPrice(p.oldPrice)}</span>}
          </div>

          <p className="text-white/50 text-sm leading-relaxed mt-4">{p.description}</p>

          {/* Colors */}
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-2">Colour · {color}</p>
            <div className="flex gap-2.5">
              {p.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  aria-label={c.name}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c.name ? 'border-[#c6a15b] scale-110' : 'border-white/20'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-11 px-3 h-11 rounded-lg border text-sm font-semibold transition-colors ${
                    size === s ? 'bg-[#c6a15b] text-black border-[#c6a15b]' : 'border-white/15 text-white/70 hover:border-white/40'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Qty + actions */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center border border-white/15 rounded-xl">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-12 text-white/70 hover:text-white text-lg">−</button>
              <span className="w-8 text-center text-white">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-12 text-white/70 hover:text-white text-lg">+</button>
            </div>
            <button
              onClick={() => { addToCart(p, { size, color, qty }); closeModal(); }}
              className="flex-1 bg-[#c6a15b] text-black font-bold uppercase tracking-[0.15em] text-sm py-4 rounded-xl hover:bg-[#d8b877] transition-colors"
            >
              Add to Bag
            </button>
            <button
              onClick={() => toggleWishlist(p)}
              aria-label="Wishlist"
              className={`w-14 h-14 shrink-0 rounded-xl border flex items-center justify-center transition-colors ${
                wished ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'border-white/15 text-white/60 hover:text-white'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
            </button>
          </div>

          {/* Details list */}
          <ul className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-y-2 gap-x-4">
            {p.details.map((d) => (
              <li key={d} className="text-white/50 text-xs flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#c6a15b]" /> {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default ProductQuickView;
