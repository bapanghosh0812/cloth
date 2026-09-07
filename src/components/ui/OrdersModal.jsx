import Modal, { CloseButton } from './Modal';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../data/products';

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const OrdersModal = () => {
  const { activeModal, closeModal, orders, user, logout } = useStore();
  const open = activeModal === 'orders';

  return (
    <Modal open={open} onClose={closeModal} variant="right" label="Your account">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <h2 className="font-display text-2xl text-white">{user ? `Hi, ${user.name.split(' ')[0]}` : 'Your Orders'}</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-0.5">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>
        <CloseButton onClose={closeModal} />
      </div>

      {orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
          </div>
          <p className="text-white/60">No orders yet.</p>
          <button onClick={closeModal} className="text-[#c6a15b] font-semibold uppercase tracking-[0.15em] text-sm hover:underline">
            Start shopping
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {orders.map((o) => (
            <div key={o.id} className="border border-white/10 rounded-2xl p-5 bg-white/[0.03]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white font-semibold tracking-wide">{o.id}</p>
                  <p className="text-white/40 text-xs mt-0.5">{fmtDate(o.date)}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest bg-emerald-400/15 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30">
                  {o.status}
                </span>
              </div>
              <div className="flex -space-x-3 mb-3">
                {o.items.slice(0, 4).map((it) => (
                  <div key={it.lineKey} className="w-11 h-12 rounded-lg overflow-hidden border-2 border-[#0c0c0c] bg-white/5">
                    <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                  </div>
                ))}
                {o.items.length > 4 && (
                  <div className="w-11 h-12 rounded-lg border-2 border-[#0c0c0c] bg-white/10 flex items-center justify-center text-white/60 text-xs">
                    +{o.items.length - 4}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">{o.items.reduce((s, i) => s + i.qty, 0)} items · {o.payment.brand} ••{o.payment.last4}</span>
                <span className="text-white font-semibold">{formatPrice(o.total)}</span>
              </div>
            </div>
          ))}
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
