import Modal, { CloseButton } from './Modal';
import { useStore } from '../../context/StoreContext';
import { formatPrice, getById } from '../../data/products';

const WishlistDrawer = () => {
  const { activeModal, closeModal, wishlist, toggleWishlist, addToCart, openQuickView } = useStore();
  const open = activeModal === 'wishlist';

  return (
    <Modal open={open} onClose={closeModal} variant="right" label="Wishlist">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <h2 className="font-display text-2xl text-white">Wishlist</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-0.5">
            {wishlist.length} saved
          </p>
        </div>
        <CloseButton onClose={closeModal} />
      </div>

      {wishlist.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
          </div>
          <p className="text-white/60">No saved items yet.</p>
          <button onClick={closeModal} className="text-[#c6a15b] font-semibold uppercase tracking-[0.15em] text-sm hover:underline">
            Explore the store
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {wishlist.map((item) => {
            const full = getById(item.id);
            return (
              <div key={item.id} className="flex gap-4">
                <button
                  onClick={() => full && openQuickView(full)}
                  className="w-20 h-24 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/10"
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </button>
                <div className="flex-1 min-w-0 flex flex-col">
                  <h3 className="text-white font-semibold truncate">{item.name}</h3>
                  <p className="text-white/40 text-xs mt-0.5">{item.brand}</p>
                  <p className="text-[#c6a15b] font-semibold mt-1">{formatPrice(item.price)}</p>
                  <div className="flex gap-2 mt-auto pt-2">
                    <button
                      onClick={() => full && addToCart(full)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
                    >
                      Add to Bag
                    </button>
                    <button
                      onClick={() => toggleWishlist(item)}
                      aria-label="Remove"
                      className="w-10 shrink-0 border border-white/15 text-white/50 hover:text-rose-400 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default WishlistDrawer;
