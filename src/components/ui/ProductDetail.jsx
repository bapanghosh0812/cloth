import { useState } from 'react';
import Modal, { CloseButton } from './Modal';
import Viewer360 from './Viewer360';
import Reviews, { Stars } from './Reviews';
import { useStore } from '../../context/StoreContext';
import { formatPrice, getGallery, getRelated } from '../../data/products';

const SIZE_GUIDES = {
  apparel: {
    head: ['Size', 'Chest (cm)', 'Waist (cm)', 'Hip (cm)'],
    rows: [['XS', '84–88', '70–74', '86–90'], ['S', '89–94', '75–80', '91–96'], ['M', '95–100', '81–86', '97–102'], ['L', '101–106', '87–92', '103–108'], ['XL', '107–112', '93–98', '109–114']],
  },
  kids: {
    head: ['Size', 'Height (cm)', 'Chest (cm)', 'Age'],
    rows: [['2Y', '86–92', '52–54', '1.5–2'], ['4Y', '98–104', '55–57', '3–4'], ['6Y', '110–116', '58–61', '5–6'], ['8Y', '122–128', '62–65', '7–8']],
  },
  footwear: {
    head: ['US', 'UK', 'EU', 'Foot (cm)'],
    rows: [['7', '6', '40', '25.0'], ['8', '7', '41', '26.0'], ['9', '8', '42.5', '27.0'], ['10', '9', '44', '28.0'], ['11', '10', '45', '29.0'], ['12', '11', '46', '30.0']],
  },
};
const guideFor = (p) => (p.category === 'Footwear' ? SIZE_GUIDES.footwear : p.category === 'Kids' ? SIZE_GUIDES.kids : SIZE_GUIDES.apparel);

