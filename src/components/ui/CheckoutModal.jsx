import React, { useState } from 'react';
import Modal, { CloseButton } from './Modal';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../data/products';
import { getTracking, formatDate } from '../../utils/orders';

const STEPS = ['Shipping', 'Payment', 'Review'];

const Field = ({ label, className = '', ...props }) => (
  <label className={`flex flex-col gap-1.5 ${className}`}>
    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{label}</span>
    <input
      {...props}
      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-[#c6a15b] focus:bg-white/10 transition-all placeholder:text-white/25 text-sm"
    />
  </label>
);

const Stepper = ({ step }) => (
  <div className="flex items-center gap-2 mb-6 sm:mb-8">
    {STEPS.map((s, i) => (
      <React.Fragment key={s}>
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i <= step ? 'bg-[#c6a15b] text-black' : 'bg-white/10 text-white/40'
            }`}
          >
            {i < step ? '✓' : i + 1}
          </div>
          <span className={`hidden sm:inline text-xs uppercase tracking-widest ${i <= step ? 'text-white' : 'text-white/30'}`}>
            {s}
          </span>
        </div>
        {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-[#c6a15b]' : 'bg-white/10'}`} />}
      </React.Fragment>
    ))}
  </div>
);

const detectBrand = (num) => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^6/.test(n)) return 'Discover';
  return 'Card';
};

