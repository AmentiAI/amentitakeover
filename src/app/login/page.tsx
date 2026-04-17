export const metadata = {
  title: "Amenti AI · Affiliate Program",
  description: "Earn commissions by sharing the future of AI.",
  openGraph: {
    title: "Join the Amenti AI Affiliate Program",
    description: "Earn commissions by sharing the future of AI.",
    images: [
      {
        url: "/splash-bg.png",
        width: 1536,
        height: 1024,
        alt: "Amenti AI Affiliate Program",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the Amenti AI Affiliate Program",
    description: "Earn commissions by sharing the future of AI.",
    images: ["/splash-bg.png"],
  },
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07031a]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-15%] top-[-10%] h-[520px] w-[520px] rounded-full bg-fuchsia-600/25 blur-[160px]" />
        <div className="absolute right-[-15%] top-[15%] h-[480px] w-[480px] rounded-full bg-indigo-600/25 blur-[160px]" />
        <div className="absolute left-[20%] bottom-[-15%] h-[440px] w-[720px] rounded-full bg-purple-600/15 blur-[160px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1400px] items-center justify-center px-3 py-4 sm:px-6 sm:py-6">
        <div className="relative aspect-[3/2] w-full max-h-[calc(100vh-32px)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/splash-bg.png"
            alt="Join the Amenti AI Affiliate Program"
            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_30px_80px_rgba(139,92,246,0.35)]"
          />

          {/* Clickable hotspot on painted "Become an Affiliate" button */}
          <a
            href="/login/signin"
            aria-label="Become an Affiliate — sign in or apply"
            className="group absolute left-1/2 top-[87%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-fuchsia-300/0 ring-offset-2 ring-offset-transparent transition hover:ring-2 hover:ring-fuchsia-300/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300"
            style={{ width: "32%", height: "7.2%" }}
          >
            <span className="sr-only">Become an Affiliate</span>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full opacity-0 mix-blend-overlay transition group-hover:opacity-100 group-active:opacity-80"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))",
              }}
            />
          </a>
        </div>
      </div>
    </div>
  );
}
