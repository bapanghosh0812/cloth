import Modal, { CloseButton } from './Modal';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../data/products';
import { formatDateTime } from '../../utils/orders';

// Decorative barcode derived from the tracking number (visual only).
const Barcode = ({ value }) => {
  const bars = [...value].flatMap((ch, i) => {
    const code = ch.charCodeAt(0) + i;
    return [1 + (code % 3), 1 + ((code >> 2) % 2)];
  });
  return (
    <div className="flex items-end h-12 gap-px" aria-hidden="true">
      {bars.map((w, i) => (
        <span key={i} className={i % 2 ? 'bg-transparent' : 'bg-[#1a1a1a]'} style={{ width: `${w * 1.5}px`, height: '100%' }} />
      ))}
    </div>
  );
};

export const ReceiptDocument = ({ order }) => {
  const itemsCount = order.items.reduce((s, i) => s + i.qty, 0);
  const a = order.address || {};

  return (
    <div className="receipt bg-[#fbf8f2] text-[#1a1a1a] px-5 py-8 sm:p-10 overflow-hidden">
      {/* Letterhead */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-[#c6a15b]">
        <div>
          <p className="font-display text-3xl tracking-[0.15em]">WEAR<span className="text-[#a17c2e]">SUPER</span></p>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#1a1a1a]/50 mt-1">Maison of Future Wear</p>
        </div>
        <div className="sm:text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#a17c2e]">Receipt · Tax invoice</p>
          <p className="text-sm font-semibold mt-1">{order.invoiceNumber || `INV-${order.id}`}</p>
          <p className="text-xs text-[#1a1a1a]/55">{formatDateTime(order.date)}</p>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a1a1a]/45 mb-2">Billed to</p>
          <p className="font-semibold">{a.name}</p>
          <p className="text-[#1a1a1a]/65 break-all">{a.email}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a1a1a]/45 mb-2">Ship to</p>
          <p className="font-semibold">{a.name}</p>
          <p className="text-[#1a1a1a]/65">{a.address}</p>
          <p className="text-[#1a1a1a]/65">{[a.city, a.zip].filter(Boolean).join(' ')}</p>
          <p className="text-[#1a1a1a]/65">{a.country}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a1a1a]/45 mb-2">Order</p>
          <p className="flex justify-between gap-3"><span className="text-[#1a1a1a]/55">Order no.</span><span className="font-semibold">{order.id}</span></p>
          <p className="flex justify-between gap-3"><span className="text-[#1a1a1a]/55">Tracking</span><span className="font-semibold">{order.trackingNumber || '—'}</span></p>
          <p className="flex justify-between gap-3"><span className="text-[#1a1a1a]/55">Payment</span><span className="font-semibold">{order.payment.brand} •••• {order.payment.last4}</span></p>
        </div>
      </div>

      {/* Items */}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm min-w-[440px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.2em] text-[#1a1a1a]/45 border-y border-[#1a1a1a]/15">
              <th className="text-left font-bold py-2.5 px-1">Item</th>
              <th className="text-left font-bold py-2.5 px-1">Size · Colour</th>
              <th className="text-center font-bold py-2.5 px-1">Qty</th>
              <th className="text-right font-bold py-2.5 px-1">Price</th>
              <th className="text-right font-bold py-2.5 px-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.lineKey} className="border-b border-[#1a1a1a]/8">
                <td className="py-3 px-1">
                  <p className="font-semibold">{it.name}</p>
                  <p className="text-[11px] text-[#1a1a1a]/50">{it.brand}</p>
                </td>
                <td className="py-3 px-1 text-[#1a1a1a]/70">{it.size} · {it.color}</td>
                <td className="py-3 px-1 text-center">{it.qty}</td>
                <td className="py-3 px-1 text-right">{formatPrice(it.price)}</td>
                <td className="py-3 px-1 text-right font-semibold">{formatPrice(it.price * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex flex-col sm:flex-row justify-between gap-6 mt-6">
        <div className="flex items-end gap-6">
          <div>
            <Barcode value={order.trackingNumber || order.id} />
            <p className="text-[10px] tracking-[0.3em] mt-1 text-[#1a1a1a]/60">{order.trackingNumber || order.id}</p>
          </div>
          {/* PAID stamp */}
          <div className="mb-2 rotate-[-12deg] border-[3px] border-[#a17c2e] text-[#a17c2e] rounded-lg px-3 py-1 font-display text-xl sm:text-2xl tracking-[0.2em] opacity-80 select-none">
            {order.cancelledAt ? 'REFUNDED' : 'PAID'}
          </div>
        </div>
        <div className="sm:w-64 text-sm space-y-2">
          <p className="flex justify-between"><span className="text-[#1a1a1a]/55">Subtotal ({itemsCount} items)</span><span>{formatPrice(order.subtotal)}</span></p>
          <p className="flex justify-between"><span className="text-[#1a1a1a]/55">Shipping</span><span>{order.shipping ? formatPrice(order.shipping) : 'Complimentary'}</span></p>
          <p className="flex justify-between"><span className="text-[#1a1a1a]/55">Taxes &amp; duties</span><span>Included</span></p>
          <p className="flex justify-between items-baseline pt-3 border-t-2 border-[#c6a15b] text-base">
            <span className="font-bold uppercase tracking-widest text-xs">{order.cancelledAt ? 'Refunded' : 'Total paid'}</span>
            <span className="font-display text-2xl text-[#a17c2e]">{formatPrice(order.total)}</span>
          </p>
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-[#1a1a1a]/10 text-center">
        <p className="font-display text-lg">Thank you for choosing WEARSUPER.</p>
        <p className="text-[11px] text-[#1a1a1a]/45 mt-1">
          Returns within 30 days · concierge@wearsuper.com · Demo store — no real payment was taken.
        </p>
      </div>
    </div>
  );
};

const ReceiptModal = () => {
  const { activeModal, activeOrder, closeModal, openOrder } = useStore();
  if (activeModal !== 'receipt' || !activeOrder) return null;

  return (
    <Modal open onClose={closeModal} maxWidth="max-w-3xl" label="Receipt" className="print-root">
      <div className="no-print flex flex-wrap items-center gap-2 px-4 sm:px-6 py-4 border-b border-white/10 pr-16">
        <p className="font-display text-xl text-white mr-auto">Receipt</p>
        <button
          onClick={() => openOrder(activeOrder.id)}
          className="px-4 py-2.5 rounded-full border border-white/15 text-white text-xs font-semibold uppercase tracking-widest hover:border-[#c6a15b] hover:text-[#c6a15b] transition-colors"
        >
          Track order
        </button>
        <button
          onClick={() => window.print()}
          className="btn-sheen px-4 py-2.5 rounded-full bg-[#c6a15b] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d8b877] transition-colors flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
          Print / Save PDF
        </button>
      </div>
      <div className="no-print"><CloseButton onClose={closeModal} /></div>
      <ReceiptDocument order={activeOrder} />
    </Modal>
  );
};

export default ReceiptModal;
