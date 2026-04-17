"use client";

import { useState } from "react";
import {
  Phone,
  MessageSquare,
  Mail,
  Shield,
  Target,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";

type TabKey = "pitch" | "cold" | "voicemail" | "objections" | "close" | "followup";

const TABS: { key: TabKey; label: string; icon: typeof Phone }[] = [
  { key: "pitch", label: "Elevator pitch", icon: Sparkles },
  { key: "cold", label: "Cold call", icon: Phone },
  { key: "voicemail", label: "Voicemail", icon: MessageSquare },
  { key: "objections", label: "Objections", icon: Shield },
  { key: "close", label: "Closing", icon: Target },
  { key: "followup", label: "Follow-up", icon: Mail },
];

export function ScriptsView({ commissionPct }: { commissionPct: number }) {
  const [tab, setTab] = useState<TabKey>("pitch");

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-white">Sales playbook</h1>
          <p className="mt-1 text-xs text-slate-400">
            Proven scripts, objection handlers, and closing frameworks. Use the{" "}
            <span className="font-semibold text-slate-200">New</span> button on
            Opportunities to show prospects their mocked-up site live.
          </p>
        </div>
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300">
          You earn <b>{commissionPct}%</b> on every closed deal
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="flex min-w-max gap-1 rounded-lg border border-slate-800 bg-slate-900/40 p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-indigo-600/30 text-white"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        {tab === "pitch" && <ElevatorPitch />}
        {tab === "cold" && <ColdCall />}
        {tab === "voicemail" && <Voicemail />}
        {tab === "objections" && <Objections />}
        {tab === "close" && <Closing />}
        {tab === "followup" && <FollowUp />}
      </div>
    </div>
  );
}

function ElevatorPitch() {
  return (
    <div className="space-y-4">
      <Card title="The 30-second pitch">
        <Script>
          {`"We build websites and run SEO for local businesses — but here's what's different: before you pay anything, I'll show you a fully-built version of your new site with your name, photos, and services on it. If you like what you see, we launch it. If not, you walk away. That's it."`}
        </Script>
      </Card>

      <Card title="Why this works">
        <ul className="space-y-2 text-sm text-slate-300">
          <Bullet>
            <b>No abstract promises.</b> They see their actual new site on a
            real URL before they commit.
          </Bullet>
          <Bullet>
            <b>Reverses the risk.</b> Most agencies ask for money upfront and
            hope the client likes it later. We flip that.
          </Bullet>
          <Bullet>
            <b>Easy yes.</b> &quot;Want to see it?&quot; is a much smaller
            question than &quot;Want to buy a website?&quot;
          </Bullet>
        </ul>
      </Card>

      <Card title="What Amenti actually does">
        <div className="grid gap-3 sm:grid-cols-2">
          <Benefit title="Professional website">
            Custom-designed, mobile-first, hosted, backed up, maintained.
          </Benefit>
          <Benefit title="Local SEO">
            Pages targeting their city + service combos so they show up on
            Google when customers search.
          </Benefit>
          <Benefit title="Google Business Profile">
            Optimized and actively managed for more map-pack calls.
          </Benefit>
          <Benefit title="Ongoing content">
            Monthly blog posts and landing pages that compound in the rankings.
          </Benefit>
          <Benefit title="Lead tracking">
            Call tracking and conversion reports so they know what&apos;s
            working.
          </Benefit>
          <Benefit title="AI automation (add-on)">
            Chatbot, SMS/email follow-up, automated booking, review
            collection.
          </Benefit>
        </div>
      </Card>
    </div>
  );
}

