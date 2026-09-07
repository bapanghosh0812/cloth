// Large scrolling word band that separates sections with a premium editorial feel.
const Marquee = ({ words = ['WEARSUPER', 'BUILT DIFFERENT', 'MADE TO STAND OUT'], dark = true }) => {
  const loop = [...words, ...words, ...words];
  return (
    <div className={`w-full overflow-hidden py-6 border-y ${dark ? 'bg-black border-white/10' : 'bg-[#f5f1ea] border-black/10'}`}>
      <div className="flex whitespace-nowrap ws-marquee-slow">
        {loop.map((w, i) => (
          <span key={i} className="flex items-center">
            <span className={`font-display text-4xl md:text-6xl px-8 ${dark ? 'text-white/90' : 'text-black'}`}>
              {w}
            </span>
            <span className="text-[#c6a15b] text-3xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
