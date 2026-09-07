import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useImageSequence } from '../hooks/useImageSequence';

// Import product images
import shirtImg from '../assets/hero_product/shirt.png';
import pantImg from '../assets/hero_product/pant.png';
import shoesImg from '../assets/hero_product/shoes.png';

gsap.registerPlugin(ScrollTrigger);

const products = [
  { id: 1, name: "Premium Shirt", price: "199$", image: shirtImg, frame: 76, align: 'left' },
  { id: 2, name: "Premium Pant", price: "149$", image: pantImg, frame: 153, align: 'right' },
  { id: 3, name: "Premium Shoes", price: "299$", image: shoesImg, frame: 239, align: 'left' }
];

const ProductCard = React.memo(React.forwardRef(({ product }, ref) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);

  const alignClass = product.align === 'right' 
    ? 'right-8 md:right-16 lg:right-32' 
    : 'left-8 md:left-16 lg:left-32';

  return (
    <div
      ref={ref}
      // will-change-transform and transform-gpu (translateZ(0)) added for hardware acceleration
      className={`absolute ${alignClass} top-1/2 -translate-y-1/2 z-20 w-[280px] md:w-[320px] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col bg-[#242424] will-change-transform transform-gpu`}
      style={{ visibility: 'hidden' }}
    >
      {/* Top Half - White Background */}
      <div className="bg-[#f0f0f0] relative flex flex-col justify-center items-center">
        {/* Heart Icon */}
        <div
          onClick={() => setIsFavorite(!isFavorite)}
          className={`absolute top-4 right-4 z-10 p-2.5 rounded-full cursor-pointer transition-colors shadow-sm ${isFavorite ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-[#242424] text-white hover:bg-black'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </div>
        {/* Product Image */}
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-56 md:h-64 object-contain p-2 pointer-events-none" 
        />
      </div>

      {/* Bottom Half - Dark Background */}
      <div className="p-6 flex flex-col gap-4 text-white">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">{product.name}</h3>
          <p className="text-zinc-400 text-sm mt-1">Exclusive Collection</p>
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="text-[28px] font-bold tracking-tight">{product.price}</span>
          <button
            onClick={() => setInCart(!inCart)}
            className={`p-3.5 rounded-[1.25rem] transition-colors shadow-md ${inCart ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-gray-200'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {inCart ? (
                <path d="M20 6L9 17l-5-5" />
              ) : (
                <>
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </>
              )}
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
  const wTextRef = useRef(null);
  const earsuperTextRef = useRef(null);
  const loadingBarRef = useRef(null);
  const lastDrawnFrame = useRef(-1);
  const renderCache = useRef(null);
  const resizeTimer = useRef(null);

  const { progress, isLoaded, images, firstImage, firstImageLoaded } = useImageSequence();

  // Draw frame, optimized by caching scale and offsets to avoid recalculating every frame
  const drawFrame = (frameIndex, canvas, context) => {
    if (frameIndex === lastDrawnFrame.current) return;

    const img = images[frameIndex] || firstImage;
    if (!img || !renderCache.current) return;

    const { cW, cH, offsetX, offsetY, nw, nh } = renderCache.current;

    context.fillStyle = '#000000';
    context.fillRect(0, 0, cW, cH);
    context.drawImage(img, offsetX, offsetY, nw, nh);

    lastDrawnFrame.current = frameIndex;
  };

  // Only calculate heavy math during a resize event
  const calculateRenderCache = (canvas, img) => {
    if (!img) return;
    
    const cW = window.innerWidth;
    const cH = window.innerHeight;
    const iW = img.naturalWidth || img.width;
    const iH = img.naturalHeight || img.height;

    if (iW === 0 || iH === 0) return;

    const scale = cW / iW;
    // Force integer values to prevent canvas sub-pixel interpolation overhead
    const nw = Math.round(iW * scale);
    const nh = Math.round(iH * scale);
    const offsetX = Math.round((cW - nw) / 2);
    const offsetY = Math.round((cH - nh) / 2);

    renderCache.current = { cW, cH, offsetX, offsetY, nw, nh };
  };

  const resizeCanvas = (canvas, context, currentFrame) => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = true;

    const img = images[currentFrame] || firstImage;
    calculateRenderCache(canvas, img);

    lastDrawnFrame.current = -1; // Force redraw
    drawFrame(currentFrame, canvas, context);
  };

  // Initial load logic for first placeholder frame
  useEffect(() => {
    // Lock scrolling until the preloader finishes
    document.body.style.overflow = 'hidden';

    if (firstImageLoaded && !isLoaded) {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d', { alpha: false }); // Alpha false optimizes canvas rendering
      if (!canvas || !context) return;

      resizeCanvas(canvas, context, 0);

      const handleResize = () => {
        clearTimeout(resizeTimer.current);
        resizeTimer.current = setTimeout(() => {
          resizeCanvas(canvas, context, 0);
        }, 150);
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimer.current);
      };
    }
  }, [firstImageLoaded, isLoaded]);

  // Main GSAP Timeline setup
  useEffect(() => {
    if (!isLoaded || images.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !context) return;

    const frameCount = images.length;
    const seq = { frame: 0 };

    resizeCanvas(canvas, context, 0);

    let ctx = gsap.context(() => {
      // --- Custom Preloader & Intro Animations ---
      const introTl = gsap.timeline({
        onComplete: () => {
          // Unlock scrolling to open all sections after preloader finishes
          document.body.style.overflow = '';
        }
      });
      
      // 1. Text Assembly (EARSUPER drops in next to W)
      introTl.to(earsuperTextRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'bounce.out'
      })
      // 2. Hide loading bar simultaneously
      .to(loadingBarRef.current, {
        opacity: 0,
        duration: 0.5
      }, "-=0.8")
      // Brief pause to read "WEARSUPER"
      .to({}, { duration: 0.3 })
      // 3. Circle Reveal (Mask expands from bottom center)
      .to(preloaderRef.current, {
        '--mask-size': '150%',
        duration: 1.8,
        ease: 'power4.inOut'
      })
      // Hide preloader to allow pointer events underneath
      .set(preloaderRef.current, { display: 'none' })
      // 4. Hero Content comes in smoothly as the mask expands
      .fromTo(leftTextRef.current,
        { x: -500, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.5, ease: 'power3.out' },
        "-=1.5"
      )
      .fromTo(rightTextRef.current,
        { x: 500, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.5, ease: 'power3.out' },
        "-=1.5"
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${frameCount * 8}`,
          pin: true,
          scrub: true, // Strict sync with scrollbar
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1
        }
      });

      tl.to(seq, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        duration: frameCount,
        onUpdate: () => {
          // Call drawFrame synchronously. GSAP already uses RAF.
          // Adding another RAF here introduces a 1-frame rendering lag.
          drawFrame(Math.round(seq.frame), canvas, context);
        }
      }, 0);

      // --- Hero Text Overlay Animation ---
      if (textOverlayRef.current) {
        tl.to(textOverlayRef.current, {
          y: -window.innerHeight * 1.2,
          duration: 40,
          ease: "none"
        }, 0);
      }

      // --- Product Cards Animations ---
      products.forEach((prod, i) => {
        const el = cardRefs.current[i];
        if (el) {
          gsap.set(el, { autoAlpha: 1, y: window.innerHeight * 1.5 });

          const startFrame = Math.max(0, prod.frame - 40);
          const fadeOutStart = prod.frame + 20;

          tl.to(el, {
            y: 0,
            duration: 40,
            ease: "none"
          }, startFrame);

          if (i < products.length - 1) {
            tl.to(el, {
              y: -window.innerHeight * 1.5,
              duration: 40,
              ease: "none"
            }, fadeOutStart);
          }
        }
      });

      // --- Spiderman Text Animations ---
      if (spidermanTextRef.current) {
        const spidermanStartFrame = 44; // Start at frame 44
        const spidermanFadeOutStart = 45 + 40;

        gsap.set(spidermanTextRef.current, { autoAlpha: 0, y: window.innerHeight * 2 });

        tl.to(spidermanTextRef.current, {
          autoAlpha: 1,
          y: 0,
          duration: 40,
          ease: "none"
        }, spidermanStartFrame);

        tl.to(spidermanTextRef.current, {
          y: -window.innerHeight * 1.5,
          duration: 40,
          ease: "none"
        }, spidermanFadeOutStart);
      }

    });

    const handleResize = () => {
      clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(() => {
        resizeCanvas(canvas, context, Math.round(seq.frame));
        ScrollTrigger.refresh();
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer.current);
      ctx.revert();
    };
  }, [isLoaded, images]);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">

      {/* HTML Canvas for rendering */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full block z-10"
      />

      {/* Hero Text Overlay for Frame 0 */}
      {/* Added will-change-transform for hardware acceleration */}
      <div ref={textOverlayRef} className="absolute inset-0 w-full h-full pointer-events-none z-[15] flex justify-between px-4 md:px-8 lg:px-12 xl:px-16 will-change-transform transform-gpu">
        {/* Left Text */}
        <div ref={leftTextRef} className="relative top-1/2 -translate-y-1/2 max-w-lg pointer-events-auto self-center opacity-0">
          <p className="text-red-600 tracking-[0.2em] text-sm font-semibold mb-6 uppercase">// BRAND NEW SPIDER MAN COLLECTION</p>
          <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-black text-black leading-[0.8] tracking-tighter mb-8 lowercase">
            future<br/><span className="text-red-600">wea<span className="text-transparent [-webkit-text-stroke:4px_#dc2626]">r</span></span>
          </h1>
          <p className="text-black text-lg md:text-xl max-w-md font-medium mb-10 leading-relaxed">
            Future-ready streetwear crafted for creators, trendsetters, and everyday explorers.
          </p>
          <button className="bg-red-600 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-3 hover:bg-black transition-colors shadow-lg">
            Discover The Collection
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
          </button>
        </div>
        
        {/* Right Text */}
        <div ref={rightTextRef} className="relative top-1/2 -translate-y-1/2 max-w-lg text-right flex flex-col items-end pointer-events-auto self-center opacity-0">
          {/* Circular Badge */}
          <div className="mb-12 relative w-28 h-28 flex items-center justify-center">
             <svg viewBox="0 0 100 100" className="w-full h-full text-red-600 animate-[spin_10s_linear_infinite]">
               <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
               <text>
                 <textPath href="#circlePath" startOffset="0" className="text-[11px] font-bold tracking-[0.15em] fill-current uppercase">
                   BUILT DIFFERENT • MADE TO STAND OUT • 
                 </textPath>
               </text>
             </svg>
             <div className="absolute inset-0 flex items-center justify-center text-black">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M2 12h20M6 6l12 12M6 18L18 6"/></svg>
             </div>
          </div>
          <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-black text-red-600 leading-[0.8] tracking-tighter mb-8 lowercase text-right">
            wear<br/><span className="text-black"><span className="text-transparent [-webkit-text-stroke:4px_black]">p</span>ower</span>
          </h1>
          <p className="text-black text-lg md:text-xl max-w-[280px] font-medium italic leading-relaxed text-right">
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
            maskImage: 'radial-gradient(circle at 50% 100%, transparent var(--mask-size), black var(--mask-size))'
          }}
        >
          <div className="flex items-center text-white text-4xl md:text-6xl font-black tracking-widest uppercase mb-12 overflow-hidden px-8 select-none">
            <span ref={wTextRef}>W</span>
            <span ref={earsuperTextRef} className="opacity-0 translate-y-[-150%]">EARSUPER</span>
          </div>

          <div ref={loadingBarRef} className="flex flex-col items-center">
            <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-white/50 text-sm mt-4 font-mono">
              {progress}%
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Spider-Man Text Overlay */}
      <div 
        ref={spidermanTextRef} 
        className="absolute right-8 md:right-16 lg:right-32 pointer-events-none z-20 flex flex-col justify-center opacity-0"
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
