import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    // Snapshot at the time of purchase, so later catalogue edits never change past orders.
    name: { type: String, required: true },
    brand: { type: String, required: true },
    imageKey: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    size: { type: String, required: true },
    color: { type: String, required: true },
    qty: { type: Number, required: true, min: 1, max: 10 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 254 },
    address: { type: String, required: true, maxlength: 200 },
    city: { type: String, required: true, maxlength: 120 },
    zip: { type: String, required: true, maxlength: 20 },
    country: { type: String, required: true, maxlength: 120 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    trackingNumber: { type: String, required: true, unique: true },
    invoiceNumber: { type: String, required: true, unique: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    address: { type: addressSchema, required: true },
    // Simulated payment: only the card brand and last four digits are ever stored.
    payment: {
      brand: { type: String, required: true },
      last4: { type: String, required: true, match: /^\d{4}$/ },
    },
    carrier: { type: String, required: true },
    service: { type: String, required: true },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Shape the storefront already understands (see src/utils/orders.js on the frontend).
orderSchema.methods.toClient = function toClient() {
  return {
    id: this.orderNumber,
    trackingNumber: this.trackingNumber,
    invoiceNumber: this.invoiceNumber,
    date: this.createdAt,
    carrier: this.carrier,
    service: this.service,
    items: this.items.map((it) => ({
      lineKey: `${it.sku}__${it.size}__${it.color}`,
      id: it.sku,
      name: it.name,
      brand: it.brand,
      imageKey: it.imageKey,
      price: it.price,
      size: it.size,
      color: it.color,
      qty: it.qty,
    })),
    subtotal: this.subtotal,
    shipping: this.shipping,
    total: this.total,
    address: this.address,
    payment: { brand: this.payment.brand, last4: this.payment.last4 },
    cancelledAt: this.cancelledAt,
  };
};

export const Order = mongoose.model('Order', orderSchema);
