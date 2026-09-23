// Seeded demo reviews. Deterministic per product so the same reviews show on every visit.

const NAMES = [
  ['Aarav M.', 'Mumbai'], ['Sophia L.', 'London'], ['Kabir S.', 'Delhi'], ['Isabella R.', 'Milan'],
  ['Rohan D.', 'Kolkata'], ['Amelia W.', 'New York'], ['Vihaan K.', 'Bengaluru'], ['Chloé B.', 'Paris'],
  ['Arjun P.', 'Pune'], ['Mia T.', 'Dubai'], ['Ishaan G.', 'Hyderabad'], ['Olivia H.', 'Sydney'],
];

const COPY = {
  apparel: [
    ['Worth every penny', 'The fabric feels incredible and the cut is sharp without being stiff. Wore it to a dinner and got asked where it was from three times.'],
    ['Quiet luxury done right', 'Understated, beautifully finished seams and it drapes perfectly. The packaging alone felt like a gift.'],
    ['Fits like it was tailored', 'I usually struggle with fit off the rack but this sits exactly where it should. Ordered my usual size.'],
    ['Premium from the first touch', 'Heavier and softer than I expected. Colour is exactly as shown in the photos.'],
    ['My new favourite piece', 'Dresses up or down effortlessly. Delivery was quick and tracking updates were spot on.'],
    ['Beautiful, runs slightly large', 'Gorgeous quality. I sized down and it is perfect — worth checking the fit notes.'],
  ],
  footwear: [
    ['Comfort out of the box', 'Zero break-in time. Walked the whole day at a trade show and my feet were fine.'],
    ['Head-turner', 'The colourway is even better in person. Materials feel far more premium than my other pairs.'],
    ['Great cushioning', 'Responsive without feeling mushy. True to size for me and the heel lock is excellent.'],
    ['Built to last', 'Stitching and finish are flawless. Came in a beautiful box with dust bags.'],
    ['Instant classic', 'Pairs with everything in my wardrobe. Already thinking about a second colour.'],
    ['Slightly snug at first', 'Toe box was a touch tight for a day or two, then moulded perfectly. Love them.'],
  ],
};

const FIT = ['True to size', 'True to size', 'True to size', 'Runs slightly small', 'Runs slightly large'];

// Small deterministic PRNG seeded from the product id.
const seeded = (seedText) => {
  let h = 2166136261;
  for (const ch of seedText) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

export const getSeedReviews = (product, count = 6) => {
  const rand = seeded(product.id);
  const pool = product.category === 'Footwear' ? COPY.footwear : COPY.apparel;
  const people = [...NAMES].sort(() => rand() - 0.5);
  const texts = [...pool].sort(() => rand() - 0.5);

  return Array.from({ length: count }, (_, i) => {
    const rating = rand() < product.rating - 4 + 0.15 ? 5 : rand() < 0.85 ? 4 : 3;
    const daysAgo = Math.round(3 + i * 9 + rand() * 8);
    return {
      id: `${product.id}-seed-${i}`,
      name: people[i % people.length][0],
      location: people[i % people.length][1],
      rating,
      title: texts[i % texts.length][0],
      body: texts[i % texts.length][1],
      date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      size: product.sizes[Math.floor(rand() * product.sizes.length)],
      fit: FIT[Math.floor(rand() * FIT.length)],
      helpful: Math.round(rand() * 40),
      verified: true,
    };
  });
};

// Star distribution (5★ → 1★, fractions) whose mean matches `rating`.
export const ratingDistribution = (rating) => {
  const mean = (r) => {
    const w = [1, r, r * r, r ** 3, r ** 4];
    const total = w.reduce((a, b) => a + b, 0);
    return w.reduce((acc, x, k) => acc + (5 - k) * x, 0) / total;
  };
  let lo = 0.0001;
  let hi = 0.9999;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (mean(mid) > rating) lo = mid;
    else hi = mid;
  }
  const w = [1, lo, lo * lo, lo ** 3, lo ** 4];
  const total = w.reduce((a, b) => a + b, 0);
  return w.map((x) => x / total);
};
