// Order numbers, tracking numbers and a time-based shipment timeline (demo — no real courier).

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export const CARRIER = 'WEARSUPER Luxe Express';
export const SERVICE = 'Signature Delivery · Fully insured';

const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');

export const newOrderIds = (now = new Date()) => {
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, '');
  return {
    id: `WS-${ymd}-${digits(4)}`,
    trackingNumber: `WSX${digits(10)}`,
    invoiceNumber: `INV-${now.getFullYear()}-${digits(6)}`,
  };
};

// Each step becomes "done" once its offset from the order time has passed.
const STEPS = [
  { key: 'placed', label: 'Order placed', offset: 0, detail: () => 'We have received your order.' },
  { key: 'confirmed', label: 'Payment confirmed', offset: 20 * SEC, detail: () => 'Payment authorised and order confirmed.' },
  { key: 'packed', label: 'Hand-packed', offset: 3 * MIN, detail: () => 'Wrapped in signature packaging at our atelier.' },
  { key: 'shipped', label: 'Shipped', offset: 20 * MIN, detail: () => `Handed over to ${CARRIER}.` },
  { key: 'transit', label: 'In transit', offset: 8 * HOUR, detail: (o) => `Arrived at the ${o.address?.city || 'regional'} delivery hub.` },
  { key: 'out', label: 'Out for delivery', offset: 2 * DAY + 3 * HOUR, detail: () => 'Your courier is on the way.' },
  { key: 'delivered', label: 'Delivered', offset: 2 * DAY + 9 * HOUR, detail: (o) => `Signed for by ${o.address?.name?.split(' ')[0] || 'you'}.` },
];

const CANCELLABLE_UNTIL = 'shipped';

export const getTracking = (order, now = Date.now()) => {
  const start = new Date(order.date).getTime();

  if (order.cancelledAt) {
    const cancelledAt = new Date(order.cancelledAt).getTime();
    const steps = STEPS.filter((s) => start + s.offset <= cancelledAt).map((s) => ({
      key: s.key, label: s.label, detail: s.detail(order), at: start + s.offset, done: true,
    }));
    steps.push({ key: 'cancelled', label: 'Cancelled', detail: 'Order cancelled — a full refund has been issued.', at: cancelledAt, done: true });
    return { steps, current: steps.length - 1, status: 'Cancelled', progress: 1, cancelled: true, delivered: false, cancellable: false, eta: null };
  }

  const steps = STEPS.map((s) => ({
    key: s.key, label: s.label, detail: s.detail(order), at: start + s.offset, done: now >= start + s.offset,
  }));
  const current = steps.reduce((acc, s, i) => (s.done ? i : acc), 0);
  const shippedIndex = STEPS.findIndex((s) => s.key === CANCELLABLE_UNTIL);

  return {
    steps,
    current,
    status: steps[current].label,
    progress: current / (steps.length - 1),
    cancelled: false,
    delivered: current === steps.length - 1,
    cancellable: current < shippedIndex,
    eta: steps[steps.length - 1].at,
  };
};

export const formatDate = (ts, opts = {}) =>
  new Date(ts).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', ...opts });

export const formatDateTime = (ts) =>
  new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
