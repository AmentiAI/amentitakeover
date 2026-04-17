"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export function SignOutButton({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const cls =
    variant === "dark"
      ? "grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-60"
      : "grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60";

  return (
    <button onClick={signOut} disabled={loading} className={cls} title="Sign out">
      <LogOut className="h-4 w-4" />
    </button>
  );
}
