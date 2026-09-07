const values = [
  {
    title: 'Free Luxury Shipping',
    desc: 'Complimentary, carbon-neutral delivery on every order over $500.',
    icon: (
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
    ),
  },
  {
    title: 'Crafted to Last',
    desc: 'Premium fabrics, hand-finished seams, built for a lifetime of wear.',
    icon: <path d="M20.91 8.84 8.56 21.19a4.24 4.24 0 0 1-6-6L14.9 2.85a2.82 2.82 0 0 1 4 4L6.5 19.24" />,
  },
  {
    title: '30-Day Returns',
    desc: 'Changed your mind? Enjoy free, no-questions-asked returns.',
    icon: <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8m0-5v5h5" />,
  },
  {
    title: 'Concierge Support',
    desc: 'A dedicated styling team, available around the clock, just for you.',
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  },
];

const Values = () => (
  <section className="w-full bg-[#0a0a0a] py-20 px-6 border-t border-white/5">
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
      {values.map((v) => (
        <div key={v.title} className="flex flex-col items-center text-center group">
          <div className="w-14 h-14 rounded-full border border-[#c6a15b]/40 flex items-center justify-center text-[#c6a15b] mb-5 group-hover:bg-[#c6a15b] group-hover:text-black transition-colors duration-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {v.icon}
            </svg>
          </div>
          <h3 className="text-white font-semibold tracking-wide mb-2">{v.title}</h3>
          <p className="text-white/45 text-sm leading-relaxed max-w-[240px]">{v.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Values;
