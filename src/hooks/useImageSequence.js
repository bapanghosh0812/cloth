import { useCallback, useEffect, useRef, useState } from 'react';
import { loadInOrder, progressiveOrder } from '../utils/preloadImages';

const frameNumber = (path) => Number(path.match(/(\d+)\.\w+$/)?.[1] ?? 0);
const sortedUrls = (modules) =>
  Object.keys(modules)
    .sort((a, b) => frameNumber(a) - frameNumber(b))
    .map((key) => modules[key]);

const DESKTOP_FRAMES = sortedUrls(
  import.meta.glob('../assets/hero-frame/*.webp', { eager: true, query: '?url', import: 'default' })
);
const MOBILE_FRAMES = sortedUrls(
  import.meta.glob('../assets/hero-frame-mobile/*.webp', { eager: true, query: '?url', import: 'default' })
);

// Phones, small tablets and data-saver users get the lighter 120-frame / 1280px set.
const pickFrameSet = () => {
  const small = Math.min(window.innerWidth, window.innerHeight) < 768;
  const saveData = navigator.connection?.saveData;
  return small || saveData ? MOBILE_FRAMES : DESKTOP_FRAMES;
};

const KEYFRAME_STEP = 16; // coarse frames we try to have before the intro finishes
const MAX_WAIT_MS = 1500; // …but never hold the intro back longer than this
const HARD_TIMEOUT_MS = 4000; // failsafe: open the site even if the network stalls

/**
 * Progressively loads the hero image sequence.
 * `ready` flips as soon as the first frame (plus a coarse set, or MAX_WAIT_MS) is in;
 * the remaining frames keep streaming in the background.
 */
export const useImageSequence = (onFrameLoaded) => {
  const [urls] = useState(pickFrameSet);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const framesRef = useRef([]);
  const onFrameRef = useRef(onFrameLoaded);

  useEffect(() => {
    onFrameRef.current = onFrameLoaded;
  });

  useEffect(() => {
    let cancelled = false;
    const count = urls.length;
    const frames = new Array(count);
    framesRef.current = frames;

    if (count === 0) {
      const t = setTimeout(() => setReady(true), 0);
      return () => clearTimeout(t);
    }

    const order = progressiveOrder(count);
    const initial = new Set(order.filter((i) => i % KEYFRAME_STEP === 0 || i === count - 1));
    let initialLoaded = 0;
    let firstLoaded = false;
    let waitedEnough = false;

    const tryReady = () => {
      if (!cancelled && firstLoaded && (waitedEnough || initialLoaded >= initial.size)) setReady(true);
    };
    const waitTimer = setTimeout(() => {
      waitedEnough = true;
      tryReady();
    }, MAX_WAIT_MS);
    const hardTimer = setTimeout(() => !cancelled && setReady(true), HARD_TIMEOUT_MS);

    loadInOrder(urls, order, {
      concurrency: 6,
      isCancelled: () => cancelled,
      onLoad: (index, img) => {
        frames[index] = img;
        if (index === 0) firstLoaded = true;
        if (initial.has(index)) {
          initialLoaded += 1;
          setProgress(Math.round((initialLoaded / initial.size) * 100));
        }
        onFrameRef.current?.(index);
        tryReady();
      },
    });

    return () => {
      cancelled = true;
      clearTimeout(waitTimer);
      clearTimeout(hardTimer);
    };
  }, [urls]);

  // Nearest frame that has already arrived (exact match first, then outward).
  const getFrame = useCallback((index) => {
    const frames = framesRef.current;
    if (frames[index]) return { img: frames[index], index };
    for (let d = 1; d < frames.length; d++) {
      if (frames[index - d]) return { img: frames[index - d], index: index - d };
      if (frames[index + d]) return { img: frames[index + d], index: index + d };
    }
    return null;
  }, []);

  return { progress, ready, frameCount: urls.length, getFrame };
};
