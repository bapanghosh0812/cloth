import { useState } from 'react';
import Modal, { CloseButton } from './Modal';
import { useStore } from '../../context/StoreContext';

const Field = ({ label, ...props }) => (
  <label className="flex flex-col gap-2">
    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{label}</span>
    <input
      {...props}
      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 outline-none focus:border-[#c6a15b] focus:bg-white/10 transition-all placeholder:text-white/25"
    />
  </label>
);

const AuthModal = () => {
  const { activeModal, closeModal, login, signup, loginAsGuest } = useStore();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const open = activeModal === 'auth';
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const ok =
      mode === 'login'
        ? login(form.email, form.password)
        : signup(form.name, form.email, form.password);
    if (ok) {
      setForm({ name: '', email: '', password: '' });
      closeModal();
    }
  };

  return (
    <Modal open={open} onClose={closeModal} maxWidth="max-w-md" label="Account">
      <CloseButton onClose={closeModal} />
      <div className="p-8 md:p-10">
        <p className="text-[#c6a15b] text-[11px] font-semibold uppercase tracking-[0.3em] mb-3">
          WEARSUPER Members
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-white mb-2">
          {mode === 'login' ? 'Welcome back' : 'Join the club'}
        </h2>
        <p className="text-white/50 text-sm mb-8">
          {mode === 'login'
            ? 'Sign in to your account to continue.'
            : 'Create an account for exclusive drops and early access.'}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <Field label="Full name" type="text" placeholder="Alex Morgan" value={form.name} onChange={set('name')} />
          )}
          <Field label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
          <Field label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} autoComplete="current-password" />

          <button
            type="submit"
            className="mt-2 w-full bg-[#c6a15b] text-black font-bold uppercase tracking-[0.15em] text-sm py-4 rounded-xl hover:bg-[#d8b877] transition-colors"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-white/30 text-xs uppercase tracking-widest">or</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <button
          onClick={() => {
            loginAsGuest();
            closeModal();
          }}
          className="w-full border border-white/15 text-white font-semibold uppercase tracking-[0.15em] text-sm py-4 rounded-xl hover:bg-white/5 transition-colors"
        >
          Continue as Guest
        </button>

        <p className="text-center text-white/50 text-sm mt-7">
          {mode === 'login' ? "Don't have an account?" : 'Already a member?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[#c6a15b] font-semibold hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <p className="text-center text-white/25 text-[11px] mt-4 leading-relaxed">
          Demo store — any email &amp; password works. No real credentials are stored or sent.
        </p>
      </div>
    </Modal>
  );
};

export default AuthModal;