function ColdCall() {
  return (
    <div className="space-y-4">
      <Card title="Opener — pattern interrupt">
        <Script>
          {`"Hey [First name], this is [Your name] — I know you weren't expecting my call, do you have 27 seconds for the reason I'm calling?"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          The specific number (27 seconds, not 30) makes them pause. Most will
          say &quot;go ahead.&quot;
        </p>
      </Card>

      <Card title="The hook — make it about them">
        <Script>
          {`"I was looking at [Business name]'s website and I noticed [something specific: site looks dated, not mobile-friendly, slow to load, missing service pages for [city]]. I actually built a new version of your site this week that I'd like to show you — it's already live, with your name and services on it. Takes 2 minutes to walk through. Can I text you the link, or easier to pull it up while we're on the phone?"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Always reference something specific about their current site. Curiosity
          + having already done the work = hard to say no.
        </p>
      </Card>

      <Card title="The demo — let the site sell itself">
        <ul className="space-y-2 text-sm text-slate-300">
          <Bullet>
            Send the <b>New</b> preview link from the Opportunities board.
          </Bullet>
          <Bullet>
            Walk them through: hero with their name, services, local pages for
            their city, testimonials area, contact form that calls them.
          </Bullet>
          <Bullet>
            Ask: <i>&quot;What do you think? Honest first reaction.&quot;</i>{" "}
            Then shut up. Let them talk.
          </Bullet>
          <Bullet>
            If they say it looks good:{" "}
            <i>
              &quot;Want me to walk you through how we get this live for
              you?&quot;
            </i>
          </Bullet>
        </ul>
      </Card>

      <Card title="Discovery questions (ask before pricing)">
        <ul className="space-y-2 text-sm text-slate-300">
          <Bullet>
            &quot;How are most of your new customers finding you right now?&quot;
          </Bullet>
          <Bullet>
            &quot;Roughly how many jobs a month are you doing? Where would you
            want that number to be?&quot;
          </Bullet>
          <Bullet>
            &quot;Who built your current site — and when?&quot;
          </Bullet>
          <Bullet>
            &quot;If you could wave a wand and get 5 more leads a month from
            Google, what would that be worth to your business?&quot;
          </Bullet>
        </ul>
      </Card>
    </div>
  );
}

function Voicemail() {
  return (
    <div className="space-y-4">
      <Card title="Voicemail #1 — the hook">
        <Script>
          {`"Hey [First name], this is [Your name]. I actually built a new website for [Business name] this week — it's already live and I wanted to send it over for you to look at. Call or text me back at [your number] and I'll share the link. Thanks."`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Short, specific, benefit-led. The phrase &quot;already built&quot;
          creates urgency and curiosity.
        </p>
      </Card>

      <Card title="Voicemail #2 — follow-up (3–5 days later)">
        <Script>
          {`"Hey [First name], [Your name] again — I left you a message earlier this week about the new site I built for [Business name]. Didn't want to keep bugging you, so I'm going to text you the link. If you like it, great — hit me back. If not, no hard feelings. Talk soon."`}
        </Script>
      </Card>

      <Card title="Voicemail #3 — the takeaway">
        <Script>
          {`"Hey [First name], this is the last voicemail I'll leave. I'll assume the timing isn't right on the new site. If that changes, my number is [your number]. Appreciate you either way."`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          The takeaway often gets a callback — people don&apos;t like losing
          options.
        </p>
      </Card>
    </div>
  );
}

function Objections() {
  const items = [
    {
      q: "We already have a website.",
      a: `"Totally — most of the businesses I talk to do. The question isn't 'do you have one,' it's 'is it bringing you customers?' I already built a new version for you — takes 2 minutes to compare. If yours is outperforming mine, I'll buy you coffee. Fair?"`,
    },
    {
      q: "It's too expensive.",
      a: `"I hear you. Let's back into it — one new roof job is worth what, $8–15k to you? Our Growth plan is $697/month. If we bring you one extra job every other month, it pays for itself 10x. And the setup is $1,500, one time. Want me to show you what's included?"`,
    },
    {
      q: "I need to think about it.",
      a: `"Totally fair. Just so I'm clear — is it the price, the timing, or are you not sure we can actually deliver results? Whichever it is, let's talk about that piece specifically."`,
    },
    {
      q: "We get all our business from referrals.",
      a: `"That's awesome — referrals mean your work is good. Here's the thing: when someone gets referred to you, the first thing they do is Google you. If your site looks dated or doesn't load on their phone, you've already lost them before the call. We're not replacing referrals — we're making sure you don't lose the ones you've already earned."`,
    },
    {
      q: "I need to talk to my partner/spouse.",
      a: `"Makes sense. Let's do this — I'll send you the link to the new site and a one-page summary of what's included. When are you two sitting down together next? I'll follow up right after, and if they have questions I can hop on a 10-minute call."`,
    },
    {
      q: "Send me an email with the info.",
      a: `"Happy to. Real quick though — what specifically do you want to see in the email? Pricing, what's included, timeline? That way I'm not sending you a wall of text. And I'll send the live site link too so you can actually see what you'd be getting."`,
    },
    {
      q: "We're good for now.",
      a: `"Got it. Mind if I ask — if you were going to improve your online presence in the next 12 months, what would be the trigger? Losing a deal you should've won? Seeing a competitor rank above you? I just want to understand what 'being good' means for your business."`,
    },
    {
      q: "I don't trust online marketing companies.",
      a: `"I don't blame you — most of them deserve that reputation. Here's how we're different: I already built your site. You can see it right now. You only pay if you like what you see. No 12-month contracts, no upfront agency retainer. You can cancel with 30 days' notice if we're not delivering."`,
    },
    {
      q: "Call me back in a few months.",
      a: `"I will. One quick question — what's changing in a few months that would make this a yes? If nothing's changing, a few months from now we'll be having this same call. Let's figure out what the real concern is today."`,
    },
  ];

  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <ObjectionCard key={i} q={it.q} a={it.a} />
      ))}
    </div>
  );
}

