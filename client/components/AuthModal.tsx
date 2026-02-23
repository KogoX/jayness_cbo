"use client";

import {
  FormEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useAuth } from "../hooks/useAuth";

type AuthMode = "signin" | "signup";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
};

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function validate(mode: AuthMode, email: string, password: string, confirm: string): string | null {
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return "Enter a valid email address.";
  }

  if (!password || password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (mode === "signup" && password !== confirm) {
    return "Passwords do not match.";
  }

  return null;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = "signin",
}: AuthModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const { loading, error, clearError, submit, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const combinedError = useMemo(() => formError ?? error, [formError, error]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      initialFocusRef.current?.focus();
    }, 0);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleTabTrap = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTabTrap);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTabTrap);
      lastActiveElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setMode(defaultMode);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFormError(null);
      clearError();
    }
  }, [clearError, defaultMode, isOpen]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearError();
    const validationError = validate(mode, email, password, confirmPassword);
    setFormError(validationError);

    if (validationError) {
      return;
    }

    const result = await submit(mode, { email: email.trim(), password });
    if (result.ok) {
      onClose();
    }
  };

  const onBackdropKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm animate-[authFade_220ms_ease-out]"
      onMouseDown={onClose}
      onKeyDown={onBackdropKeyDown}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl border border-white/25 bg-white/15 p-6 text-white shadow-2xl backdrop-blur-xl animate-[authScaleIn_220ms_ease-out]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-6">
          <h2 id={titleId} className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-slate-100/90">
            {mode === "signin"
              ? "Sign in to continue to your dashboard."
              : "Sign up to get started with your workspace."}
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
            clearError();
            setFormError(null);
            await signInWithGoogle();
          }}
          disabled={loading}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/20 px-4 py-2.5 text-sm font-medium transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Continue with Google
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/30" />
          <span className="text-xs uppercase tracking-wide text-slate-100/80">or</span>
          <div className="h-px flex-1 bg-white/30" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              ref={initialFocusRef}
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-white placeholder:text-slate-200/80 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-white placeholder:text-slate-200/80 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
              placeholder="At least 8 characters"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-white placeholder:text-slate-200/80 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
                placeholder="Re-enter your password"
              />
            </div>
          )}

          {combinedError && (
            <p className="rounded-md border border-rose-300/50 bg-rose-500/20 px-3 py-2 text-sm text-rose-100">
              {combinedError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-100/90">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              clearError();
              setFormError(null);
              setMode((prev) => (prev === "signin" ? "signup" : "signin"));
            }}
            className="font-semibold text-white underline decoration-white/70 underline-offset-2 transition hover:decoration-white"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
