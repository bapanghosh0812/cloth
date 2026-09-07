import { createPortal } from 'react-dom';
import { useStore } from '../../context/StoreContext';

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16v-4M12 8h.01" /><circle cx="12" cy="12" r="10" /></svg>
  ),
};

const ACCENT = {
  success: 'text-emerald-400',
  error: 'text-rose-400',
  info: 'text-[#c6a15b]',
};

const Toasts = () => {
  const { toasts, dismissToast } = useStore();

  return createPortal(
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className="ws-toast pointer-events-auto flex items-center gap-3 min-w-[260px] max-w-[360px] bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 text-white rounded-2xl px-5 py-4 shadow-2xl cursor-pointer"
        >
          <span className={`shrink-0 ${ACCENT[t.type] || ACCENT.success}`}>
            {ICONS[t.type] || ICONS.success}
          </span>
          <p className="text-sm font-medium tracking-wide">{t.message}</p>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default Toasts;
