import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useImageSequence } from '../hooks/useImageSequence';

import { useStore } from '../context/StoreContext';
import { getById, formatPrice } from '../data/products';

gsap.registerPlugin(ScrollTrigger);
// Mobile browsers fire `resize` whenever the URL bar shows/hides — don't re-layout the pinned hero for that.
ScrollTrigger.config({ ignoreMobileResize: true });

// The scroll timeline is authored in 240 "virtual" frames; the lighter mobile set is mapped onto it.
const TIMELINE_FRAMES = 240;
const MAX_DPR = 2;

// Hero cards are backed by real catalog products so Add-to-Bag / Wishlist actually work.
const products = [
  { ...getById('p1'), frame: 76, align: 'left' },
  { ...getById('p2'), frame: 153, align: 'right' },
  { ...getById('p3'), frame: 239, align: 'left' },
];

// Studio-backdrop colour sampled from a frame's top corners (cached per image).
const backdropCache = new WeakMap();
let sampler = null;
const backdropOf = (img) => {
  if (backdropCache.has(img)) return backdropCache.get(img);
  sampler = sampler || document.createElement('canvas');
  sampler.width = 2;
  sampler.height = 1;
  const sctx = sampler.getContext('2d', { willReadFrequently: true });
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const sw = Math.max(1, Math.round(w * 0.06));
  const sh = Math.max(1, Math.round(h * 0.04));
  sctx.drawImage(img, 0, 0, sw, sh, 0, 0, 1, 1);
  sctx.drawImage(img, w - sw, 0, sw, sh, 1, 0, 1, 1);
  const d = sctx.getImageData(0, 0, 2, 1).data;
  const rgb = `${(d[0] + d[4]) >> 1}, ${(d[1] + d[5]) >> 1}, ${(d[2] + d[6]) >> 1}`;
  const colour = { solid: `rgb(${rgb})`, clear: `rgba(${rgb}, 0)` };
  backdropCache.set(img, colour);
  return colour;
};

// Landscape: cover the viewport. Portrait: anchor the frame to the bottom and keep the
// top free for the headline (filled with the backdrop colour when painting); as the user
// scrolls on (`grow` 0 → 1) the frame expands to fill most of the screen.
const computeLayout = (cw, ch, iw, ih, grow = 0) => {
  if (cw >= ch) {
    const scale = Math.max(cw / iw, ch / ih);
    const nw = Math.round(iw * scale);
    const nh = Math.round(ih * scale);
    return { portrait: false, cw, ch, nw, nh, x: Math.round((cw - nw) / 2), y: Math.round((ch - nh) / 2) };
  }
  const headlineH = Math.max(ch * 0.42, Math.min(ch * 0.56, ch - 380));
  const targetH = headlineH + (ch * 0.8 - headlineH) * grow;
  const scale = Math.max(cw / iw, targetH / ih);
  const nw = Math.round(iw * scale);
  const nh = Math.round(ih * scale);
  return { portrait: true, cw, ch, nw, nh, x: Math.round((cw - nw) / 2), y: ch - nh };
};

const paint = (ctx, img, L) => {
  if (!L.portrait) {
    ctx.drawImage(img, L.x, L.y, L.nw, L.nh);
    return;
  }
  const bg = backdropOf(img);
  ctx.fillStyle = bg.solid;
  ctx.fillRect(0, 0, L.cw, L.ch);
  ctx.drawImage(img, L.x, L.y, L.nw, L.nh);
  // Dissolve the frame's top edge into the backdrop so a cropped subject never shows a hard cut.
  const fadeH = Math.ceil(L.nh * 0.3);
  const fade = ctx.createLinearGradient(0, L.y, 0, L.y + fadeH);
  fade.addColorStop(0, bg.solid);
  fade.addColorStop(0.35, bg.solid.replace('rgb(', 'rgba(').replace(')', ', 0.6)'));
  fade.addColorStop(1, bg.clear);
  ctx.fillStyle = fade;
  ctx.fillRect(0, L.y, L.cw, fadeH);
};

