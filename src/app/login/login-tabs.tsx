"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "./login-form";
import { AffiliateLoginForm } from "./affiliate-login-form";
import { AffiliateApplyForm } from "./affiliate-apply-form";

type Tab = "admin" | "affiliate" | "apply";

export function LoginTabs({ initialTab = "admin" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHash = () => {
      const h = window.location.hash.replace("#", "");
      if (h === "apply" || h === "affiliate" || h === "admin") {
        setTab(h as Tab);
      }
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1 rounded-md bg-slate-950/60 p-1">
        <TabButton active={tab === "admin"} onClick={() => setTab("admin")}>
          Admin
        </TabButton>
        <TabButton active={tab === "affiliate"} onClick={() => setTab("affiliate")}>
          Affiliate
        </TabButton>
        <TabButton active={tab === "apply"} onClick={() => setTab("apply")}>
          Apply
        </TabButton>
      </div>

      {tab === "admin" && (
        <>
          <p className="text-xs text-slate-400">Enter the admin password to continue.</p>
          <LoginForm />
        </>
      )}
      {tab === "affiliate" && (
        <>
          <p className="text-xs text-slate-400">
            Enter the passcode shared with you to access your opportunities.
          </p>
          <AffiliateLoginForm />
        </>
      )}
      {tab === "apply" && (
        <>
          <p className="text-xs text-slate-400">
            Tell us about yourself — we&apos;ll review and reach out once approved.
          </p>
          <AffiliateApplyForm />
        </>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white shadow"
          : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
