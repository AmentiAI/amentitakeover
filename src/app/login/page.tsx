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
    <div className="relative h-screen w-screen overflow-hidden bg-[#07031a]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/splash-bg.png"
        alt="Join the Amenti AI Affiliate Program"
        className="absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />

      {/* Real clickable button positioned over the painted "Become an Affiliate" */}
      <a
        href="/login/signin"
        aria-label="Become an Affiliate — sign in or apply"
        className="absolute rounded-full focus:outline-none"
        style={{
          left: "50%",
          top: "max(87vh, calc(50vh + 24.67vw))",
          width: "max(32vw, 48vh)",
          height: "max(4.8vw, 7.2vh)",
          transform: "translate(-50%, -50%)",
        }}
      >
        <span className="sr-only">Become an Affiliate</span>
      </a>
    </div>
  );
}
