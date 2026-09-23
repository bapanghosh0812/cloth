import { useEffect, useRef, useState } from 'react';

/**
 * 360° product viewer.
 *  - `frames`: optional real turntable shots (e.g. 24–36 photos) — dragging scrubs through them.
 *  - Without frames the product photo is spun on a 3D turntable.
 * Drag / swipe to rotate (with inertia), arrow keys step 15°, auto-rotates until touched.
 * The render loop writes styles directly so React never re-renders per frame.
 */
const Face = ({ src, alt, cutout, back = false }) => (
  <div
    className="absolute inset-0 [backface-visibility:hidden]"
    style={back ? { transform: 'rotateY(180deg)' } : undefined}
  >
    <img
      src={src}
      alt={back ? '' : alt}
      draggable={false}
      className={`w-full h-full ${cutout ? 'object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.35)]' : 'object-cover rounded-2xl border border-white/10'}`}
      // The back is the mirrored silhouette, slightly shaded as if facing away from the light.
      style={back ? { transform: 'scaleX(-1)', filter: 'brightness(0.72) saturate(0.9)' } : undefined}
    />
  </div>
);

const Viewer360 = ({ image, frames, alt, cutout = false }) => {
  const spinRef = useRef(null);
  const shadowRef = useRef(null);
  const sheenRef = useRef(null);
  const readoutRef = useRef(null);
  const frameImgRef = useRef(null);
  const motion = useRef({ angle: -25, velocity: 0, dragging: false, lastX: 0, lastT: 0 });
  const autoRef = useRef(true);
  const [auto, setAuto] = useState(true);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    autoRef.current = auto;
  }, [auto]);

  useEffect(() => {
    let raf;
    const tick = () => {
      const m = motion.current;
      if (!m.dragging) {
        if (Math.abs(m.velocity) > 0.02) {
          m.angle += m.velocity;
          m.velocity *= 0.94;
        } else if (autoRef.current) {
          m.angle += 0.35;
        }
      }
      const a = ((m.angle % 360) + 360) % 360;
      const rad = (m.angle * Math.PI) / 180;

      if (frames?.length) {
        const i = Math.round((a / 360) * frames.length) % frames.length;
        const el = frameImgRef.current;
        if (el && el.dataset.i !== String(i)) {
          el.src = frames[i];
          el.dataset.i = String(i);
        }
      } else if (spinRef.current) {
        spinRef.current.style.transform = `rotateY(${m.angle}deg)`;
        if (sheenRef.current) sheenRef.current.style.backgroundPosition = `${50 + Math.sin(rad) * 70}% 0`;
      }
      if (shadowRef.current) shadowRef.current.style.transform = `scaleX(${0.55 + 0.45 * Math.abs(Math.cos(rad))})`;
      if (readoutRef.current) readoutRef.current.textContent = `${Math.round(a)}°`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frames]);

  const grab = () => {
    setAuto(false);
    setTouched(true);
  };

  const onPointerDown = (e) => {
    const m = motion.current;
    m.dragging = true;
    m.velocity = 0;
    m.lastX = e.clientX;
    m.lastT = performance.now();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    grab();
  };
  const onPointerMove = (e) => {
    const m = motion.current;
    if (!m.dragging) return;
    const now = performance.now();
    const delta = (e.clientX - m.lastX) * 0.55;
    m.angle += delta;
    m.velocity = delta / Math.max(1, (now - m.lastT) / 16.7);
    m.lastX = e.clientX;
    m.lastT = now;
  };
  const release = () => {
    motion.current.dragging = false;
  };
  const onKeyDown = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    motion.current.velocity = 0;
    motion.current.angle += e.key === 'ArrowRight' ? 15 : -15;
    grab();
  };
  const reset = () => {
    motion.current.velocity = 0;
    motion.current.angle = 0;
    grab();
  };

  const sheenMask = cutout
    ? { WebkitMaskImage: `url(${image})`, maskImage: `url(${image})`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }
    : { borderRadius: '1rem' };

  return (
    <div className="relative w-full h-full select-none">
      <div
        tabIndex={0}
        role="slider"
        aria-label={`Rotate ${alt} 360 degrees`}
        aria-valuemin={0}
        aria-valuemax={360}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={onKeyDown}
        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing outline-none touch-pan-y focus-visible:ring-2 focus-visible:ring-[#c6a15b]/60 rounded-2xl"
        style={{ perspective: '1400px' }}
      >
        {/* Spotlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_30%,rgba(198,161,91,0.22),transparent_62%)]" />

        {frames?.length ? (
          <img ref={frameImgRef} src={frames[0]} alt={alt} draggable={false} className="relative w-[80%] h-[80%] object-contain" />
        ) : (
          <div ref={spinRef} className="relative w-[70%] h-[74%]" style={{ transformStyle: 'preserve-3d' }}>
            <Face src={image} alt={alt} cutout={cutout} />
            <Face src={image} alt={alt} cutout={cutout} back />
            {/* Moving highlight on the front face */}
            <div
              ref={sheenRef}
              className="absolute inset-0 pointer-events-none [backface-visibility:hidden] mix-blend-soft-light"
              style={{
                backgroundImage: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.55) 50%, transparent 62%)',
                backgroundSize: '260% 100%',
                ...sheenMask,
              }}
            />
          </div>
        )}

        {/* Turntable shadow */}
        <div ref={shadowRef} className="absolute bottom-[6%] left-[22%] w-[56%] h-5 rounded-[50%] bg-black/45 blur-md pointer-events-none" />
      </div>

      {/* HUD */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2">
        <span className={`text-[11px] uppercase tracking-[0.2em] text-white/80 bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 transition-opacity duration-500 ${touched ? 'opacity-0' : 'opacity-100'}`}>
          ⟲ Drag to rotate
        </span>
        <div className="flex items-center gap-2">
          <span ref={readoutRef} className="min-w-12 text-center text-[11px] font-semibold tracking-widest text-white bg-black/60 backdrop-blur-md px-2.5 py-2 rounded-full border border-white/10">0°</span>
          <button
            onClick={() => setAuto((v) => !v)}
            aria-label={auto ? 'Pause rotation' : 'Auto-rotate'}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:border-[#c6a15b] hover:text-[#c6a15b] transition-colors"
          >
            {auto ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button
            onClick={reset}
            aria-label="Reset view"
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:border-[#c6a15b] hover:text-[#c6a15b] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Viewer360;
