import Modal, { CloseButton } from './Modal';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../data/products';

const CartDrawer = () => {
  const {
    activeModal,
    closeModal,
    openModal,
    cart,
    cartSubtotal,
    cartCount,
    updateQty,
    removeFromCart,
    user,
  } = useStore();

  const open = activeModal === 'cart';
  const shipping = cartSubtotal > 0 && cartSubtotal < 500 ? 25 : 0;

  const goCheckout = () => {
    if (cart.length === 0) return;
    if (!user) {
      openModal('auth');
      return;
    }
    openModal('checkout');
  };

  return (
    <Modal open={open} onClose={closeModal} variant="right" label="Shopping bag">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <h2 className="font-display text-2xl text-white">Your Bag</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-0.5">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <CloseButton onClose={closeModal} />
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
          </div>
          <p className="text-white/60">Your bag is empty.</p>
          <button
            onClick={closeModal}
            className="mt-2 text-[#c6a15b] font-semibold uppercase tracking-[0.15em] text-sm hover:underline"
          >
            Continue shopping
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
            {cart.map((line) => (
              <div key={line.lineKey} className="flex gap-4">
                <div className="w-20 h-24 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/10">
                  <img src={line.image} alt={line.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">{line.name}</h3>
                      <p className="text-white/40 text-xs mt-0.5">
                        {line.size} · {line.color}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(line.lineKey)}
                      aria-label="Remove"
                      className="text-white/30 hover:text-rose-400 transition-colors shrink-0"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center border border-white/15 rounded-full">
                      <button
                        onClick={() => updateQty(line.lineKey, line.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-white text-sm">{line.qty}</span>
                      <button
                        onClick={() => updateQty(line.lineKey, line.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-white font-semibold">{formatPrice(line.price * line.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 px-6 py-5 space-y-3">
            <div className="flex justify-between text-white/60 text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-white/60 text-sm">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-white/10">
              <span>Total</span>
              <span>{formatPrice(cartSubtotal + shipping)}</span>
            </div>
            <button
              onClick={goCheckout}
              className="w-full bg-[#c6a15b] text-black font-bold uppercase tracking-[0.15em] text-sm py-4 rounded-xl hover:bg-[#d8b877] transition-colors mt-2"
            >
              {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
            </button>
            <p className="text-center text-white/30 text-[11px]">
              {cartSubtotal < 500
                ? `Add ${formatPrice(500 - cartSubtotal)} more for free shipping`
                : 'You have unlocked complimentary shipping'}
            </p>
          </div>
        </>
      )}
    </Modal>
  );
};

export default CartDrawer;
