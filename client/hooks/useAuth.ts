"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";

type AuthMode = "signin" | "signup";

type AuthPayload = {
  email: string;
  password: string;
};

function cleanErrorMessage(message: string): string {
  if (message.toLowerCase().includes("invalid login credentials")) {
    return "Invalid email or password.";
  }

  return message;
}

export function useAuth() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (mode: AuthMode, payload: AuthPayload) => {
      setLoading(true);
      setError(null);

      try {
        if (mode === "signin") {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: payload.email,
            password: payload.password,
          });

          if (signInError) {
            throw signInError;
          }
        } else {
          const { error: signUpError } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (signUpError) {
            throw signUpError;
          }
        }

        router.refresh();
        router.push("/dashboard");
        return { ok: true as const };
      } catch (err) {
        const message =
          err instanceof Error
            ? cleanErrorMessage(err.message)
            : "Authentication failed.";
        setError(message);
        return { ok: false as const, message };
      } finally {
        setLoading(false);
      }
    },
    [router, supabase]
  );

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (oauthError) {
        throw oauthError;
      }

      return { ok: true as const };
    } catch (err) {
      const message =
        err instanceof Error ? cleanErrorMessage(err.message) : "Google sign-in failed.";
      setError(message);
      return { ok: false as const, message };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    loading,
    error,
    clearError,
    submit,
    signInWithGoogle,
  };
}
