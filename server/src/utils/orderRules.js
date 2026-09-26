import { randomInt } from 'node:crypto';

// Keep in sync with the storefront (src/components/ui/CartDrawer.jsx, src/utils/orders.js).
export const FREE_SHIPPING_FROM = 500;
export const SHIPPING_FEE = 25;
export const CARRIER = 'WEARSUPER Luxe Express';
export const SERVICE = 'Signature Delivery · Fully insured';
// Orders can be cancelled until they ship (the "Shipped" step is 20 minutes after placing).
export const CANCEL_WINDOW_MS = 20 * 60 * 1000;

export const shippingFor = (subtotal) => (subtotal > 0 && subtotal < FREE_SHIPPING_FROM ? SHIPPING_FEE : 0);

const digits = (n) => Array.from({ length: n }, () => randomInt(10)).join('');

export const newOrderIds = (now = new Date()) => {
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, '');
  return {
    orderNumber: `WS-${ymd}-${digits(6)}`,
    trackingNumber: `WSX${digits(10)}`,
    invoiceNumber: `INV-${now.getFullYear()}-${digits(6)}`,
  };
};

export const isCancellable = (order, now = Date.now()) =>
  !order.cancelledAt && now - new Date(order.createdAt).getTime() < CANCEL_WINDOW_MS;
