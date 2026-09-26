import { Router } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, isEmail, text } from '../utils/http.js';
import { CANCEL_WINDOW_MS, CARRIER, SERVICE, isCancellable, newOrderIds, shippingFor } from '../utils/orderRules.js';

const CARD_BRANDS = ['Visa', 'Mastercard', 'Amex', 'Discover', 'Card'];

const parseLines = (items) => {
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, 'Your bag is empty');
  if (items.length > 50) throw new HttpError(400, 'Too many items in one order');
  return items.map((it) => {
    const qty = Number(it?.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) throw new HttpError(400, 'Quantity must be between 1 and 10');
    return {
      sku: text(it?.productId, 'Product', { max: 40 }),
      size: text(it?.size, 'Size', { max: 10 }),
      color: text(it?.color, 'Colour', { max: 40 }),
      qty,
    };
  });
};

const parseAddress = (a) => {
  const email = String(a?.email ?? '').trim();
  if (!isEmail(email)) throw new HttpError(400, 'Enter a valid email for your order updates');
  return {
    name: text(a?.name, 'Full name', { max: 120 }),
    email,
    address: text(a?.address, 'Address', { max: 200 }),
    city: text(a?.city, 'City', { max: 120 }),
    zip: text(a?.zip, 'ZIP / Postcode', { max: 20 }),
    country: text(a?.country, 'Country', { max: 120 }),
  };
};

export const ordersRouter = (config) => {
  const router = Router();
  router.use(requireAuth(config));

  // Place an order from the bag. Prices always come from the database, never from the browser.
  router.post('/', async (req, res) => {
    const lines = parseLines(req.body?.items);
    const address = parseAddress(req.body?.address);

    const last4 = String(req.body?.payment?.last4 ?? '');
    if (!/^\d{4}$/.test(last4)) throw new HttpError(400, 'Payment details are incomplete');
    const brand = CARD_BRANDS.includes(req.body?.payment?.brand) ? req.body.payment.brand : 'Card';

    const skus = [...new Set(lines.map((l) => l.sku))];
    const products = await Product.find({ sku: mongoose.trusted({ $in: skus }), active: true });
    const bySku = new Map(products.map((p) => [p.sku, p]));

    // Merge duplicate lines and validate each against the catalogue.
    const merged = new Map();
    for (const l of lines) {
      const p = bySku.get(l.sku);
      if (!p) throw new HttpError(400, 'Some items in your bag are no longer available');
      if (!p.sizes.includes(l.size)) throw new HttpError(400, `${p.name} is not available in size ${l.size}`);
      if (!p.colors.some((c) => c.name === l.color)) throw new HttpError(400, `${p.name} is not available in ${l.color}`);

      const key = `${p.sku}__${l.size}__${l.color}`;
      const qty = Math.min(10, (merged.get(key)?.qty || 0) + l.qty);
      merged.set(key, {
        product: p._id, sku: p.sku, name: p.name, brand: p.brand, imageKey: p.imageKey,
        price: p.price, size: l.size, color: l.color, qty,
      });
    }

    const items = [...merged.values()];
    const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const shipping = shippingFor(subtotal);

    // Order/tracking numbers are random; retry on the (very unlikely) duplicate.
    let order;
    for (let attempt = 0; !order; attempt++) {
      try {
        order = await Order.create({
          user: req.user._id,
          ...newOrderIds(),
          items,
          subtotal,
          shipping,
          total: subtotal + shipping,
          address,
          payment: { brand, last4 },
          carrier: CARRIER,
          service: SERVICE,
        });
      } catch (err) {
        if (err?.code !== 11000 || attempt >= 2) throw err;
      }
    }

    res.status(201).json({ order: order.toClient() });
  });

  // The signed-in user's orders, newest first.
  router.get('/', async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ orders: orders.map((o) => o.toClient()) });
  });

  router.get('/:id', async (req, res) => {
    const order = await Order.findOne({ user: req.user._id, orderNumber: String(req.params.id) });
    if (!order) throw new HttpError(404, 'Order not found');
    res.json({ order: order.toClient() });
  });

  // Cancel before it ships. Conditional update, so two clicks can't race each other.
  router.patch('/:id/cancel', async (req, res) => {
    const filter = { user: req.user._id, orderNumber: String(req.params.id) };
    const order = await Order.findOneAndUpdate(
      { ...filter, cancelledAt: null, createdAt: mongoose.trusted({ $gt: new Date(Date.now() - CANCEL_WINDOW_MS) }) },
      { $set: { cancelledAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (order) return res.json({ order: order.toClient() });

    const existing = await Order.findOne(filter);
    if (!existing) throw new HttpError(404, 'Order not found');
    if (existing.cancelledAt) throw new HttpError(409, 'This order is already cancelled');
    if (!isCancellable(existing)) throw new HttpError(409, 'This order has already shipped and can no longer be cancelled');
    throw new HttpError(409, 'This order could not be cancelled — please try again');
  });

  return router;
};
