import React, { useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '../../api/axiosClient';
import { notifyAuthChanged } from '../../utils/authEvents';

type AuthMode = 'signin' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess?: () => void;
}

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode = 'signin', onClose, onSuccess }) => {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const title = useMemo(() => (mode === 'signin' ? 'Welcome Back' : 'Create Your Account'), [mode]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setName('');
      setEmail('');
      setPassword('');
      setError(null);
      setMessage(null);

      const raf = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(raf);
    }

    setIsVisible(false);
    const timer = window.setTimeout(() => setIsMounted(false), 220);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    firstInputRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      );

      if (!focusableElements.length) {
        event.preventDefault();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const validate = () => {
    if (mode === 'signup' && name.trim().length < 2) {
      return 'Please enter your full name.';
    }

    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const response = await apiClient.post('/auth/login', {
          email: email.trim(),
          password,
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        notifyAuthChanged();
        onSuccess?.();
        onClose();
      } else {
        await apiClient.post('/auth/register', {
          name: name.trim(),
          email: email.trim(),
          password,
        });
        setMessage('Account created successfully. Sign in to continue.');
        setPassword('');
        setMode('signin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full max-w-md rounded-2xl border border-white/30 bg-white/15 p-6 text-white shadow-2xl backdrop-blur-xl transition-all duration-200 ${
          isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-95'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="mt-1 text-sm text-slate-100/90">
              {mode === 'signin' ? 'Sign in to continue to your dashboard.' : 'Join and manage your account securely.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-200 transition hover:bg-white/20 hover:text-white"
            aria-label="Close"
          >
            x
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-green-200/50 bg-green-500/20 p-3 text-sm text-green-100">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200/50 bg-red-500/20 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-100">Full Name</label>
              <input
                ref={firstInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-lg border border-white/35 bg-white/10 px-3 py-2 text-white placeholder:text-slate-200/75 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/35"
                placeholder="Your full name"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-100">Email</label>
            <input
              ref={mode === 'signin' ? firstInputRef : undefined}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-lg border border-white/35 bg-white/10 px-3 py-2 text-white placeholder:text-slate-200/75 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/35"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-100">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full rounded-lg border border-white/35 bg-white/10 px-3 py-2 text-white placeholder:text-slate-200/75 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/35"
              placeholder="At least 8 characters"
              required
            />
          </div>

          {mode === 'signin' && (
            <p className="text-right text-sm">
              <a href="/forgot-password" className="text-slate-100 underline decoration-slate-200/70 underline-offset-2 hover:text-white">
                Forgot Password?
              </a>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-md transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-100/95">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            className="font-semibold text-white underline decoration-slate-200/75 underline-offset-2"
            onClick={() => {
              setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
              setError(null);
              setMessage(null);
            }}
          >
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
