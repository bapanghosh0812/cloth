// Shared cache so a remount (e.g. React StrictMode in dev) never refetches a frame.
const cache = new Map();

export const loadImage = (url, { priority = false } = {}) => {
  if (cache.has(url)) return cache.get(url);

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    if (priority) img.fetchPriority = 'high';
    img.onload = () => {
      // decode() keeps the first canvas draw jank-free; fall back if it is unsupported or rejects.
      const done = () => resolve(img);
      if (img.decode) img.decode().then(done, done);
      else done();
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

  cache.set(url, promise);
  return promise;
};

// Coarse-to-fine order: first + last frame, then every 32nd, 16th … 1st.
// Scrubbing works almost immediately with coarse frames and sharpens as the rest arrive.
export const progressiveOrder = (count) => {
  const order = [];
  const seen = new Set();
  const push = (i) => {
    if (i >= 0 && i < count && !seen.has(i)) {
      seen.add(i);
      order.push(i);
    }
  };

  push(0);
  push(count - 1);
  for (let step = 32; step >= 1; step /= 2) {
    for (let i = 0; i < count; i += step) push(i);
  }
  return order;
};

// Loads `urls[indices[n]]` in order with a fixed number of parallel requests.
export const loadInOrder = (urls, indices, { concurrency = 6, onLoad, isCancelled } = {}) => {
  let cursor = 0;

  const worker = async () => {
    while (cursor < indices.length && !isCancelled?.()) {
      const index = indices[cursor++];
      const img = await loadImage(urls[index], { priority: index === 0 });
      if (img && !isCancelled?.()) onLoad?.(index, img);
    }
  };

  return Promise.all(Array.from({ length: concurrency }, worker));
};
