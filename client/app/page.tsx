"use client";

import { useState } from "react";
import AuthModal from "../components/AuthModal";

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.25),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.22),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.15),transparent_40%)]" />

      <section className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/20 bg-white/10 p-8 text-center text-white shadow-2xl backdrop-blur-md sm:p-12">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-sky-100/80">SaaS Access</p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">
          Secure sign-in with modern glass UI
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-100/90 sm:text-base">
          Open the modal to sign in or create an account with email/password or Google.
        </p>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-8 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          Open Auth Modal
        </button>
      </section>

      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </main>
  );
}
