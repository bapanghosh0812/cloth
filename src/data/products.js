// Product images + helpers. Product *data* comes from the API (GET /api/products); the shared
// catalogue (shared/catalog.js) is bundled only so the shop renders instantly before the API answers.
// Every product's gallery and 360° view are built from its own photo (see getGallery).

import { CATALOG } from '../../shared/catalog.js';

import shirtImg from '../assets/hero_product/shirt.webp';
import pantImg from '../assets/hero_product/pant.webp';
import shoesImg from '../assets/hero_product/shoes.webp';

import shop1 from '../assets/shop/shop-1.webp';
import shop2 from '../assets/shop/shop-2.webp';
import shop3 from '../assets/shop/shop-3.webp';
import shop4 from '../assets/shop/shop-4.webp';
import shop5 from '../assets/shop/shop-5.webp';
import shop6 from '../assets/shop/shop-6.webp';

import menImg from '../assets/collection/men.webp';
import womenImg from '../assets/collection/women.webp';
import kidsImg from '../assets/collection/kids.webp';

export { CATEGORIES } from '../../shared/catalog.js';

// imageKey (stored in the database) → bundled image URL.
const IMAGES = {
  shirt: shirtImg,
  pant: pantImg,
  shoes: shoesImg,
  'shop-1': shop1,
  'shop-2': shop2,
  'shop-3': shop3,
  'shop-4': shop4,
  'shop-5': shop5,
  'shop-6': shop6,
  men: menImg,
  women: womenImg,
  kids: kidsImg,
  jacket: '/collection/jacket.webp', // public asset
};

export const imageFor = (key, fallback) => IMAGES[key] || fallback || shop1;

export const hydrateProduct = (p) => ({ ...p, image: imageFor(p.imageKey) });

// Order lines carry an imageKey; resolve it to the current bundled file.
export const hydrateOrder = (o) => ({ ...o, items: o.items.map((it) => ({ ...it, image: imageFor(it.imageKey, it.image) })) });

export const FALLBACK_PRODUCTS = CATALOG.map(hydrateProduct);

// Six studio views of the same photo: full shot plus framed close-ups of different regions.
export const GALLERY_VIEWS = [
  { label: 'Full view', zoom: 1, focus: '50% 50%', fit: 'contain' },
  { label: 'Close-up', zoom: 1.45, focus: '50% 45%' },
  { label: 'Upper detail', zoom: 2, focus: '50% 20%' },
  { label: 'Lower detail', zoom: 2, focus: '50% 82%' },
  { label: 'Texture', zoom: 2.6, focus: '36% 52%' },
  { label: 'Finish', zoom: 2.6, focus: '66% 42%' },
];

export const getGallery = (product) => GALLERY_VIEWS.map((v) => ({ ...v, src: product.image }));

export const getRelated = (products, product, count = 4) => {
  const same = products.filter((p) => p.id !== product.id && p.category === product.category);
  const rest = products.filter((p) => p.id !== product.id && p.category !== product.category);
  return [...same, ...rest].slice(0, count);
};

export const searchProducts = (products, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
};

export const formatPrice = (value) =>
  `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
