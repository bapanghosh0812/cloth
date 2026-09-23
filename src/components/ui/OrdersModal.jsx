import { useState } from 'react';
import Modal, { CloseButton } from './Modal';
import { StatusBadge } from './OrderDetail';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../data/products';
import { getTracking, formatDate } from '../../utils/orders';

const TrackLookup = () => {
  const { orders, openOrder, toast } = useStore();
  const [code, setCode] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const q = code.trim().toUpperCase();
    if (!q) return;
    const found = orders.find((o) => o.id.toUpperCase() === q || o.trackingNumber?.toUpperCase() === q);
    if (found) openOrder(found.id);
    else toast('No order found with that number on this device', 'error');
  };

  return (
    <form onSubmit={submit} className="px-6 py-4 border-b border-white/10">
      <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">Track an order</p>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Order no. or tracking no."
          className="flex-1 min-w-0 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-[#c6a15b] transition-colors placeholder:text-white/25 text-sm uppercase tracking-wider"
        />
        <button type="submit" className="btn-sheen px-5 rounded-xl bg-[#c6a15b] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d8b877] transition-colors">
          Track
        </button>
      </div>
    </form>
  );
};

const OrdersModal = () => {
  const { activeModal, closeModal, orders, user, logout, openOrder, openReceipt } = useStore();
  const open = activeModal === 'orders';

  return (
    <Modal open={open} onClose={closeModal} variant="right" label="Your account">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          {user && (
            <span className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-[#e2c78e] to-[#a17c2e] text-black font-display text-lg flex items-center justify-center">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h2 className="font-display text-2xl text-white truncate">{user ? `Hi, ${user.name.split(' ')[0]}` : 'My Orders'}</h2>
            <p className="text-white/40 text-xs uppercase tracking-widest mt-0.5">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}{user && !user.guest ? ` · ${user.email}` : ''}
            </p>
          </div>
        </div>
        <CloseButton onClose={closeModal} />
      </div>

      {orders.length > 0 && <TrackLookup />}

      {orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
          </div>
          <p className="text-white/60">No orders yet.</p>
          <p className="text-white/35 text-sm max-w-xs">Orders you place appear here with live tracking and a downloadable receipt.</p>
          <button onClick={closeModal} className="text-[#c6a15b] font-semibold uppercase tracking-[0.15em] text-sm hover:underline">
            Start shopping
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 flex flex-col gap-4">
          {orders.map((o) => {
            const t = getTracking(o);
            return (
              <div key={o.id} className="border border-white/10 rounded-2xl p-5 bg-white/[0.03] hover:border-[#c6a15b]/40 transition-colors">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-white font-semibold tracking-wide truncate">{o.id}</p>
                    <p className="text-white/40 text-xs mt-0.5">{formatDate(o.date, { year: 'numeric' })}</p>
                  </div>
                  <StatusBadge tracking={t} />
                </div>

                {!t.cancelled && (
                  <div className="mb-3">
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#a17c2e] to-[#e2c78e]" style={{ width: `${Math.max(6, t.progress * 100)}%` }} />
                    </div>
                    <p className="text-white/40 text-[11px] mt-1.5">
                      {t.delivered ? 'Delivered' : `Arrives ${formatDate(t.eta)}`}
                      {o.trackingNumber && <span> · {o.trackingNumber}</span>}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <div className="flex -space-x-3">
                    {o.items.slice(0, 4).map((it) => (
                      <div key={it.lineKey} className="w-10 h-11 rounded-lg overflow-hidden border-2 border-[#0c0c0c] bg-white/5">
                        <img src={it.image} alt={it.name} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {o.items.length > 4 && (
                      <div className="w-10 h-11 rounded-lg border-2 border-[#0c0c0c] bg-white/10 flex items-center justify-center text-white/60 text-xs">+{o.items.length - 4}</div>
                    )}
                  </div>
                  <span className="text-white font-semibold">{formatPrice(o.total)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button onClick={() => openOrder(o.id)} className="btn-sheen py-2.5 rounded-xl bg-[#c6a15b] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d8b877] transition-colors">
                    Track
                  </button>
                  <button onClick={() => openReceipt(o.id)} className="py-2.5 rounded-xl border border-white/15 text-white text-xs font-semibold uppercase tracking-widest hover:border-[#c6a15b] hover:text-[#c6a15b] transition-colors">
                    Receipt
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {user && (
        <div className="border-t border-white/10 px-6 py-4">
          <button
            onClick={() => { logout(); closeModal(); }}
            className="w-full border border-white/15 text-white/70 hover:text-white hover:bg-white/5 font-semibold uppercase tracking-[0.15em] text-sm py-3.5 rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </Modal>
  );
};

export default OrdersModal;
