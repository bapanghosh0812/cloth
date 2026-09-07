// Central product catalog for the WEARSUPER luxury store (demo data).
// Images are reused from the existing asset folders so nothing extra is needed.

import shirtImg from '../assets/hero_product/shirt.png';
import pantImg from '../assets/hero_product/pant.png';
import shoesImg from '../assets/hero_product/shoes.png';

import shop1 from '../assets/shop/image.png';
import shop2 from '../assets/shop/image copy.png';
import shop3 from '../assets/shop/image copy 2.png';
import shop4 from '../assets/shop/image copy 3.png';
import shop5 from '../assets/shop/image copy 4.png';
import shop6 from '../assets/shop/image copy 5.png';

import menImg from '../assets/collection/men.png';
import womenImg from '../assets/collection/women.png';
import kidsImg from '../assets/collection/kids.png';

// Public assets are referenced by URL.
const jacketImg = '/collection/jacket.png';
const pantsImg = '/collection/pants.png';
const sneakerImg = '/collection/sneaker.png';

export const CATEGORIES = ['All', 'Men', 'Women', 'Kids', 'Footwear', 'Outerwear'];

const NEUTRALS = [
  { name: 'Onyx', hex: '#111111' },
  { name: 'Ivory', hex: '#f4efe6' },
  { name: 'Champagne', hex: '#c6a15b' },
];

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const SHOE_SIZES = ['7', '8', '9', '10', '11', '12'];

