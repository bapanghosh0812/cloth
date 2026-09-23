import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Base overlay. `variant`:
 *  - 'center'  → centered dialog (auth, checkout, quick view)
 *  - 'right'   → slide-in drawer from the right (cart, wishlist, orders)
 */
const Modal = ({ open, onClose, children, variant = 'center', maxWidth = 'max-w-lg', label, className = '' }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isDrawer = variant === 'right';

  return createPortal(
    <div
      className={`fixed inset-0 z-[150] ${isDrawer ? 'flex' : 'overflow-y-auto overscroll-contain'} ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="ws-backdrop fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      {isDrawer ? (
        <div className="ws-drawer relative ml-auto h-full w-full max-w-md bg-[#0c0c0c] border-l border-white/10 shadow-2xl flex flex-col">
          {children}
        </div>
      ) : (
        // Scrollable on small screens: dialogs taller than the viewport (checkout, quick view) stay reachable.
        <div className="relative min-h-full w-full px-3 sm:px-4 py-6 sm:py-8 flex items-center justify-center pointer-events-none">
          <div className={`ws-pop pointer-events-auto relative w-full ${maxWidth} bg-[#0c0c0c] border border-white/10 rounded-[1.75rem] shadow-2xl overflow-hidden`}>
            {children}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export const CloseButton = ({ onClose }) => (
  <button
    onClick={onClose}
    aria-label="Close"
    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-colors"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
  </button>
);

export default Modal;
