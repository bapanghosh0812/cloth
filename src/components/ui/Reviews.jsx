import { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { getSeedReviews, ratingDistribution } from '../../data/reviews';

const Star = ({ filled, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#c6a15b' : 'none'} stroke="#c6a15b" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" />
  </svg>
);

export const Stars = ({ rating, size }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => <Star key={i} filled={i <= Math.round(rating)} size={size} />)}
  </div>
);

const fmt = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const SORTS = {
  recent: (a, b) => new Date(b.date) - new Date(a.date),
  highest: (a, b) => b.rating - a.rating,
  lowest: (a, b) => a.rating - b.rating,
  helpful: (a, b) => b.helpful - a.helpful,
};

const ReviewForm = ({ product, onDone }) => {
  const { addReview, user, toast } = useStore();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({
    name: user && !user.guest ? user.name : '',
    location: '',
    title: '',
    body: '',
    size: product.sizes[0],
    fit: 'True to size',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!rating) return toast('Please choose a star rating', 'error');
    if (!form.name.trim() || !form.title.trim() || form.body.trim().length < 10) {
      return toast('Add your name, a title and at least 10 characters', 'error');
    }
    addReview(product.id, { ...form, name: form.name.trim(), location: form.location.trim() || 'Online', rating });
    onDone();
  };

  const input = 'w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-[#c6a15b] transition-colors placeholder:text-white/25 text-sm';

  return (
    <form onSubmit={submit} className="ws-pop rounded-2xl border border-[#c6a15b]/25 bg-[#c6a15b]/[0.04] p-5 sm:p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-2">Your rating</p>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} aria-label={`${i} stars`} className="p-0.5 transition-transform hover:scale-110">
              <Star filled={i <= (hover || rating)} size={28} />
            </button>
          ))}
          <span className="ml-3 text-white/50 text-sm">{['', 'Poor', 'Fair', 'Good', 'Very good', 'Exceptional'][hover || rating]}</span>
        </div>
      </div>
      <input className={input} placeholder="Your name" value={form.name} onChange={set('name')} />
      <input className={input} placeholder="City (optional)" value={form.location} onChange={set('location')} />
      <input className={`${input} sm:col-span-2`} placeholder="Review title" value={form.title} onChange={set('title')} />
      <textarea className={`${input} sm:col-span-2 resize-none`} rows={4} placeholder="What did you love? How was the fit and quality?" value={form.body} onChange={set('body')} />
      <select className={input} value={form.size} onChange={set('size')} aria-label="Size purchased">
        {product.sizes.map((s) => <option key={s} value={s} className="bg-[#111]">Size {s}</option>)}
      </select>
      <select className={input} value={form.fit} onChange={set('fit')} aria-label="Fit">
        {['True to size', 'Runs slightly small', 'Runs slightly large'].map((f) => <option key={f} className="bg-[#111]">{f}</option>)}
      </select>
      <div className="sm:col-span-2 flex gap-3 justify-end">
        <button type="button" onClick={onDone} className="px-5 py-3 rounded-xl border border-white/15 text-white/70 text-sm font-semibold uppercase tracking-widest hover:bg-white/5 transition-colors">Cancel</button>
        <button type="submit" className="btn-sheen px-6 py-3 rounded-xl bg-[#c6a15b] text-black text-sm font-bold uppercase tracking-widest hover:bg-[#d8b877] transition-colors">Publish review</button>
      </div>
    </form>
  );
};