export const PRODUCTS = [
  {
    id: 'p1',
    name: 'Aurelia Silk Shirt',
    brand: 'WEARSUPER Atelier',
    category: 'Men',
    price: 199,
    oldPrice: 249,
    image: shirtImg,
    images: [shirtImg, shop1, shop3],
    rating: 4.9,
    reviews: 214,
    badge: 'Signature',
    sizes: APPAREL_SIZES,
    colors: NEUTRALS,
    featured: true,
    description:
      'A future-ready silhouette cut from mulberry silk. Tailored to move, finished by hand, made to be noticed.',
    details: ['100% Mulberry silk', 'Hand-finished seams', 'Relaxed premium fit', 'Dry clean only'],
  },
  {
    id: 'p2',
    name: 'Meridian Tailored Trouser',
    brand: 'WEARSUPER Atelier',
    category: 'Men',
    price: 149,
    oldPrice: null,
    image: pantImg,
    images: [pantImg, pantsImg, shop4],
    rating: 4.7,
    reviews: 168,
    badge: 'New',
    sizes: APPAREL_SIZES,
    colors: NEUTRALS,
    featured: true,
    description:
      'The trouser that anchors every look. Structured drape, invisible comfort, endless versatility.',
    details: ['Italian wool blend', 'Hidden stretch waistband', 'Tapered leg', 'Machine wash cold'],
  },
  {
    id: 'p3',
    name: 'Velocity Runner',
    brand: 'WEARSUPER Motion',
    category: 'Footwear',
    price: 299,
    oldPrice: 349,
    image: shoesImg,
    images: [shoesImg, sneakerImg, shop2],
    rating: 5.0,
    reviews: 401,
    badge: 'Best Seller',
    sizes: SHOE_SIZES,
    colors: NEUTRALS,
    featured: true,
    description:
      'Engineered for the city and beyond. Responsive cushioning wrapped in a sculpted, weightless upper.',
    details: ['Responsive foam midsole', 'Recycled knit upper', 'Grip-lock outsole', 'True to size'],
  },
  {
    id: 'p4',
    name: 'Court Vision Leather',
    brand: 'Nike',
    category: 'Footwear',
    price: 156,
    oldPrice: null,
    image: shop1,
    images: [shop1, shop3, sneakerImg],
    rating: 4.6,
    reviews: 122,
    badge: 'Best Seller',
    sizes: SHOE_SIZES,
    colors: NEUTRALS,
    featured: true,
    description: 'Classic hoops style rebuilt in durable premium leather with a clean, timeless finish.',
    details: ['Full-grain leather', 'Padded collar', 'Rubber cupsole', 'True to size'],
  },
  {
    id: 'p5',
    name: 'Air Max Pulse',
    brand: 'Nike',
    category: 'Footwear',
    price: 180,
    oldPrice: 210,
    image: shop2,
    images: [shop2, shop5, sneakerImg],
    rating: 4.8,
    reviews: 289,
    badge: 'New',
    sizes: SHOE_SIZES,
    colors: NEUTRALS,
    featured: true,
    description: 'Push past your limits with bold, responsive Air cushioning and an urban-ready profile.',
    details: ['Nike Air unit', 'Breathable mesh', 'Lightweight build', 'True to size'],
  },
  {
    id: 'p6',
    name: 'Dunk Low Retro',
    brand: 'Nike',
    category: 'Footwear',
    price: 130,
    oldPrice: null,
    image: shop3,
    images: [shop3, shop1, sneakerImg],
    rating: 4.7,
    reviews: 341,
    badge: 'Iconic',
    sizes: SHOE_SIZES,
    colors: NEUTRALS,
    featured: true,
    description: 'Born on the hardwood, taken to the streets. A heritage silhouette in premium colours.',
    details: ['Leather overlays', 'Foam midsole', 'Padded low-cut collar', 'True to size'],
  },
  {
    id: 'p7',
    name: 'Blazer Mid Vintage',
    brand: 'Nike',
    category: 'Footwear',
    price: 105,
    oldPrice: 135,
    image: shop4,
    images: [shop4, shop6, sneakerImg],
    rating: 4.5,
    reviews: 98,
    badge: 'Sale',
    sizes: SHOE_SIZES,
    colors: NEUTRALS,
    featured: true,
    description: 'Old-school basketball attitude with a broken-in vintage midsole and clean lines.',
    details: ['Vintage midsole', 'Leather upper', 'Exposed foam tongue', 'True to size'],
  },
  {
    id: 'p8',
    name: 'Air Force 1 Heritage',
    brand: 'Nike',
    category: 'Footwear',
    price: 115,
    oldPrice: null,
    image: shop5,
    images: [shop5, shop2, sneakerImg],
    rating: 4.9,
    reviews: 512,
    badge: 'Iconic',
    sizes: SHOE_SIZES,
    colors: NEUTRALS,
    featured: true,
    description: 'The radiance lives on. The b-ball original that never left the conversation.',
    details: ['Full-grain leather', 'Air-Sole unit', 'Perforated toe', 'True to size'],
  },
  {
    id: 'p9',
    name: 'Zoom Vomero 5',
    brand: 'Nike',
    category: 'Footwear',
    price: 160,
    oldPrice: null,
    image: shop6,
    images: [shop6, shop4, sneakerImg],
    rating: 4.6,
    reviews: 143,
    badge: 'New',
    sizes: SHOE_SIZES,
    colors: NEUTRALS,
    featured: true,
    description: 'Carve a new lane with layered textures, plush cushioning and a complex, retro-runner design.',
    details: ['ZoomX-inspired cushioning', 'Layered mesh upper', 'Chunky sole', 'True to size'],
  },
  {
    id: 'p10',
    name: 'Eclipse Wool Overcoat',
    brand: 'WEARSUPER Atelier',
    category: 'Outerwear',
    price: 449,
    oldPrice: 520,
    image: jacketImg,
    images: [jacketImg, menImg, shop3],
    rating: 4.9,
    reviews: 76,
    badge: 'Signature',
    sizes: APPAREL_SIZES,
    colors: NEUTRALS,
    featured: false,
    description: 'A sculptural overcoat in double-faced wool. Warmth, drama and quiet luxury in one layer.',
    details: ['Double-faced wool', 'Fully lined', 'Concealed placket', 'Dry clean only'],
  },
  {
    id: 'p11',
    name: 'Seraphine Draped Dress',
    brand: 'WEARSUPER Atelier',
    category: 'Women',
    price: 289,
    oldPrice: null,
    image: womenImg,
    images: [womenImg, shop5, shop2],
    rating: 4.8,
    reviews: 134,
    badge: 'New',
    sizes: APPAREL_SIZES,
    colors: NEUTRALS,
    featured: false,
    description: 'Fluid draping meets architectural structure. Designed to command any room, effortlessly.',
    details: ['Liquid satin', 'Bias-cut drape', 'Concealed zip', 'Dry clean only'],
  },
  {
    id: 'p12',
    name: 'Little Legend Set',
    brand: 'WEARSUPER Kids',
    category: 'Kids',
    price: 89,
    oldPrice: 110,
    image: kidsImg,
    images: [kidsImg, shop6, sneakerImg],
    rating: 4.9,
    reviews: 210,
    badge: 'Sale',
    sizes: ['2Y', '4Y', '6Y', '8Y'],
    colors: NEUTRALS,
    featured: false,
    description: 'Playground-ready and premium-soft. A two-piece set that keeps up with big adventures.',
    details: ['Organic cotton', 'Reinforced knees', 'Easy-pull waist', 'Machine wash warm'],
  },
];

export const getFeatured = () => PRODUCTS.filter((p) => p.featured);

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