const ProductCard = React.memo(React.forwardRef(({ product }, ref) => {
  const { addToCart, toggleWishlist, isWished, openQuickView } = useStore();
  const isFavorite = isWished(product.id);

  // Centred on phones, alternating left/right from `sm` up.
  const alignClass = product.align === 'right'
    ? 'max-sm:left-1/2 max-sm:-translate-x-1/2 sm:right-8 md:right-16 lg:right-32'
    : 'max-sm:left-1/2 max-sm:-translate-x-1/2 sm:left-8 md:left-16 lg:left-32';

  return (
    <div
      ref={ref}
      // will-change-transform and transform-gpu (translateZ(0)) added for hardware acceleration
      className={`absolute ${alignClass} top-1/2 -translate-y-1/2 z-20 w-[min(280px,calc(100vw_-_2.5rem))] md:w-[320px] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col bg-[#242424] will-change-transform transform-gpu`}
      style={{ visibility: 'hidden' }}
    >
      {/* Top Half - White Background */}
      <div className="bg-[#f0f0f0] relative flex flex-col justify-center items-center">
        {/* Heart Icon */}
        <button
          onClick={() => toggleWishlist(product)}
          aria-label="Wishlist"
          className={`absolute top-4 right-4 z-10 p-2.5 rounded-full cursor-pointer transition-colors shadow-sm ${isFavorite ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-[#242424] text-white hover:bg-black'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          decoding="async"
          onClick={() => openQuickView(product)}
          className="w-full h-48 sm:h-56 md:h-64 object-contain p-2 cursor-pointer"
        />
      </div>

      {/* Bottom Half - Dark Background */}
      <div className="p-5 sm:p-6 flex flex-col gap-3 sm:gap-4 text-white">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{product.name}</h3>
          <p className="text-[#c6a15b] text-sm mt-1">{product.brand}</p>
        </div>

        <div className="flex justify-between items-center mt-1 sm:mt-2">
          <span className="text-2xl sm:text-[28px] font-bold tracking-tight">{formatPrice(product.price)}</span>
          <button
            onClick={() => addToCart(product)}
            aria-label="Add to bag"
            className="p-3.5 rounded-[1.25rem] transition-colors shadow-md bg-[#c6a15b] text-black hover:bg-[#d8b877]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}));

const Hero = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const cardRefs = useRef([]);
  const textOverlayRef = useRef(null);
  const leftTextRef = useRef(null);
  const rightTextRef = useRef(null);
  const spidermanTextRef = useRef(null);
  const preloaderRef = useRef(null);
  const earsuperTextRef = useRef(null);
  const loadingBarRef = useRef(null);
  const dropTweenRef = useRef(null);

  const ctxRef = useRef(null); // 2D context
  const sizeRef = useRef({ cw: 0, ch: 0 }); // canvas size in CSS px
  const growRef = useRef(0); // portrait only: 0 = headline layout, 1 = frame fills the screen
  const drawnKeyRef = useRef(''); // frame + layout currently on the canvas
  const topSetRef = useRef(false); // --hero-top published for this canvas size
  const targetRef = useRef(0); // frame index the scroll position asks for
  const drawnRef = useRef(-1); // frame index currently on the canvas
  const drawRef = useRef(() => {});

  const { progress, ready, frameCount, getFrame } = useImageSequence((index) => {
    // A frame closer to where the user is than the one on screen just arrived → repaint.
    const target = targetRef.current;
    if (Math.abs(index - target) < Math.abs(drawnRef.current - target)) drawRef.current();
  });

  const draw = useCallback(() => {
    const ctx = ctxRef.current;
    const found = getFrame(targetRef.current);
    if (!ctx || !found) return;
    const key = `${found.index}|${growRef.current.toFixed(3)}`;
    if (key === drawnKeyRef.current) return;

    const { cw, ch } = sizeRef.current;
    const { naturalWidth: iw, naturalHeight: ih } = found.img;
    if (!topSetRef.current) {
      // Lets the portrait headline sit exactly in the free space above the frame.
      containerRef.current?.style.setProperty('--hero-top', `${computeLayout(cw, ch, iw, ih, 0).y}px`);
      topSetRef.current = true;
    }
    paint(ctx, found.img, computeLayout(cw, ch, iw, ih, growRef.current));
    drawnRef.current = found.index;
    drawnKeyRef.current = key;
  }, [getFrame]);

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return false;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (cw === sizeRef.current.cw && ch === sizeRef.current.ch) return false;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;

    ctxRef.current = ctx;
    sizeRef.current = { cw, ch };
    topSetRef.current = false;
    drawnKeyRef.current = '';
    drawnRef.current = -1;
    return true;
  }, []);

  // Mount: lock scroll, start the logo animation straight away (it overlaps loading), size the canvas.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const failsafe = setTimeout(() => {
      document.body.style.overflow = '';
    }, 9000);

    dropTweenRef.current = gsap.fromTo(
      earsuperTextRef.current,
      { yPercent: -150, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.6)', delay: 0.1 }
    );

    sizeCanvas();
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (sizeCanvas()) {
          drawRef.current();
          ScrollTrigger.refresh();
        }
      }, 150);
    };
    window.addEventListener('resize', onResize);

    return () => {
      dropTweenRef.current?.kill();
      clearTimeout(failsafe);
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = '';
    };
  }, [sizeCanvas]);

  // Frames ready: reveal the site and build the scroll-driven timeline.
  useEffect(() => {
    if (!ready) return;

    const seq = { frame: 0 };
    const toIndex = (v) => Math.round((v / (TIMELINE_FRAMES - 1)) * Math.max(frameCount - 1, 0));
    targetRef.current = 0;
    growRef.current = 0;
    drawnKeyRef.current = '';
    draw();

    const drop = dropTweenRef.current;
    const remaining = drop ? Math.max(0, drop.duration() + drop.delay() - drop.time()) : 0;

    const ctx = gsap.context(() => {
      // --- Reveal (runs right after the logo has landed) ---
      gsap.timeline({ delay: remaining })
        .to(loadingBarRef.current, { opacity: 0, duration: 0.25 })
        .to(preloaderRef.current, { '--mask-size': '150%', duration: 1.1, ease: 'power3.inOut' })
        .set(preloaderRef.current, { display: 'none' })
        .call(() => {
          document.body.style.overflow = '';
        })
        .fromTo(leftTextRef.current,
          { x: -160, opacity: 0 },
          { x: 0, opacity: 1, duration: 1, ease: 'power3.out' },
          '-=0.8'
        )
        .fromTo(rightTextRef.current,
          { x: 160, opacity: 0 },
          { x: 0, opacity: 1, duration: 1, ease: 'power3.out' },
          '<'
        );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: `+=${TIMELINE_FRAMES * 8}`,
          pin: true,
          scrub: true, // Strict sync with scrollbar
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      });

      tl.to(seq, {
        frame: TIMELINE_FRAMES - 1,
        snap: 'frame',
        ease: 'none',
        duration: TIMELINE_FRAMES,
        onUpdate: () => {
          // Called synchronously — GSAP already runs on rAF.
          targetRef.current = toIndex(seq.frame);
          const g = Math.min(1, seq.frame / 48);
          growRef.current = g * g * (3 - 2 * g); // smoothstep while the headline scrolls away
          draw();
        },
      }, 0);

      // --- Hero Text Overlay Animation ---
      tl.to(textOverlayRef.current, {
        y: () => -window.innerHeight * 1.2,
        duration: 40,
        ease: 'none',
      }, 0);

      // --- Product Cards Animations ---
      products.forEach((prod, i) => {
        const el = cardRefs.current[i];
        if (!el) return;
        gsap.set(el, { autoAlpha: 1, y: () => window.innerHeight * 1.5 });

        tl.to(el, { y: 0, duration: 40, ease: 'none' }, Math.max(0, prod.frame - 40));
        if (i < products.length - 1) {
          tl.to(el, { y: () => -window.innerHeight * 1.5, duration: 40, ease: 'none' }, prod.frame + 20);
        }
      });

      // --- Spiderman Text Animations ---
      gsap.set(spidermanTextRef.current, { autoAlpha: 0, y: () => window.innerHeight * 2 });
      tl.to(spidermanTextRef.current, { autoAlpha: 1, y: 0, duration: 40, ease: 'none' }, 44);
      tl.to(spidermanTextRef.current, { y: () => -window.innerHeight * 1.5, duration: 40, ease: 'none' }, 85);
    });

    return () => ctx.revert();
  }, [ready, frameCount, draw]);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">

      {/* HTML Canvas for rendering */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 block z-10" />

      {/* Hero Text Overlay — side-by-side in landscape, stacked above the frame in portrait (see index.css) */}
      <div ref={textOverlayRef} className="hero-overlay z-[15] will-change-transform transform-gpu">
        {/* Main block */}
        <div ref={leftTextRef} className="hero-main max-w-lg pointer-events-auto opacity-0">
          <p className="text-red-600 tracking-[0.2em] text-[11px] sm:text-sm font-semibold mb-3 landscape:mb-6 uppercase">// BRAND NEW SPIDER MAN COLLECTION</p>
          <h1 className="hero-title text-black mb-4 landscape:mb-8">
            future<br /><span className="text-red-600">wea<span className="text-transparent [-webkit-text-stroke:2.5px_#dc2626] sm:[-webkit-text-stroke:4px_#dc2626]">r</span></span>
          </h1>
          <p className="hero-copy text-black text-sm sm:text-base landscape:text-lg xl:landscape:text-xl max-w-md font-medium mb-5 landscape:mb-10 leading-relaxed">
            Future-ready streetwear crafted for creators, trendsetters, and everyday explorers.
          </p>
          <button
            onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-red-600 text-white px-6 py-3 text-sm landscape:px-8 landscape:py-4 landscape:text-base rounded-full font-semibold flex items-center gap-3 hover:bg-black transition-colors shadow-lg"
          >
            Discover The Collection
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
          </button>
        </div>

        {/* Side block (landscape only) */}
        <div ref={rightTextRef} className="hero-side max-w-lg text-right flex flex-col items-end pointer-events-auto opacity-0">
          {/* Circular Badge */}
          <div className="hero-badge mb-8 xl:mb-12 relative w-24 h-24 xl:w-28 xl:h-28 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-red-600 animate-[spin_10s_linear_infinite]">
              <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
              <text>
                <textPath href="#circlePath" startOffset="0" className="text-[11px] font-bold tracking-[0.15em] fill-current uppercase">
                  BUILT DIFFERENT • MADE TO STAND OUT •
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-black">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M2 12h20M6 6l12 12M6 18L18 6" /></svg>
            </div>
          </div>
          <h1 className="hero-title text-red-600 mb-8 text-right">
            wear<br /><span className="text-black"><span className="text-transparent [-webkit-text-stroke:4px_black]">p</span>ower</span>
          </h1>
          <p className="hero-copy text-black text-lg xl:text-xl max-w-[280px] font-medium italic leading-relaxed text-right">
            Modern Silhouettes. Premium Fabrics. Limitless Expression.
          </p>
        </div>
      </div>

      {/* GSAP Preloader Overlay via React Portal */}
      {createPortal(
        <div
          ref={preloaderRef}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
          style={{
            '--mask-size': '0%',
            WebkitMaskImage: 'radial-gradient(circle at 50% 100%, transparent var(--mask-size), black var(--mask-size))',
            maskImage: 'radial-gradient(circle at 50% 100%, transparent var(--mask-size), black var(--mask-size))',
          }}
        >
          <div className="flex items-center text-white text-4xl md:text-6xl font-black tracking-widest uppercase mb-12 overflow-hidden px-8 select-none">
            <span>W</span>
            <span ref={earsuperTextRef} className="opacity-0">EARSUPER</span>
          </div>

          <div ref={loadingBarRef} className="flex flex-col items-center">
            <div className="w-48 sm:w-64 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c6a15b] transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-white/50 text-sm mt-4 font-mono">{progress}%</div>
          </div>
        </div>,
        document.body
      )}

      {/* Spider-Man Text Overlay */}
      <div
        ref={spidermanTextRef}
        className="absolute right-4 sm:right-8 md:right-16 lg:right-32 pointer-events-none z-20 flex flex-col justify-center opacity-0"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        <h2 className="text-4xl md:text-6xl lg:text-[5rem] font-black text-transparent [-webkit-text-stroke:2px_#dc2626] uppercase tracking-widest whitespace-nowrap">
          Spiderman Brand New Day Collection
        </h2>
      </div>

      {/* Product Cards Sequence */}
      {products.map((prod, i) => (
        <ProductCard
          key={prod.id}
          product={prod}
          ref={(el) => (cardRefs.current[i] = el)}
        />
      ))}
    </div>
  );
};

export default Hero;
