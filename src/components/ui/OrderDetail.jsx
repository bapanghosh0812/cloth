import { useEffect, useState } from 'react';
import Modal, { CloseButton } from './Modal';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../data/products';
import { getTracking, formatDate, formatDateTime } from '../../utils/orders';

const CopyChip = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button onClick={copy} className="text-[10px] uppercase tracking-widest text-[#c6a15b] border border-[#c6a15b]/40 rounded-full px-2.5 py-1 hover:bg-[#c6a15b] hover:text-black transition-colors">
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

const StatusBadge = ({ tracking }) => {
  const tone = tracking.cancelled
    ? 'bg-rose-500/15 text-rose-300 border-rose-400/30'
    : tracking.delivered
      ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30'
      : 'bg-[#c6a15b]/15 text-[#e2c78e] border-[#c6a15b]/35';
  return (
    <span className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border ${tone}`}>
      {!tracking.cancelled && !tracking.delivered && <span className="w-1.5 h-1.5 rounded-full bg-[#c6a15b] animate-pulse" />}
      {tracking.status}
    </span>
  );
};

export { StatusBadge };

const OrderTracking = ({ order }) => {
  const { closeModal, openReceipt, cancelOrder } = useStore();
  const [now, setNow] = useState(() => Date.now());

  // Live tracking: re-evaluate the timeline every 10s while open.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);

  const tracking = getTracking(order, now);
  const a = order.address || {};
  const itemsCount = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <Modal open onClose={closeModal} maxWidth="max-w-4xl" label={`Order ${order.id}`}>
      <CloseButton onClose={closeModal} />

      {/* Header */}
      <div className="px-5 sm:px-8 pt-7 pb-6 border-b border-white/10 bg-[radial-gradient(ellipse_at_top_left,rgba(198,161,91,0.14),transparent_60%)]">
        <p className="text-[#c6a15b] text-[11px] font-semibold uppercase tracking-[0.3em]">Order tracking</p>
        <div className="flex flex-wrap items-center gap-3 mt-2 pr-10">
          <h2 className="font-display text-2xl sm:text-3xl text-white">{order.id}</h2>
          <StatusBadge tracking={tracking} />
        </div>
        <p className="text-white/45 text-sm mt-1">Placed {formatDateTime(order.date)} · {itemsCount} {itemsCount === 1 ? 'item' : 'items'}</p>

        {/* Key facts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Tracking number</p>
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <p className="text-white font-semibold tracking-wider text-sm sm:text-base">{order.trackingNumber || 'Pending'}</p>
              {order.trackingNumber && <CopyChip value={order.trackingNumber} />}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Carrier</p>
            <p className="text-white font-semibold text-sm mt-1.5">{order.carrier || 'WEARSUPER Luxe Express'}</p>
            <p className="text-white/40 text-xs">{order.service || 'Signature Delivery'}</p>
          </div>
          <div className="rounded-2xl border border-[#c6a15b]/30 bg-[#c6a15b]/[0.06] p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#e2c78e]/70">
              {tracking.cancelled ? 'Refund' : tracking.delivered ? 'Delivered' : 'Estimated delivery'}
            </p>
            <p className="text-white font-display text-xl mt-1">
              {tracking.cancelled ? formatPrice(order.total) : formatDate(tracking.delivered ? tracking.steps[tracking.current].at : tracking.eta)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {!tracking.cancelled && (
          <div className="mt-7">
            <div className="relative h-1.5 rounded-full bg-white/10">
              <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#a17c2e] via-[#c6a15b] to-[#e2c78e] transition-all duration-700" style={{ width: `${tracking.progress * 100}%` }} />
              {tracking.steps.map((s, i) => (
                <span
                  key={s.key}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${s.done ? 'bg-[#c6a15b] border-[#c6a15b]' : 'bg-[#0c0c0c] border-white/25'} ${i === tracking.current ? 'ws-ping' : ''}`}
                  style={{ left: `${(i / (tracking.steps.length - 1)) * 100}%` }}
                />
              ))}
            </div>
            {/* Labels sit under their own dots */}
            <div className="hidden sm:block relative h-4 mt-3 text-[10px] uppercase tracking-widest">
              {tracking.steps.map((s, i) => {
                const label = { placed: 'Placed', packed: 'Packed', shipped: 'Shipped', out: 'Out for delivery', delivered: 'Delivered' }[s.key];
                if (!label) return null;
                const last = i === tracking.steps.length - 1;
                return (
                  <span
                    key={s.key}
                    className={`absolute whitespace-nowrap ${s.done ? 'text-[#e2c78e]' : 'text-white/35'}`}
                    style={{ left: `${(i / (tracking.steps.length - 1)) * 100}%`, transform: i === 0 ? 'none' : last ? 'translateX(-100%)' : 'translateX(-50%)' }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">
        {/* Timeline */}
        <div className="px-5 sm:px-8 py-7 md:border-r border-white/10">
          <h3 className="text-white text-sm font-semibold uppercase tracking-[0.2em] mb-6">Shipment progress</h3>
          <ol className="relative">
            {[...tracking.steps].reverse().map((s, idx, arr) => {
              const isCurrent = s.key === tracking.steps[tracking.current].key;
              return (
                <li key={s.key} className="relative pl-9 pb-7 last:pb-0">
                  {idx < arr.length - 1 && <span className={`absolute left-[11px] top-6 bottom-0 w-px ${s.done ? 'bg-[#c6a15b]/50' : 'bg-white/10'}`} />}
                  <span
                    className={`absolute left-0 top-0.5 w-[23px] h-[23px] rounded-full flex items-center justify-center border-2 ${
                      s.key === 'cancelled' ? 'border-rose-400 bg-rose-500/20 text-rose-300' : s.done ? 'border-[#c6a15b] bg-[#c6a15b] text-black' : 'border-white/20 bg-[#0c0c0c] text-white/30'
                    } ${isCurrent && !tracking.delivered && !tracking.cancelled ? 'ws-ping' : ''}`}
                  >
                    {s.done && s.key !== 'cancelled' && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                    {s.key === 'cancelled' && '×'}
                  </span>
                  <p className={`text-sm font-semibold ${s.done ? 'text-white' : 'text-white/40'}`}>
                    {s.label}
                    {isCurrent && <span className="ml-2 text-[10px] uppercase tracking-widest text-[#c6a15b]">Latest</span>}
                  </p>
                  <p className={`text-xs mt-0.5 ${s.done ? 'text-white/55' : 'text-white/30'}`}>{s.detail}</p>
                  <p className="text-[11px] mt-1 text-white/35">{s.done ? formatDateTime(s.at) : `Expected ${formatDate(s.at)}`}</p>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Order info */}
        <div className="px-5 sm:px-8 py-7 space-y-7">
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-[0.2em] mb-3">Delivering to</h3>
            <p className="text-white text-sm font-semibold">{a.name}</p>
            <p className="text-white/55 text-sm">{a.address}</p>
            <p className="text-white/55 text-sm">{[a.city, a.zip].filter(Boolean).join(' ')}, {a.country}</p>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-[0.2em] mb-3">Items</h3>
            <div className="space-y-3">
              {order.items.map((it) => (
                <div key={it.lineKey} className="flex items-center gap-3">
                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                    <img src={it.image} alt={it.name} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{it.name}</p>
                    <p className="text-white/40 text-xs">{it.size} · {it.color} · Qty {it.qty}</p>
                  </div>
                  <span className="text-white text-sm">{formatPrice(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm space-y-2">
            <p className="flex justify-between text-white/55"><span>Subtotal</span><span className="text-white">{formatPrice(order.subtotal)}</span></p>
            <p className="flex justify-between text-white/55"><span>Shipping</span><span className="text-white">{order.shipping ? formatPrice(order.shipping) : 'Complimentary'}</span></p>
            <p className="flex justify-between text-white/55"><span>Paid with</span><span className="text-white">{order.payment.brand} •••• {order.payment.last4}</span></p>
            <p className="flex justify-between pt-2 border-t border-white/10 text-white font-bold"><span>{tracking.cancelled ? 'Refunded' : 'Total'}</span><span>{formatPrice(order.total)}</span></p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => openReceipt(order.id)}
              className="btn-sheen w-full py-3.5 rounded-xl bg-[#c6a15b] text-black text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#d8b877] transition-colors"
            >
              View receipt
            </button>
            {tracking.cancellable && (
              <button
                onClick={() => cancelOrder(order.id)}
                className="w-full py-3.5 rounded-xl border border-white/15 text-white/70 text-sm font-semibold uppercase tracking-[0.15em] hover:border-rose-400/60 hover:text-rose-300 transition-colors"
              >
                Cancel order
              </button>
            )}
            <button
              onClick={() => { closeModal(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="text-white/45 text-xs hover:text-[#c6a15b] transition-colors mt-1"
            >
              Need help with this order? Contact concierge →
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Mounted only while open so the timeline is evaluated against the current time.
const OrderDetail = () => {
  const { activeModal, activeOrder } = useStore();
  if (activeModal !== 'order' || !activeOrder) return null;
  return <OrderTracking key={activeOrder.id} order={activeOrder} />;
};

export default OrderDetail;
