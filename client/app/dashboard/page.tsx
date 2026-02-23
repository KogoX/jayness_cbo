import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabaseServer";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-100/80">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold">You are signed in</h1>
        <p className="mt-3 text-slate-100/90">Email: {user.email}</p>
      </div>
    </main>
  );
}