const Reviews = ({ product }) => {
  const { userReviews, helpfulVotes, toggleHelpful } = useStore();
  const [sort, setSort] = useState('recent');
  const [starFilter, setStarFilter] = useState(0);
  const [visible, setVisible] = useState(4);
  const [writing, setWriting] = useState(false);

  const mine = useMemo(() => userReviews[product.id] || [], [userReviews, product.id]);
  const seed = useMemo(() => getSeedReviews(product), [product]);

  const total = product.reviews + mine.length;
  const average = (product.rating * product.reviews + mine.reduce((sum, r) => sum + r.rating, 0)) / total;
  const counts = useMemo(() => {
    const dist = ratingDistribution(product.rating); // 5★ → 1★
    const c = dist.map((f) => Math.round(f * product.reviews));
    mine.forEach((r) => (c[5 - r.rating] += 1));
    return c;
  }, [product, mine]);

  const list = useMemo(() => {
    const all = [...mine, ...seed].map((r) => ({ ...r, helpful: r.helpful + (helpfulVotes[r.id] ? 1 : 0) }));
    return all.filter((r) => !starFilter || r.rating === starFilter).sort(SORTS[sort]);
  }, [mine, seed, helpfulVotes, starFilter, sort]);

  const fits = [...mine, ...seed];
  const trueToSize = fits.filter((r) => r.fit === 'True to size').length / Math.max(1, fits.length);
  // -1 = runs small … +1 = runs large → marker position on the fit meter
  const fitScore = fits.reduce((acc, r) => acc + (r.fit.includes('small') ? -1 : r.fit.includes('large') ? 1 : 0), 0) / Math.max(1, fits.length);

  return (
    <section id={`reviews-${product.id}`} className="px-5 sm:px-8 md:px-10 py-10 md:py-12 border-t border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[#c6a15b] text-[11px] font-semibold uppercase tracking-[0.3em] mb-2">Client Reviews</p>
          <h3 className="font-display text-3xl text-white">What our clients say</h3>
        </div>
        {!writing && (
          <button onClick={() => setWriting(true)} className="btn-sheen self-start sm:self-auto px-6 py-3 rounded-full border border-[#c6a15b] text-[#c6a15b] text-sm font-semibold uppercase tracking-widest hover:bg-[#c6a15b] hover:text-black transition-colors">
            Write a review
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-center mb-10">
        <div className="text-center md:text-left">
          <p className="font-display text-6xl text-white leading-none">{average.toFixed(1)}</p>
          <div className="flex justify-center md:justify-start mt-3"><Stars rating={average} size={18} /></div>
          <p className="text-white/40 text-sm mt-2">Based on {total.toLocaleString()} reviews</p>
        </div>

        <div className="space-y-2">
          {counts.map((count, i) => {
            const stars = 5 - i;
            const pct = total ? (count / total) * 100 : 0;
            const active = starFilter === stars;
            return (
              <button
                key={stars}
                onClick={() => { setStarFilter(active ? 0 : stars); setVisible(4); }}
                className={`w-full flex items-center gap-3 group rounded-lg px-1 py-0.5 transition-colors ${active ? 'bg-white/5' : 'hover:bg-white/[0.03]'}`}
              >
                <span className={`w-8 text-sm ${active ? 'text-[#c6a15b]' : 'text-white/60'}`}>{stars}★</span>
                <span className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <span className="block h-full rounded-full bg-gradient-to-r from-[#a17c2e] to-[#e2c78e]" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-12 text-right text-xs text-white/40">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="md:w-48">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-3">Fit</p>
          <div className="relative h-1.5 rounded-full bg-white/10">
            <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#c6a15b] ring-4 ring-[#c6a15b]/20" style={{ left: `${50 + fitScore * 40}%` }} />
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/35 mt-2">
            <span>Small</span><span>True</span><span>Large</span>
          </div>
          <p className="text-white/50 text-xs mt-3">{Math.round(trueToSize * 100)}% say it fits true to size</p>
        </div>
      </div>

      {writing && <ReviewForm product={product} onDone={() => setWriting(false)} />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-white/50 text-sm">
          {starFilter ? `${list.length} ${starFilter}★ reviews shown` : `Showing ${Math.min(visible, list.length)} of ${list.length} recent reviews`}
          {starFilter > 0 && (
            <button onClick={() => setStarFilter(0)} className="ml-3 text-[#c6a15b] hover:underline">Clear filter</button>
          )}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort reviews"
          className="bg-white/5 border border-white/10 text-white/80 text-sm rounded-full px-4 py-2 outline-none focus:border-[#c6a15b]"
        >
          <option value="recent" className="bg-[#111]">Most recent</option>
          <option value="helpful" className="bg-[#111]">Most helpful</option>
          <option value="highest" className="bg-[#111]">Highest rated</option>
          <option value="lowest" className="bg-[#111]">Lowest rated</option>
        </select>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {list.slice(0, visible).map((r) => (
          <article key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <Stars rating={r.rating} />
              <span className="text-white/35 text-xs whitespace-nowrap">{fmt(r.date)}</span>
            </div>
            <h4 className="text-white font-semibold mt-3">{r.title}</h4>
            <p className="text-white/60 text-sm leading-relaxed mt-2 flex-1">{r.body}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-[10px] uppercase tracking-widest text-white/50 border border-white/10 rounded-full px-2.5 py-1">Size {r.size}</span>
              <span className="text-[10px] uppercase tracking-widest text-white/50 border border-white/10 rounded-full px-2.5 py-1">{r.fit}</span>
            </div>
            <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {r.name} <span className="text-white/35 font-normal">· {r.location}</span>
                </p>
                {r.verified ? (
                  <p className="text-[#c6a15b] text-[11px] mt-0.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    Verified purchase
                  </p>
                ) : (
                  r.mine && <p className="text-white/40 text-[11px] mt-0.5">Your review</p>
                )}
              </div>
              <button
                onClick={() => toggleHelpful(r.id)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${helpfulVotes[r.id] ? 'border-[#c6a15b] text-[#c6a15b] bg-[#c6a15b]/10' : 'border-white/15 text-white/60 hover:border-white/40'}`}
              >
                👍 Helpful ({r.helpful})
              </button>
            </div>
          </article>
        ))}
      </div>

      {list.length === 0 && <p className="text-white/40 text-center py-10">No reviews match this filter yet.</p>}

      {visible < list.length && (
        <div className="text-center mt-8">
          <button onClick={() => setVisible((v) => v + 4)} className="px-8 py-3 rounded-full border border-white/15 text-white text-sm font-semibold uppercase tracking-widest hover:border-[#c6a15b] hover:text-[#c6a15b] transition-colors">
            Show more reviews
          </button>
        </div>
      )}
    </section>
  );
};

export default Reviews;
