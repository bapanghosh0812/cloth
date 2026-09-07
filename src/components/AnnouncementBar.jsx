const items = [
  'Complimentary shipping over $500',
  'New Season · Spider-Man Brand New Day Collection',
  '30-day easy returns',
  'Members get early access to every drop',
  'Hand-finished in limited runs',
];

const AnnouncementBar = () => {
  const loop = [...items, ...items];
  return (
    <div className="fixed top-0 left-0 w-full z-[60] bg-black text-white/80 text-[11px] uppercase tracking-[0.25em] overflow-hidden border-b border-white/10 h-8 flex items-center">
      <div className="flex whitespace-nowrap ws-marquee">
        {loop.map((t, i) => (
          <span key={i} className="flex items-center">
            <span className="px-8">{t}</span>
            <span className="text-[#c6a15b]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