// One framed view of the product photo. Desktop: hover to magnify under the cursor.
const ViewImage = ({ view, alt, cutout, interactive = false, className = '' }) => {
  const [lens, setLens] = useState(null);
  const onMove = (e) => {
    if (!interactive || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setLens({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  const zoom = lens ? Math.max(view.zoom * 1.9, 2.2) : view.zoom;
  const origin = lens ? `${lens.x}% ${lens.y}%` : view.focus;

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={() => setLens(null)}
      className={`relative w-full h-full overflow-hidden ${interactive ? 'md:cursor-zoom-in' : ''} ${cutout ? 'bg-[radial-gradient(circle_at_50%_38%,#faf7f1,#d8d0c2)]' : 'bg-[#141414]'} ${className}`}
    >
      <img
        src={view.src}
        alt={alt}
        draggable={false}
        decoding="async"
        className={`w-full h-full ${view.fit === 'contain' || cutout ? 'object-contain' : 'object-cover'} transition-transform duration-300 ease-out`}
        style={{ objectPosition: view.focus, transform: `scale(${zoom})`, transformOrigin: origin }}
      />
    </div>
  );
};

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-white text-sm font-semibold uppercase tracking-[0.15em]">{title}</span>
        <span className={`text-[#c6a15b] text-xl leading-none transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div className={`grid transition-all duration-500 ease-out ${open ? 'grid-rows-[1fr] opacity-100 pb-4' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden text-white/55 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

const Perk = ({ icon, title, text }) => (
  <div className="flex gap-3">
    <span className="w-9 h-9 shrink-0 rounded-full border border-[#c6a15b]/35 text-[#c6a15b] flex items-center justify-center">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
    </span>
    <div>
      <p className="text-white text-sm font-semibold">{title}</p>
      <p className="text-white/45 text-xs mt-0.5">{text}</p>
    </div>
  </div>
);

const deliveryDate = () =>
  new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

const ProductDialog = ({ product: p }) => {
  const { closeModal, addToCart, toggleWishlist, isWished, openQuickView, requireAuth, userReviews } = useStore();
  const gallery = getGallery(p);
  const related = getRelated(p);

  const [tab, setTab] = useState('photos'); // 'photos' | '360'
  const [active, setActive] = useState(0);
  const [size, setSize] = useState(p.sizes?.[0] || null);
  const [color, setColor] = useState(p.colors?.[0]?.name || null);
  const [qty, setQty] = useState(1);
  const [showGuide, setShowGuide] = useState(false);

  const wished = isWished(p.id);
  const reviewCount = p.reviews + (userReviews[p.id]?.length || 0);
  const guide = guideFor(p);

  const go = (dir) => setActive((i) => (i + dir + gallery.length) % gallery.length);
  const buyNow = () => {
    addToCart(p, { size, color, qty });
    requireAuth('checkout');
  };

  return (
    <Modal open onClose={closeModal} maxWidth="max-w-6xl" label={p.name}>
      <CloseButton onClose={closeModal} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        {/* ---------- Gallery ---------- */}
        <div className="p-3 sm:p-5 lg:p-6 lg:border-r border-white/10">
          <div className="relative aspect-[4/5] max-h-[62vh] lg:max-h-none w-full rounded-2xl overflow-hidden border border-white/10">
            {tab === 'photos' ? (
              <ViewImage key={active} view={gallery[active]} alt={`${p.name} — ${gallery[active].label}`} cutout={p.cutout} interactive className="ws-fade" />
            ) : (
              <div className={`w-full h-full ${p.cutout ? 'bg-[radial-gradient(circle_at_50%_38%,#faf7f1,#cfc6b6)]' : 'bg-[#101010]'}`}>
                <Viewer360 image={p.image} frames={p.spin} alt={p.name} cutout={p.cutout} />
              </div>
            )}

            {/* View switch */}
            <div className="absolute top-3 left-3 flex p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
              {[['photos', `Photos · ${gallery.length}`], ['360', '360° View']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest transition-colors ${tab === key ? 'bg-[#c6a15b] text-black' : 'text-white/70 hover:text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'photos' && (
              <>
                <button onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:border-[#c6a15b] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <button onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:border-[#c6a15b] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
                <span className="absolute bottom-3 left-3 text-[11px] uppercase tracking-[0.2em] text-white bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  {active + 1} / {gallery.length} · {gallery[active].label}
                </span>
                <span className="hidden md:block absolute bottom-3 right-3 text-[11px] uppercase tracking-[0.2em] text-white/70 bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  Hover to zoom
                </span>
              </>
            )}
          </div>

          {/* Thumbnails: 6 photo views + 360 */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-3">
            {gallery.map((v, i) => (
              <button
                key={v.label}
                onClick={() => { setTab('photos'); setActive(i); }}
                aria-label={v.label}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${tab === 'photos' && active === i ? 'border-[#c6a15b]' : 'border-transparent opacity-55 hover:opacity-100'}`}
              >
                <ViewImage view={v} alt="" cutout={p.cutout} />
              </button>
            ))}
            <button
              onClick={() => setTab('360')}
              aria-label="360 degree view"
              className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center bg-gradient-to-br from-[#1c1812] to-[#0c0c0c] transition-all ${tab === '360' ? 'border-[#c6a15b]' : 'border-white/10 hover:border-white/30'}`}
            >
              <span className="text-[#c6a15b] text-[11px] sm:text-sm font-bold leading-none">360°</span>
              <svg className="text-[#c6a15b]/80 mt-1 hidden sm:block" width="18" height="10" viewBox="0 0 36 20" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="18" cy="10" rx="16" ry="6" /><path d="m26 3 4 1-2 3" /></svg>
            </button>
          </div>
        </div>

        {/* ---------- Details ---------- */}
        <div className="p-5 sm:p-7 lg:p-9 flex flex-col">
          <p className="text-[#c6a15b] text-[11px] font-semibold uppercase tracking-[0.3em]">{p.brand}</p>
          <h2 className="font-display text-3xl md:text-4xl text-white mt-2 leading-tight pr-10">{p.name}</h2>

          <button
            onClick={() => document.getElementById(`reviews-${p.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="flex items-center gap-3 mt-3 w-max group"
          >
            <Stars rating={p.rating} size={15} />
            <span className="text-white/45 text-sm group-hover:text-white transition-colors underline-offset-4 group-hover:underline">
              {p.rating} · {reviewCount} reviews
            </span>
          </button>

          <div className="flex items-center gap-3 mt-5">
            <span className="text-3xl font-bold text-white">{formatPrice(p.price)}</span>
            {p.oldPrice && (
              <>
                <span className="text-white/30 line-through text-lg">{formatPrice(p.oldPrice)}</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-black bg-[#c6a15b] px-2.5 py-1 rounded-full">
                  Save {formatPrice(p.oldPrice - p.price)}
                </span>
              </>
            )}
          </div>
          <p className="text-white/35 text-xs mt-1">Taxes and duties included</p>

          <p className="text-white/60 text-[15px] leading-relaxed mt-5">{p.description}</p>

          {/* Colour */}
          <div className="mt-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-3">Colour · <span className="text-white">{color}</span></p>
            <div className="flex gap-3">
              {p.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  aria-label={c.name}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${color === c.name ? 'border-[#c6a15b] ring-4 ring-[#c6a15b]/15 scale-110' : 'border-white/20 hover:border-white/50'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Size · <span className="text-white">{size}</span></p>
              <button onClick={() => setShowGuide(!showGuide)} className="text-[#c6a15b] text-xs underline underline-offset-4 hover:text-[#e2c78e]">
                {showGuide ? 'Hide size guide' : 'Size guide'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-12 px-3 h-12 rounded-xl border text-sm font-semibold transition-colors ${size === s ? 'bg-[#c6a15b] text-black border-[#c6a15b]' : 'border-white/15 text-white/75 hover:border-white/45'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {showGuide && (
              <div className="ws-pop mt-4 overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/5 text-white/60 uppercase tracking-widest">
                    <tr>{guide.head.map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {guide.rows.map((row) => (
                      <tr key={row[0]} className={`border-t border-white/5 ${row[0] === size ? 'text-[#c6a15b]' : 'text-white/60'}`}>
                        {row.map((cell, i) => <td key={i} className="px-3 py-2">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-7">
            <div className="flex items-center border border-white/15 rounded-xl">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity" className="w-10 h-13 text-white/70 hover:text-white text-lg">−</button>
              <span className="w-7 text-center text-white">{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label="Increase quantity" className="w-10 h-13 text-white/70 hover:text-white text-lg">+</button>
            </div>
            <button
              onClick={() => { addToCart(p, { size, color, qty }); closeModal(); }}
              className="btn-sheen flex-1 h-13 bg-[#c6a15b] text-black font-bold uppercase tracking-[0.15em] text-sm rounded-xl hover:bg-[#d8b877] transition-colors"
            >
              Add to Bag
            </button>
            <button
              onClick={() => toggleWishlist(p)}
              aria-label="Wishlist"
              className={`w-13 h-13 shrink-0 rounded-xl border flex items-center justify-center transition-colors ${wished ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'border-white/15 text-white/60 hover:text-white'}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
            </button>
          </div>
          <button
            onClick={buyNow}
            className="mt-3 h-13 rounded-xl border border-white/20 text-white font-semibold uppercase tracking-[0.15em] text-sm hover:bg-white hover:text-black transition-colors"
          >
            Buy it now
          </button>

          {/* Promise */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <Perk title="Complimentary express" text={`Arrives by ${deliveryDate()}`} icon={<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />} />
            <Perk title="30-day returns" text="Free collection from your door" icon={<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8m0-5v5h5" />} />
            <Perk title="Authenticity guaranteed" text="Certificate in every box" icon={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />} />
            <Perk title="Signature packaging" text="Gift-ready, hand-wrapped" icon={<><rect x="3" y="8" width="18" height="13" rx="1" /><path d="M12 8v13M3 12h18M12 8S10 3 7.5 4 9 8 12 8zm0 0s2-5 4.5-4S15 8 12 8z" /></>} />
          </div>

          {/* Details */}
          <div className="mt-6">
            <Accordion title="Details & composition" defaultOpen>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                {p.details.map((d) => (
                  <li key={d} className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[#c6a15b]" /> {d}</li>
                ))}
              </ul>
            </Accordion>
            <Accordion title="Care">
              Follow the care label inside. Store on a wide hanger or in the dust bag provided, away from direct sunlight.
              Our atelier offers complimentary repairs within the first year.
            </Accordion>
            <Accordion title="Delivery & returns">
              Complimentary express delivery on orders over $500, otherwise $25. Every order is insured and tracked end-to-end.
              Returns are free within 30 days — book a collection from <em>My Orders</em>.
            </Accordion>
          </div>
        </div>
      </div>

      <Reviews product={p} />

      {/* Related */}
      <section className="px-5 sm:px-8 md:px-10 pb-10 md:pb-12 pt-2">
        <p className="text-[#c6a15b] text-[11px] font-semibold uppercase tracking-[0.3em] mb-2">Complete the look</p>
        <h3 className="font-display text-2xl sm:text-3xl text-white mb-6">You may also like</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {related.map((r) => (
            <button key={r.id} onClick={() => openQuickView(r)} className="group text-left">
              <div className={`aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 ${r.cutout ? 'bg-[radial-gradient(circle_at_50%_38%,#faf7f1,#d8d0c2)]' : 'bg-[#141414]'}`}>
                <img src={r.image} alt={r.name} loading="lazy" decoding="async" className={`w-full h-full ${r.cutout ? 'object-contain p-3' : 'object-cover'} group-hover:scale-105 transition-transform duration-700`} />
              </div>
              <p className="text-white/40 text-[11px] uppercase tracking-widest mt-3">{r.brand}</p>
              <p className="text-white text-sm font-semibold mt-0.5 group-hover:text-[#c6a15b] transition-colors">{r.name}</p>
              <p className="text-white/70 text-sm mt-0.5">{formatPrice(r.price)}</p>
            </button>
          ))}
        </div>
      </section>
    </Modal>
  );
};

// Keyed by product: switching products (e.g. from "You may also like") starts fresh at the top.
const ProductDetail = () => {
  const { activeModal, quickViewProduct } = useStore();
  if (activeModal !== 'quickview' || !quickViewProduct) return null;
  return <ProductDialog key={quickViewProduct.id} product={quickViewProduct} />;
};

export default ProductDetail;