const CheckoutFlow = () => {
  const { closeModal, cart, cartSubtotal, placeOrder, user, openReceipt, openOrder } = useStore();

  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState(null);

  const [ship, setShip] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    zip: '',
    country: '',
  });
  const [pay, setPay] = useState({ number: '', name: '', expiry: '', cvc: '' });

  const shipping = cartSubtotal > 0 && cartSubtotal < 500 ? 25 : 0;
  const total = cartSubtotal + shipping;

  const setS = (k) => (e) => setShip((f) => ({ ...f, [k]: e.target.value }));
  const setP = (k) => (e) => {
    let v = e.target.value;
    if (k === 'number') v = v.replace(/[^\d]/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (k === 'expiry') v = v.replace(/[^\d]/g, '').slice(0, 4).replace(/(.{2})(.+)/, '$1/$2');
    if (k === 'cvc') v = v.replace(/[^\d]/g, '').slice(0, 4);
    setPay((f) => ({ ...f, [k]: v }));
  };

  const shipValid =
    ship.name && ship.email && ship.address && ship.city && ship.zip && ship.country;
  const payValid =
    pay.number.replace(/\s/g, '').length >= 15 && pay.name && pay.expiry.length === 5 && pay.cvc.length >= 3;

  const fillDemoCard = () =>
    setPay({ number: '4242 4242 4242 4242', name: ship.name || 'Demo Member', expiry: '12/28', cvc: '123' });

  // The order is created (and priced) by the API. Payment itself is still simulated:
  // only the card brand and last four digits are sent — the full number never leaves the browser.
  const confirm = async () => {
    setProcessing(true);
    const placed = await placeOrder({
      items: cart,
      address: ship,
      payment: {
        brand: detectBrand(pay.number),
        last4: pay.number.replace(/\s/g, '').slice(-4),
      },
    });
    setProcessing(false);
    if (placed) {
      setOrder(placed);
      setStep(3);
    }
  };

  return (
    <Modal open onClose={closeModal} maxWidth="max-w-xl" label="Checkout">
      <CloseButton onClose={closeModal} />

      {/* Success screen */}
      {step === 3 && order ? (
        <div className="p-6 sm:p-8 md:p-10 text-center">
          <div className="ws-seal mx-auto w-20 h-20 rounded-full bg-[#c6a15b]/15 border border-[#c6a15b]/40 flex items-center justify-center mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c6a15b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path className="ws-check" d="M20 6 9 17l-5-5" /></svg>
          </div>
          <p className="text-[#c6a15b] text-[11px] font-semibold uppercase tracking-[0.3em] mb-2">Payment successful</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-2">Order Confirmed</h2>
          <p className="text-white/50 mb-6">
            Thank you, {order.address.name.split(' ')[0]}. A receipt has been issued and your order is being prepared.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 text-left space-y-3 mb-6">
            {[
              ['Order number', order.id],
              ['Tracking number', order.trackingNumber],
              ['Invoice', order.invoiceNumber],
              ['Paid', `${formatPrice(order.total)} · ${order.payment.brand} •••• ${order.payment.last4}`],
              ['Estimated delivery', formatDate(getTracking(order).eta)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <span className="text-white/50 text-sm">{k}</span>
                <span className="text-white font-semibold tracking-wide text-right text-sm sm:text-base">{v}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => openReceipt(order.id)}
              className="py-4 rounded-xl border border-white/15 text-white font-semibold uppercase tracking-[0.15em] text-xs sm:text-sm hover:border-[#c6a15b] hover:text-[#c6a15b] transition-colors"
            >
              View receipt
            </button>
            <button
              onClick={() => openOrder(order.id)}
              className="btn-sheen py-4 rounded-xl bg-[#c6a15b] text-black font-bold uppercase tracking-[0.15em] text-xs sm:text-sm hover:bg-[#d8b877] transition-colors"
            >
              Track order
            </button>
          </div>
          <button onClick={closeModal} className="mt-4 text-white/45 text-sm hover:text-white transition-colors">
            Continue shopping
          </button>
        </div>
      ) : (
        <div className="p-6 sm:p-8 md:p-10">
          <p className="text-[#c6a15b] text-[11px] font-semibold uppercase tracking-[0.3em] mb-2">Secure Checkout</p>
          <h2 className="font-display text-2xl sm:text-3xl text-white mb-6 pr-10">Complete your order</h2>

          <Stepper step={step} />

          {/* Step 0 — Shipping */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full name" className="col-span-2" placeholder="Alex Morgan" value={ship.name} onChange={setS('name')} />
              <Field label="Email" className="col-span-2" type="email" placeholder="you@example.com" value={ship.email} onChange={setS('email')} />
              <Field label="Address" className="col-span-2" placeholder="221B Baker Street" value={ship.address} onChange={setS('address')} />
              <Field label="City" placeholder="London" value={ship.city} onChange={setS('city')} />
              <Field label="ZIP / Postcode" placeholder="NW1 6XE" value={ship.zip} onChange={setS('zip')} />
              <Field label="Country" className="col-span-2" placeholder="United Kingdom" value={ship.country} onChange={setS('country')} />
            </div>
          )}

          {/* Step 1 — Payment */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-center justify-between bg-[#c6a15b]/10 border border-[#c6a15b]/25 rounded-xl px-4 py-3">
                <span className="text-[#e2c78e] text-xs">Demo mode — use the test card, no real payment.</span>
                <button onClick={fillDemoCard} className="text-black bg-[#c6a15b] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#d8b877] transition-colors whitespace-nowrap">
                  Use test card
                </button>
              </div>
              <Field label="Card number" className="col-span-2" placeholder="4242 4242 4242 4242" value={pay.number} onChange={setP('number')} inputMode="numeric" />
              <Field label="Name on card" className="col-span-2" placeholder="Alex Morgan" value={pay.name} onChange={setP('name')} />
              <Field label="Expiry" placeholder="MM/YY" value={pay.expiry} onChange={setP('expiry')} inputMode="numeric" />
              <Field label="CVC" placeholder="123" value={pay.cvc} onChange={setP('cvc')} inputMode="numeric" />
              <p className="col-span-2 text-white/30 text-[11px] flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Simulated & encrypted. Card details never leave your browser.
              </p>
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
                {cart.map((l) => (
                  <div key={l.lineKey} className="flex gap-3 items-center">
                    <div className="w-14 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                      <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{l.name}</p>
                      <p className="text-white/40 text-xs">{l.size} · {l.color} · Qty {l.qty}</p>
                    </div>
                    <span className="text-white text-sm font-semibold">{formatPrice(l.price * l.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between text-white/60"><span>Ship to</span><span className="text-white text-right max-w-[60%] truncate">{ship.name}, {ship.city}</span></div>
                <div className="flex justify-between text-white/60"><span>Pay with</span><span className="text-white">{detectBrand(pay.number)} •••• {pay.number.replace(/\s/g, '').slice(-4)}</span></div>
                <div className="flex justify-between text-white/60 pt-2 border-t border-white/10"><span>Subtotal</span><span className="text-white">{formatPrice(cartSubtotal)}</span></div>
                <div className="flex justify-between text-white/60"><span>Shipping</span><span className="text-white">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-white/10"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={processing}
                className="px-6 py-4 rounded-xl border border-white/15 text-white font-semibold uppercase tracking-[0.15em] text-sm hover:bg-white/5 transition-colors disabled:opacity-40"
              >
                Back
              </button>
            )}
            {step < 2 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={(step === 0 && !shipValid) || (step === 1 && !payValid)}
                className="btn-sheen flex-1 bg-[#c6a15b] text-black font-bold uppercase tracking-[0.15em] text-sm py-4 rounded-xl hover:bg-[#d8b877] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            )}
            {step === 2 && (
              <button
                onClick={confirm}
                disabled={processing}
                className="btn-sheen flex-1 bg-[#c6a15b] text-black font-bold uppercase tracking-[0.15em] text-sm py-4 rounded-xl hover:bg-[#d8b877] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  `Pay ${formatPrice(total)}`
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

// Mounted only while open, so every checkout starts fresh and picks up the signed-in user.
const CheckoutModal = () => {
  const { activeModal } = useStore();
  return activeModal === 'checkout' ? <CheckoutFlow /> : null;
};

export default CheckoutModal;
