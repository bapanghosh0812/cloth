import mongoose from 'mongoose';

export const PRODUCT_CATEGORIES = ['Men', 'Women', 'Kids', 'Footwear', 'Outerwear'];

const colourSchema = new mongoose.Schema(
  { name: { type: String, required: true }, hex: { type: String, required: true } },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // Public id used by the storefront and in orders, e.g. "p1".
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: PRODUCT_CATEGORIES },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null, min: 0 },
    // Key of the image bundled with the frontend (see src/data/products.js).
    imageKey: { type: String, required: true },
    cutout: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    badge: { type: String, default: null },
    sizes: { type: [String], default: [] },
    colors: { type: [colourSchema], default: [] },
    featured: { type: Boolean, default: true },
    description: { type: String, default: '' },
    details: { type: [String], default: [] },
    position: { type: Number, default: 0 }, // display order in the shop
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PUBLIC_FIELDS = ['name', 'brand', 'category', 'price', 'oldPrice', 'imageKey', 'cutout', 'rating', 'reviews', 'badge', 'sizes', 'colors', 'featured', 'description', 'details'];

productSchema.set('toJSON', {
  transform: (_doc, ret) => ({ id: ret.sku, ...Object.fromEntries(PUBLIC_FIELDS.map((k) => [k, ret[k]])) }),
});

export const Product = mongoose.model('Product', productSchema);
