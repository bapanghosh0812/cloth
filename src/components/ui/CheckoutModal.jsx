import React, { useState } from 'react';
import Modal, { CloseButton } from './Modal';
// React is used via <React.Fragment> in the stepper below.
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../data/products';

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
  <div className="flex items-center gap-2 mb-8">
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
          <span className={`text-xs uppercase tracking-widest ${i <= step ? 'text-white' : 'text-white/30'}`}>
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

const CheckoutModal = () => {
  const { activeModal, closeModal, cart, cartSubtotal, placeOrder, user } = useStore();
  const open = activeModal === 'checkout';

  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState(null);

  const [ship, setShip] = useState({
    name: user?.guest ? '' : user?.name || '',
    email: user?.email && !user?.guest ? user.email : '',
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

  const confirm = () => {
    setProcessing(true);
    // Simulated payment processing — no real gateway, no card data leaves the browser.
    setTimeout(() => {
      const placed = placeOrder({
        items: cart,
        subtotal: cartSubtotal,
        shipping,
        total,
        address: ship,
        payment: {
          brand: detectBrand(pay.number),
          last4: pay.number.replace(/\s/g, '').slice(-4),
        },
      });
      setOrder(placed);
      setProcessing(false);
      setStep(3);
    }, 1600);
  };

  const reset = () => {
    setStep(0);
    setOrder(null);
    setProcessing(false);
    closeModal();
  };

  return (
    <Modal open={open} onClose={step === 3 ? reset : closeModal} maxWidth="max-w-xl" label="Checkout">
      <CloseButton onClose={step === 3 ? reset : closeModal} />

      {/* Success screen */}
      {step === 3 && order ? (
        <div className="p-8 md:p-10 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-[#c6a15b]/15 border border-[#c6a15b]/40 flex items-center justify-center mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c6a15b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <h2 className="font-display text-4xl text-white mb-2">Order Confirmed</h2>
          <p className="text-white/50 mb-6">
            Thank you, {order.address.name.split(' ')[0]}. Your order is on its way.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Order number</span>
              <span className="text-white font-semibold tracking-wider">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Total paid</span>
              <span className="text-white font-semibold">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Payment</span>
              <span className="text-white font-semibold">
                {order.payment.brand} •••• {order.payment.last4}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Delivery</span>
              <span className="text-white font-semibold">3–5 business days</span>
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full bg-[#c6a15b] text-black font-bold uppercase tracking-[0.15em] text-sm py-4 rounded-xl hover:bg-[#d8b877] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="p-8 md:p-10">
          <p className="text-[#c6a15b] text-[11px] font-semibold uppercase tracking-[0.3em] mb-2">Secure Checkout</p>
          <h2 className="font-display text-3xl text-white mb-6">Complete your order</h2>

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
                className="flex-1 bg-[#c6a15b] text-black font-bold uppercase tracking-[0.15em] text-sm py-4 rounded-xl hover:bg-[#d8b877] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            )}
            {step === 2 && (
              <button
                onClick={confirm}
                disabled={processing}
                className="flex-1 bg-[#c6a15b] text-black font-bold uppercase tracking-[0.15em] text-sm py-4 rounded-xl hover:bg-[#d8b877] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
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

export default CheckoutModal;
