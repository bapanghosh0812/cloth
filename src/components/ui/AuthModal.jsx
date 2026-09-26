import { useState } from 'react';
import Modal, { CloseButton } from './Modal';
import { useStore } from '../../context/StoreContext';

const Field = ({ label, hint, ...props }) => (
  <label className="flex flex-col gap-2">
    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{label}</span>
    <input
      {...props}
      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 outline-none focus:border-[#c6a15b] focus:bg-white/10 transition-all placeholder:text-white/25 disabled:opacity-60"
    />
    {hint && <span className="text-[11px] text-white/35">{hint}</span>}
  </label>
);

const AuthDialog = () => {
  const { closeModal, finishAuth, afterAuth, login, signup, toast } = useStore();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const email = form.email.trim();
    if (!email || !form.password) return toast('Enter your email and password', 'error');
    if (mode === 'signup') {
      if (!form.name.trim()) return toast('Please add your name', 'error');
      if (form.password.length < 8) return toast('Password must be at least 8 characters', 'error');
    }

    setBusy(true);
    const ok = mode === 'login' ? await login(email, form.password) : await signup(form.name.trim(), email, form.password);
    setBusy(false);
    if (ok) finishAuth();
  };

  return (
    <Modal open onClose={closeModal} maxWidth="max-w-md" label="Account">
      <CloseButton onClose={closeModal} />
      <div className="p-8 md:p-10">
        <p className="text-[#c6a15b] text-[11px] font-semibold uppercase tracking-[0.3em] mb-3">
          WEARSUPER Members
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-white mb-2">
          {mode === 'login' ? 'Welcome back' : 'Join the club'}
        </h2>
        <p className="text-white/50 text-sm mb-8">
          {afterAuth === 'checkout'
            ? 'Sign in or create an account to continue to secure checkout.'
            : mode === 'login'
              ? 'Sign in to your account to continue.'
              : 'Create an account to place orders, track deliveries and get early access.'}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <Field label="Full name" type="text" placeholder="Alex Morgan" value={form.name} onChange={set('name')} autoComplete="name" maxLength={60} disabled={busy} />
          )}
          <Field label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" disabled={busy} />
          <Field
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={set('password')}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            hint={mode === 'signup' ? 'At least 8 characters.' : undefined}
            maxLength={72}
            disabled={busy}
          />

          <button
            type="submit"
            disabled={busy}
            className="btn-sheen mt-2 w-full bg-[#c6a15b] text-black font-bold uppercase tracking-[0.15em] text-sm py-4 rounded-xl hover:bg-[#d8b877] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {busy && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
            {busy ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-7">
          {mode === 'login' ? "Don't have an account?" : 'Already a member?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            disabled={busy}
            className="text-[#c6a15b] font-semibold hover:underline"
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>

        <p className="text-center text-white/25 text-[11px] mt-4 leading-relaxed">
          Passwords are encrypted with bcrypt and never stored in plain text.
        </p>
      </div>
    </Modal>
  );
};

// Mounted only while open: every visit starts on "Sign in" with an empty password field.
const AuthModal = () => {
  const { activeModal } = useStore();
  return activeModal === 'auth' ? <AuthDialog /> : null;
};

export default AuthModal;