function ObjectionCard({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-white hover:bg-slate-900/60"
      >
        <span className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-rose-400" />
          &quot;{q}&quot;
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-slate-800 bg-slate-950/60 px-4 py-3">
          <Script embedded>{a}</Script>
        </div>
      )}
    </div>
  );
}

function Closing() {
  return (
    <div className="space-y-4">
      <Card title="Assumptive close">
        <Script>
          {`"So the site you just saw — the Growth plan makes sense for you since you want to rank in [city]. Want me to get the paperwork started so we can have you live by [date 10 days out]?"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Assume the yes. Put the decision on timeline, not on whether to buy.
        </p>
      </Card>

      <Card title="Alternative-choice close">
        <Script>
          {`"Two options — Starter at $297/month gets your new site live with basic SEO, or Growth at $697/month adds the local landing pages and ongoing blog content so you rank higher. Which one fits where you are right now?"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Give them A or B, not yes or no. Most will pick one.
        </p>
      </Card>

      <Card title="The urgency frame">
        <Script>
          {`"I can only build 3 of these sites a month because we actually customize each one. I've got 1 spot left this month. Want to lock it in, or should I put you on next month's list?"`}
        </Script>
      </Card>

      <Card title="The money-back / risk-reversal close">
        <Script>
          {`"Here's what I'll do — let's get you live this month. You'll see leads starting to come in within 30 days. If by day 60 you're not seeing a clear return, I'll refund the setup fee. No long-term contract, cancel with 30 days' notice. How's that?"`}
        </Script>
      </Card>

      <Card title="When they say yes — what happens next">
        <ul className="space-y-2 text-sm text-slate-300">
          <Bullet>
            Log the deal in the Opportunities tab so commission is attributed
            to you.
          </Bullet>
          <Bullet>
            Collect: legal business name, owner name + email, billing method,
            logo (if they have one), and any photos they want used.
          </Bullet>
          <Bullet>
            Set expectations: site goes live within 7–10 business days. First
            monthly report 30 days after launch.
          </Bullet>
          <Bullet>
            Hand them off to the Amenti team — don&apos;t disappear. Check in
            at day 7 and day 30.
          </Bullet>
        </ul>
      </Card>
    </div>
  );
}

function FollowUp() {
  return (
    <div className="space-y-4">
      <Card title="SMS after first call (same day)">
        <Script>
          {`"Hey [First name], great chatting. Here's the live preview of the new site I built for you: [link]. Take a look when you get a sec — happy to answer questions. — [Your name]"`}
        </Script>
      </Card>

      <Card title="Email — day 1 (after no answer)">
        <Script>
          {`Subject: Your new [Business name] site — take a look

Hey [First name],

I tried you earlier today. Short version: I built a new version of your website this week and it's already live for you to look at.

[Preview link]

It's got your business name, services, a contact form that rings your phone, and local SEO pages for [city]. Takes about 2 minutes to look through.

If you like it, let's jump on a quick call and I'll walk you through how we get it launched under your domain. If not, no hard feelings — just close the tab.

— [Your name]
[Your phone]`}
        </Script>
      </Card>

      <Card title="Email — day 4 (the nudge)">
        <Script>
          {`Subject: re: Your new [Business name] site

Hey [First name],

Following up on the site I sent earlier this week. I know you're busy — here's the link one more time in case it got buried: [preview link]

Two quick questions:
1. Did you have a chance to look?
2. What did you think?

If the timing's not right, totally fair — just let me know and I'll get out of your inbox.

— [Your name]`}
        </Script>
      </Card>

      <Card title="Email — day 10 (the break-up)">
        <Script>
          {`Subject: Closing your file?

Hey [First name],

Haven't heard back, so I'm assuming the timing isn't right — I'll close your file and stop following up.

If that changes, you know where to find me. The preview link will stay live for another 14 days in case you want to show anyone: [preview link]

Best,
[Your name]`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Break-up emails often pull in the highest reply rate of any follow-up.
        </p>
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Script({
  children,
  embedded,
}: {
  children: string;
  embedded?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const text = typeof children === "string" ? children : String(children);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked
    }
  }

  return (
    <div
      className={`relative rounded-md border border-slate-800 ${
        embedded ? "bg-slate-900/60" : "bg-slate-950/60"
      } p-3 pr-12`}
    >
      <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed text-slate-200">
        {text}
      </pre>
      <button
        onClick={copy}
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md border border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
        title="Copy"
        aria-label="Copy script"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
      <span>{children}</span>
    </li>
  );
}

function Benefit({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/40 p-3">
      <div className="text-xs font-semibold text-white">{title}</div>
      <p className="mt-1 text-xs text-slate-400">{children}</p>
    </div>
  );
}
