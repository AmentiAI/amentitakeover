"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { AffiliateLoginForm } from "./affiliate-login-form";

type Tab = "admin" | "affiliate";

export function LoginTabs() {
  const [tab, setTab] = useState<Tab>("admin");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-md bg-slate-950/60 p-1">
        <TabButton active={tab === "admin"} onClick={() => setTab("admin")}>
          Admin
        </TabButton>
        <TabButton
          active={tab === "affiliate"}
          onClick={() => setTab("affiliate")}
        >
          Affiliate
        </TabButton>
      </div>

      {tab === "admin" ? (
        <>
          <p className="text-sm text-slate-400">
            Enter the admin password to continue.
          </p>
          <LoginForm />
        </>
      ) : (
        <>
          <p className="text-sm text-slate-400">
            Enter the passcode shared with you to access your opportunities.
          </p>
          <AffiliateLoginForm />
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
          ? "bg-indigo-600 text-white"
          : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
