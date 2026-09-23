// Central product catalog for the WEARSUPER luxury store (demo data).
// Every product's gallery and 360° view are built from its own photo (see getGallery).

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

// Public assets are referenced by URL.
const jacketImg = '/collection/jacket.webp';

export const CATEGORIES = ['All', 'Men', 'Women', 'Kids', 'Footwear', 'Outerwear'];

const C = {
  onyx: { name: 'Onyx', hex: '#111111' },
  ivory: { name: 'Ivory', hex: '#f4efe6' },
  graphite: { name: 'Graphite', hex: '#3a3a3c' },
  crimson: { name: 'Crimson / Onyx', hex: '#9e1420' },
  charcoal: { name: 'Charcoal Wash', hex: '#46464a' },
  cobalt: { name: 'Cobalt', hex: '#3f6fae' },
  forest: { name: 'Forest', hex: '#1f3b2c' },
  lilac: { name: 'Lilac', hex: '#b89ad0' },
};

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const SHOE_SIZES = ['7', '8', '9', '10', '11', '12'];
const KIDS_SIZES = ['2Y', '4Y', '6Y', '8Y'];

// The first colour of each product is the one photographed.
export const PRODUCTS = [
  {
    id: 'p1',
    cutout: true,
    name: 'Web-Slinger Zip Hoodie',
    brand: 'WEARSUPER Atelier',
    category: 'Men',
    price: 199,
    oldPrice: 249,
    image: shirtImg,
    rating: 4.9,
    reviews: 214,
    badge: 'Signature',
    sizes: APPAREL_SIZES,
    colors: [C.crimson, C.onyx],
    featured: true,
    description:
      'The hero piece of the Brand New Day collection. Heavyweight brushed fleece, contrast crimson sleeves and a raised spider emblem across the chest.',
    details: ['480 gsm brushed cotton fleece', 'Raised puff-print emblem', 'Two-way metal zip', 'Relaxed, boxy fit'],
  },
  {
    id: 'p2',
    cutout: true,
    name: 'Night Patrol Cargo Jogger',
    brand: 'WEARSUPER Atelier',
    category: 'Men',
    price: 149,
    oldPrice: null,
    image: pantImg,
    rating: 4.7,
    reviews: 168,
    badge: 'New',
    sizes: APPAREL_SIZES,
    colors: [C.onyx, C.graphite],
    featured: true,
    description:
      'Utility cut, luxury finish. A six-pocket cargo jogger in soft stretch twill with tapered, cuffed hems.',
    details: ['Stretch cotton twill', 'Six utility pockets', 'Elastic drawcord waist', 'Tapered leg, ribbed cuffs'],
  },
  {
    id: 'p3',
    cutout: true,
    name: 'Crimson Web High-Top',
    brand: 'WEARSUPER Motion',
    category: 'Footwear',
    price: 299,
    oldPrice: 349,
    image: shoesImg,
    rating: 5.0,
    reviews: 401,
    badge: 'Best Seller',
    sizes: SHOE_SIZES,
    colors: [C.crimson, C.onyx],
    featured: true,
    description:
      'A heritage court silhouette in crimson and onyx full-grain leather, built on a cushioned cupsole for all-day wear.',
    details: ['Full-grain leather upper', 'Padded high-top collar', 'Cushioned rubber cupsole', 'True to size'],
  },
  {
    id: 'p4',
    name: 'Venom Wash Oversized Tee',
    brand: 'WEARSUPER Heroes',
    category: 'Men',
    price: 95,
    oldPrice: null,
    image: shop1,
    rating: 4.6,
    reviews: 122,
    badge: 'Best Seller',
    sizes: APPAREL_SIZES,
    colors: [C.charcoal, C.onyx],
    featured: true,
    description: 'Hand acid-washed heavyweight jersey with an oversized spider graphic printed across the back.',
    details: ['260 gsm cotton jersey', 'Hand acid-wash finish', 'Oversized back print', 'Dropped shoulders'],
  },
  {
    id: 'p5',
    name: 'Steel Crest Striped Tee',
    brand: 'WEARSUPER Heroes',
    category: 'Men',
    price: 89,
    oldPrice: 110,
    image: shop2,
    rating: 4.8,
    reviews: 289,
    badge: 'Sale',
    sizes: APPAREL_SIZES,
    colors: [C.cobalt, C.ivory],
    featured: true,
    description: 'A bold crest on cobalt cotton, finished with varsity stripes on the sleeves. Classic hero energy.',
    details: ['220 gsm combed cotton', 'High-density crest print', 'Varsity sleeve stripes', 'Regular fit'],
  },
  {
    id: 'p6',
    name: 'Midnight Bat Emblem Tee',
    brand: 'WEARSUPER Heroes',
    category: 'Men',
    price: 85,
    oldPrice: null,
    image: shop3,
    rating: 4.7,
    reviews: 341,
    badge: 'Iconic',
    sizes: APPAREL_SIZES,
    colors: [C.ivory, C.onyx],
    featured: true,
    description: 'Minimal and razor-sharp: a single bat emblem on an ivory boxy tee. Understated, instantly recognisable.',
    details: ['240 gsm cotton jersey', 'Crisp emblem print', 'Boxy oversized fit', 'Pre-shrunk'],
  },
  {
    id: 'p7',
    name: 'Arc Glow Emblem Tee',
    brand: 'WEARSUPER Heroes',
    category: 'Men',
    price: 99,
    oldPrice: 135,
    image: shop4,
    rating: 4.5,
    reviews: 98,
    badge: 'Sale',
    sizes: APPAREL_SIZES,
    colors: [C.onyx, C.graphite],
    featured: true,
    description: 'An arc-reactor emblem that seems to glow against deep onyx cotton. Made for the after-dark crowd.',
    details: ['220 gsm combed cotton', 'Luminous-effect print', 'Crew neck', 'Regular fit'],
  },
  {
    id: 'p8',
    name: 'Shield Break Graphic Tee',
    brand: 'WEARSUPER Heroes',
    category: 'Women',
    price: 89,
    oldPrice: null,
    image: shop5,
    rating: 4.9,
    reviews: 512,
    badge: 'Iconic',
    sizes: APPAREL_SIZES,
    colors: [C.ivory, C.onyx],
    featured: true,
    description: 'A star shield bursting through the fabric in a hyper-real cracked-wall print. Relaxed and effortless.',
    details: ['230 gsm organic cotton', '3D cracked-effect print', 'Relaxed fit', 'Soft enzyme wash'],
  },
  {
    id: 'p9',
    name: 'Spider Emblem Oversized Tee',
    brand: 'WEARSUPER Heroes',
    category: 'Men',
    price: 95,
    oldPrice: null,
    image: shop6,
    rating: 4.6,
    reviews: 143,
    badge: 'New',
    sizes: APPAREL_SIZES,
    colors: [C.ivory, C.onyx],
    featured: true,
    description: 'A crimson spider emblem on an off-white heavyweight tee: the collection mark in its purest form.',
    details: ['260 gsm cotton jersey', 'Crimson puff-print emblem', 'Oversized fit', 'Ribbed crew neck'],
  },
  {
    id: 'p10',
    name: 'Midnight Tech Jacket',
    brand: 'WEARSUPER Atelier',
    category: 'Outerwear',
    price: 449,
    oldPrice: 520,
    image: jacketImg,
    rating: 4.9,
    reviews: 76,
    badge: 'Signature',
    sizes: APPAREL_SIZES,
    colors: [C.onyx, C.graphite],
    featured: true,
    description: 'City armour for night hours. A water-repellent technical shell with a stand collar and sealed zips.',
    details: ['Water-repellent tech shell', 'Stand collar, sealed zips', 'Articulated sleeves', 'Fully lined'],
  },
  {
    id: 'p11',
    name: 'Santiago Tee & Pleat Skirt Set',
    brand: 'WEARSUPER Femme',
    category: 'Women',
    price: 189,
    oldPrice: null,
    image: womenImg,
    rating: 4.8,
    reviews: 134,
    badge: 'New',
    sizes: APPAREL_SIZES,
    colors: [C.ivory, C.onyx],
    featured: true,
    description: 'A crisp logo tee paired with a knife-pleat mini skirt. Riviera-ready and weekend-perfect.',
    details: ['Cotton jersey tee', 'Knife-pleat twill skirt', 'Hidden side zip', 'Sold as a set'],
  },
  {
    id: 'p12',
    name: 'Lilac Sailor-Collar Dress',
    brand: 'WEARSUPER Kids',
    category: 'Kids',
    price: 89,
    oldPrice: 110,
    image: kidsImg,
    rating: 4.9,
    reviews: 210,
    badge: 'Sale',
    sizes: KIDS_SIZES,
    colors: [C.lilac, C.ivory],
    featured: true,
    description: 'A sweet sailor collar, soft puffed sleeves and a swing silhouette made for twirling.',
    details: ['Organic cotton poplin', 'Oversized sailor collar', 'Puff sleeves, button cuffs', 'Machine washable'],
  },
  {
    id: 'p13',
    name: 'Evergreen Rugby Polo',
    brand: 'WEARSUPER Atelier',
    category: 'Men',
    price: 139,
    oldPrice: null,
    image: menImg,
    rating: 4.7,
    reviews: 91,
    badge: 'New',
    sizes: APPAREL_SIZES,
    colors: [C.forest, C.ivory],
    featured: true,
    description: 'Deep forest heavyweight jersey with a crisp white collar: a relaxed rugby polo with clubhouse polish.',
    details: ['300 gsm cotton jersey', 'Woven cotton-twill collar', 'Two-button placket', 'Oversized fit'],
  },
];

export const getFeatured = () => PRODUCTS.filter((p) => p.featured);

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

export const getRelated = (product, count = 4) => {
  const same = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category);
  const rest = PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category);
  return [...same, ...rest].slice(0, count);
};

export const getById = (id) => PRODUCTS.find((p) => p.id === id);

export const searchProducts = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
};

export const formatPrice = (value) =>
  `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
