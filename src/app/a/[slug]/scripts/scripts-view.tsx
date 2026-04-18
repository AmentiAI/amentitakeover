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
  Search,
  Briefcase,
  Send,
  Users,
} from "lucide-react";

type TabKey =
  | "pitch"
  | "cold"
  | "discovery"
  | "industries"
  | "voicemail"
  | "sms"
  | "objections"
  | "close"
  | "followup"
  | "referrals";

const TABS: { key: TabKey; label: string; icon: typeof Phone }[] = [
  { key: "pitch", label: "Elevator pitch", icon: Sparkles },
  { key: "cold", label: "Cold call", icon: Phone },
  { key: "discovery", label: "Discovery", icon: Search },
  { key: "industries", label: "By industry", icon: Briefcase },
  { key: "voicemail", label: "Voicemail", icon: MessageSquare },
  { key: "sms", label: "SMS / DM", icon: Send },
  { key: "objections", label: "Objections", icon: Shield },
  { key: "close", label: "Closing", icon: Target },
  { key: "followup", label: "Follow-up", icon: Mail },
  { key: "referrals", label: "Referrals", icon: Users },
];

export function ScriptsView({ commissionPct }: { commissionPct: number }) {
  const [tab, setTab] = useState<TabKey>("pitch");

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-white">Sales playbook</h1>
          <p className="mt-1 text-xs text-slate-400">
            Battle-tested scripts, objection handlers, and closing frameworks.
            Use the <span className="font-semibold text-slate-200">New</span>{" "}
            button on Opportunities to show prospects their mocked-up site live.
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
        {tab === "discovery" && <Discovery />}
        {tab === "industries" && <Industries />}
        {tab === "voicemail" && <Voicemail />}
        {tab === "sms" && <SMS />}
        {tab === "objections" && <Objections />}
        {tab === "close" && <Closing />}
        {tab === "followup" && <FollowUp />}
        {tab === "referrals" && <Referrals />}
      </div>
    </div>
  );
}

/* ───────────────────── Elevator pitch ───────────────────── */

function ElevatorPitch() {
  return (
    <div className="space-y-4">
      <Card title="The 15-second hook (for networking, events, intros)">
        <Script>
          {`"I build you a new website — before you pay anything. Walk away if you don't like it, launch it if you do."`}
        </Script>
      </Card>

      <Card title="The 30-second pitch">
        <Script>
          {`"We build websites and run SEO for local businesses — but here's what's different. Before you pay anything, I'll show you a fully-built version of your new site with your name, photos, and services on it. If you like what you see, we launch it. If not, you walk away. That's it."`}
        </Script>
      </Card>

      <Card title="The 60-second pitch (for longer conversations)">
        <Script>
          {`"Most marketing agencies ask you to sign a contract, pay a setup fee, then hope you like what they build 6 weeks later. We do it backwards. We build your new site first — a full, live preview with your business name, services, photos, everything — and send you a link. You look at it. If it's a yes, we launch it under your domain and start driving SEO traffic the same week. If it's a no, you've lost nothing except 5 minutes looking at it. Starter plans run $300/month, Growth is $700/month and includes local SEO and ongoing content. Setup ranges from $800 to $1,500 depending on the plan. No long-term contract, 30-day out anytime."`}
        </Script>
      </Card>

      <Card title="The 'one-liner' openers (pick your favorite)">
        <div className="space-y-3">
          <Script embedded>
            {`"I already built your new website. You want to see it?"`}
          </Script>
          <Script embedded>
            {`"We're the only agency that builds you a new site before you pay. I want to send you the preview link I made for [Business name]."`}
          </Script>
          <Script embedded>
            {`"I got a weird request — can I show you a website I built for you this week and get your honest opinion?"`}
          </Script>
          <Script embedded>
            {`"I'm the guy who'll give you a new website without asking for a contract first. Got 2 minutes?"`}
          </Script>
        </div>
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
          <Bullet>
            <b>Prospects do the selling for you.</b> When they see their own
            name and services on a clean modern site, they convince themselves
            it&apos;s time.
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

/* ───────────────────── Cold call ───────────────────── */

function ColdCall() {
  return (
    <div className="space-y-4">
      <Card title="Step 1 — the pattern interrupt opener">
        <Script>
          {`"Hey [First name], this is [Your name] — I know you weren't expecting my call, do you have 27 seconds for the reason I'm calling?"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          The specific number (27 seconds, not 30) makes them pause. Most will
          say &quot;go ahead.&quot;
        </p>
      </Card>

      <Card title="Opener alternatives (rotate these — don't sound like everyone else)">
        <div className="space-y-3">
          <Script embedded>
            {`"Hi [First name] — quick one, do you have a sec or did I catch you at a bad time?"`}
          </Script>
          <p className="text-[11px] text-slate-500">
            Giving them an out makes them less defensive. Most will say
            &quot;what&apos;s up.&quot;
          </p>
          <Script embedded>
            {`"Hey [First name], this is [Your name]. I'm going to be upfront — this is a cold call. Want to hang up, or give me 30 seconds?"`}
          </Script>
          <p className="text-[11px] text-slate-500">
            Transparency disarms people. Works surprisingly well on
            owner-operators.
          </p>
          <Script embedded>
            {`"Hey — is this [First name]? Sorry to bug you mid-day. I actually did something for your business and wanted to run it by you real quick."`}
          </Script>
        </div>
      </Card>

      <Card title="Step 2 — the hook (make it about them, be specific)">
        <Script>
          {`"I was looking at [Business name]'s website and I noticed [something specific: site looks dated, not mobile-friendly, slow to load, no SSL padlock, missing service pages for [city], outranked on Google by [competitor]]. I actually built a new version of your site this week that I'd like to show you — it's already live, with your name and services on it. Takes 2 minutes to walk through. Can I text you the link, or easier to pull it up while we're on the phone?"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Always reference something specific about their current site.
          Curiosity + having already done the work = hard to say no.
        </p>
      </Card>

      <Card title="Hook variations by problem you spotted">
        <div className="space-y-3">
          <Script embedded>
            {`"Looked at your Google Business listing — you've got great reviews but you're not showing up in the map pack for [service] in [city]. I built you a version of a site that would fix that. Want to see it?"`}
          </Script>
          <Script embedded>
            {`"I saw your site was built on [old platform] and hadn't been updated since [year]. I rebuilt it on something modern — same brand, way faster. Got 2 minutes?"`}
          </Script>
          <Script embedded>
            {`"Your phone number is buried three clicks deep on your current site. I built you one where it's the first thing a customer sees. Can I send it over?"`}
          </Script>
          <Script embedded>
            {`"You're ranking for your business name but not for '[service] in [city]' — that's where the money is. I already built the site that would target that. Want the link?"`}
          </Script>
        </div>
      </Card>

      <Card title="Step 3 — the demo (let the site sell itself)">
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
          <Bullet>
            Silence is fine. Don&apos;t fill it. Whoever talks next loses.
          </Bullet>
        </ul>
      </Card>

      <Card title="Step 4 — trial close after demo">
        <Script>
          {`"On a scale of 1-10, how close is that to what you'd want your website to look like?"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Any number 7 or above — they&apos;re basically bought in. Ask what
          would make it a 10 and close on that.
        </p>
      </Card>

      <Card title="Gatekeeper bypass (when you hit a receptionist or assistant)">
        <div className="space-y-3">
          <Script embedded>
            {`"Hey — can you connect me to whoever handles the website and marketing? I actually built a new site for [Business name] and I want to send them the link."`}
          </Script>
          <Script embedded>
            {`"Hi — quick one, is [Owner first name] around? I was referred over."`}
          </Script>
          <p className="text-[11px] text-slate-500">
            &quot;Referred&quot; is technically true if you found them through
            any directory or Google search.
          </p>
          <Script embedded>
            {`"Hey — I'm going to be quick. I'm not trying to sell you anything, I built a preview website for the business and want to send [Owner] the link. Can you text him/her my number?"`}
          </Script>
        </div>
      </Card>
    </div>
  );
}

/* ───────────────────── Discovery ───────────────────── */

function Discovery() {
  return (
    <div className="space-y-4">
      <Card title="Use these BEFORE talking about price or features">
        <p className="text-sm text-slate-300">
          The more they talk about their pain, the less pushback you get on
          price. Your job: ask, listen, take notes, reflect back.
        </p>
      </Card>

      <Card title="Opening questions (understand their business)">
        <ul className="space-y-2 text-sm text-slate-300">
          <Bullet>
            &quot;How long have you been running [Business name]?&quot;
          </Bullet>
          <Bullet>
            &quot;What are you best known for? What do your best customers come
            to you for?&quot;
          </Bullet>
          <Bullet>
            &quot;Who are your main competitors in [city] — who would you lose
            a deal to?&quot;
          </Bullet>
          <Bullet>
            &quot;Walk me through a typical week — how busy are you, what does
            your team look like?&quot;
          </Bullet>
        </ul>
      </Card>

      <Card title="Lead-flow questions (find the pain)">
        <ul className="space-y-2 text-sm text-slate-300">
          <Bullet>
            &quot;How are most of your new customers finding you right
            now?&quot;
          </Bullet>
          <Bullet>
            &quot;Roughly how many jobs a month are you doing? Where would you
            want that number to be?&quot;
          </Bullet>
          <Bullet>
            &quot;When someone searches &apos;[service] in [city]&apos; on
            Google — do you know where you rank?&quot;
          </Bullet>
          <Bullet>
            &quot;If you had 5 more qualified leads coming in every month, what
            would that do for your business?&quot;
          </Bullet>
          <Bullet>
            &quot;What&apos;s the average value of a new customer to
            you?&quot;
          </Bullet>
          <Bullet>
            &quot;When you get a lead, what percent close? What&apos;s your
            close rate?&quot;
          </Bullet>
        </ul>
      </Card>

      <Card title="Website questions (set up the pitch)">
        <ul className="space-y-2 text-sm text-slate-300">
          <Bullet>
            &quot;Who built your current site — and when?&quot;
          </Bullet>
          <Bullet>
            &quot;How often do you get calls or leads off of it?&quot;
          </Bullet>
          <Bullet>
            &quot;Have you ever invested in SEO or Google Ads? What was the
            experience?&quot;
          </Bullet>
          <Bullet>
            &quot;Are you happy with how it looks? Be honest — I&apos;m not
            offended.&quot;
          </Bullet>
          <Bullet>
            &quot;If you could change one thing about how your business is
            found online, what would it be?&quot;
          </Bullet>
        </ul>
      </Card>

      <Card title="Budget and decision questions (qualify)">
        <ul className="space-y-2 text-sm text-slate-300">
          <Bullet>
            &quot;What have you spent on marketing in the past — what worked,
            what didn&apos;t?&quot;
          </Bullet>
          <Bullet>
            &quot;If I could wave a wand and get you [X] more jobs a month,
            what would that be worth to invest in?&quot;
          </Bullet>
          <Bullet>
            &quot;When you make a decision like this — is it just you, or is
            there a partner / spouse / business partner involved?&quot;
          </Bullet>
          <Bullet>
            &quot;If you liked what I showed you, what would stop you from
            moving forward this week?&quot;
          </Bullet>
        </ul>
      </Card>

      <Card title="Pain-amplifying questions (use sparingly)">
        <ul className="space-y-2 text-sm text-slate-300">
          <Bullet>
            &quot;If you keep doing exactly what you&apos;re doing now for the
            next 12 months — where do you end up?&quot;
          </Bullet>
          <Bullet>
            &quot;What&apos;s the cost of NOT fixing this? Like, what does it
            cost you every month you don&apos;t have customers finding you
            online?&quot;
          </Bullet>
          <Bullet>
            &quot;You said you&apos;re doing [X] jobs a month. What&apos;s the
            ceiling if nothing changes?&quot;
          </Bullet>
        </ul>
      </Card>

      <Card title="The transition question (bridge to the pitch)">
        <Script>
          {`"Okay — based on what you just told me, it sounds like [reflect their pain back: you're busy but inconsistent / you're stuck on referrals / your site isn't bringing you anything]. Is that fair?

If I could show you a version of your website — already built, already live — that would fix [that specific thing], would it be worth 2 minutes to look at it?"`}
        </Script>
      </Card>
    </div>
  );
}

/* ───────────────────── Industries ───────────────────── */

function Industries() {
  const industries = [
    {
      name: "Roofing",
      hook: `"Roofing is 80% Google at this point. When someone's roof is leaking, they pull out their phone and call the first three results. I built you a site designed to be one of those three. Want to see it?"`,
      pain: `"Insurance restoration leads go to whoever ranks first on Google for 'storm damage roofing [city].' Let me show you a site built to own that keyword."`,
      value: `"One retail roof job is $8–15k. Our Growth plan is $700/month. One extra job every 2 months pays for it 10x."`,
    },
    {
      name: "HVAC",
      hook: `"HVAC is all about emergency calls — broken AC in July, dead furnace in January. I built you a site that captures those calls before they hit a competitor. Got 2 minutes?"`,
      pain: `"Most HVAC sites look like they were built in 2011. When someone's sweating or freezing, they click the site that LOOKS trustworthy. Yours has to be the one they click."`,
      value: `"A new install is $6–12k. One extra install a quarter more than covers the Growth plan."`,
    },
    {
      name: "Plumbing",
      hook: `"Plumbing calls happen at 2am when something's leaking on the floor. I built you a site where the call button is impossible to miss — because on mobile, yours is buried. Want to see it?"`,
      pain: `"People don't shop around for a plumber — they call whoever comes up first and looks legit. That's the game."`,
      value: `"One drain clean is $300, one water heater is $2k, one re-pipe is $5–15k. Our plan costs less than a single water heater install per month."`,
    },
    {
      name: "Electrician",
      hook: `"Electrical work is all trust — people want licensed, insured, and reviewed BEFORE they let you touch their panel. I built your new site around that. Got a minute?"`,
      pain: `"You're invisible in the map pack for 'electrician near me' — I checked. That's the single biggest source of calls for electricians."`,
      value: `"Panel upgrades are $2–4k, service calls $150–500. One extra job a month from SEO is pure profit."`,
    },
    {
      name: "Dental",
      hook: `"New patient lifetime value for a dental practice is $3–5k. Our Growth plan is $700/month. One new patient every 2 months makes it obvious."`,
      pain: `"Every mom searching 'dentist that takes [insurance] in [city]' — is she finding you, or the DSO chain down the road?"`,
      value: `"We build the local pages, the insurance pages, the procedure pages — everything a patient Googles before they call."`,
    },
    {
      name: "Law / Attorney",
      hook: `"Personal injury and family law cases come through Google now. A single PI case is $15k+ in fees. I built you a site designed to show up when someone searches '[practice area] lawyer in [city].'"`,
      pain: `"Your competitors are spending $3–10k/month on legal SEO. That's why they rank. This is the baseline, not premium."`,
      value: `"One signed case covers us for a year+. Let me show you what I built."`,
    },
    {
      name: "Restaurant",
      hook: `"Most restaurant sites look terrible on mobile, and menus are usually broken PDFs. I rebuilt yours with an easy menu, reservations, and order-online. Want to see it?"`,
      pain: `"Google My Business + a clean site beats DoorDash commission. Direct orders = 30% more margin."`,
      value: `"If we help you pull even 20 direct orders a month off of third-party apps, you net back what you pay us."`,
    },
    {
      name: "Med spa / Aesthetics",
      hook: `"Aesthetics is pure Instagram + Google. I built you a site with before/after galleries, service pages for every treatment, and online booking. Got a sec?"`,
      pain: `"Every injector in [city] is fighting for the same searches. Site quality is the tiebreaker."`,
      value: `"A single Botox client repeat-books 4x a year at $400. LTV is crazy — and SEO brings them in cold."`,
    },
    {
      name: "Real estate",
      hook: `"Most agent sites are just a logo and a Zillow widget. I built you one with neighborhood pages, buyer/seller guides, and IDX — the stuff that actually ranks. Want to look?"`,
      pain: `"A single commission covers us for 3+ years. We just need to get you one extra closing a year."`,
      value: `"People Google '[neighborhood] homes for sale' — we build pages that rank for every neighborhood you serve."`,
    },
    {
      name: "Contractor / Remodel",
      hook: `"Kitchen remodels, bathroom remodels, additions — all high-intent Google searches. I built you a site with project galleries organized by service. Got 2 minutes?"`,
      pain: `"Remodel shoppers look at 3-5 contractors before they call. Your site is literally your first impression."`,
      value: `"Average remodel is $30–80k. One extra project a year = massive ROI on a $700/month marketing plan."`,
    },
    {
      name: "Auto repair",
      hook: `"When a check engine light comes on, people Google 'mechanic near me.' Whoever ranks + has good reviews + a clean site gets the call. I built yours. Want to see it?"`,
      pain: `"You're not losing loyal customers — you're losing all the new ones who don't know you exist yet."`,
      value: `"$300 average RO × one extra car a week = $1,200+/month. Plan pays for itself on the first extra job."`,
    },
    {
      name: "Gym / Fitness",
      hook: `"Gyms live or die on monthly signups. I built you a site with membership pages, a tour request form, and clear pricing. 2 minutes?"`,
      pain: `"$99/month × 12 months × even 2 extra signups a month = $2,400 in LTV for $0 of new effort on your end."`,
      value: `"Class schedules, trainer bios, free-trial offers — all baked in."`,
    },
  ];

  return (
    <div className="space-y-3">
      <Card title="Industry-specific hooks">
        <p className="text-sm text-slate-300">
          The more specific you are about their world, the more they trust you.
          Use the right hook for the business you&apos;re calling.
        </p>
      </Card>
      {industries.map((ind) => (
        <IndustryCard
          key={ind.name}
          name={ind.name}
          hook={ind.hook}
          pain={ind.pain}
          value={ind.value}
        />
      ))}
    </div>
  );
}

function IndustryCard({
  name,
  hook,
  pain,
  value,
}: {
  name: string;
  hook: string;
  pain: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-slate-900/60"
      >
        <span className="flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
          {name}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-800 bg-slate-950/60 px-4 py-3">
          <Labeled label="Opening hook">
            <Script embedded>{hook}</Script>
          </Labeled>
          <Labeled label="Pain frame">
            <Script embedded>{pain}</Script>
          </Labeled>
          <Labeled label="Value frame">
            <Script embedded>{value}</Script>
          </Labeled>
        </div>
      )}
    </div>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      {children}
    </div>
  );
}

/* ───────────────────── Voicemail ───────────────────── */

function Voicemail() {
  return (
    <div className="space-y-4">
      <Card title="Rule: keep them under 20 seconds">
        <p className="text-sm text-slate-300">
          Long voicemails get deleted at second 5. Say your name, the specific
          thing, your callback number, and get off.
        </p>
      </Card>

      <Card title="Voicemail #1 — the curiosity hook">
        <Script>
          {`"Hey [First name], this is [Your name]. I actually built a new website for [Business name] this week — it's already live and I wanted to send it over for you to look at. Call or text me back at [your number] and I'll share the link. Thanks."`}
        </Script>
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

      <Card title="Voicemail — specific problem angle">
        <Script>
          {`"Hey [First name], [Your name] here — I was poking around and noticed your site isn't showing up on the first page for '[service] in [city]' — that's probably costing you 3-5 leads a month. Built a version that fixes it. Hit me back at [number] and I'll text you the preview."`}
        </Script>
      </Card>

      <Card title="Voicemail — competitor angle">
        <Script>
          {`"Hey [First name] — I was looking at you and [Competitor] side by side on Google. They're ranking above you for [keyword]. I built a version of your site designed to fix that. Call me at [number]."`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Competitor envy is one of the strongest triggers. Use this sparingly —
          only when they actually are being outranked.
        </p>
      </Card>

      <Card title="Voicemail — humor / disarming">
        <Script>
          {`"Hey [First name], I know you probably ignored my last voicemail — I'd ignore mine too. So let me make it worth it: I'll text you a link to a new website I built for [Business name], you look at it, and if it's garbage you never have to hear from me again. Deal?"`}
        </Script>
      </Card>

      <Card title="Voicemail — referral name-drop">
        <Script>
          {`"Hey [First name], [Your name] — I was chatting with [Mutual contact / other business owner in town] and they mentioned your name. I built a preview site for [Business name] and wanted to send it over. Ring me at [number]."`}
        </Script>
      </Card>
    </div>
  );
}

/* ───────────────────── SMS / DM ───────────────────── */

function SMS() {
  return (
    <div className="space-y-4">
      <Card title="Rule: first SMS is curiosity, second is value, third is takeaway">
        <p className="text-sm text-slate-300">
          Texts get read within 3 minutes. Don&apos;t waste them with a wall of
          info — drive to a link or a reply.
        </p>
      </Card>

      <Card title="Cold SMS #1 — the curiosity opener">
        <Script>
          {`"Hey [First name] — [Your name] here. Weird question: did I catch you at a bad time? I built a website for [Business name] this week and wanted to send you the preview."`}
        </Script>
      </Card>

      <Card title="Cold SMS #1 — alternative">
        <Script>
          {`"Hi [First name], I'm [Your name] from Amenti. I rebuilt your website as a demo — here's the live preview: [link]. No pitch, just want your honest take."`}
        </Script>
      </Card>

      <Card title="Cold SMS #2 — after no response (2-3 days later)">
        <Script>
          {`"Hey [First name] — following up. Did the preview link land? If it's a no, I'll stop bugging you. If you want to chat about what's included, I'm free today 2-4pm."`}
        </Script>
      </Card>

      <Card title="Cold SMS #3 — the takeaway">
        <Script>
          {`"[First name], I'm going to close your file since I haven't heard back. Preview stays live for 2 more weeks at [link] in case you want to peek. Appreciate your time."`}
        </Script>
      </Card>

      <Card title="SMS after a voicemail (same day)">
        <Script>
          {`"Hey [First name], just left you a VM. Here's the preview I mentioned: [link]. No rush — take a look when you can."`}
        </Script>
      </Card>

      <Card title="SMS after a great demo call">
        <Script>
          {`"Really enjoyed the chat [First name]. Preview is at [link] — share it with [partner/spouse] if you want their take. Hop on a call when you're ready to dial in details."`}
        </Script>
      </Card>

      <Card title="Instagram / Facebook DM (local businesses often live here)">
        <Script>
          {`"Hey! [Your name] from Amenti. Love what you're doing at [Business name] 👋 — I actually built a preview of a new website for you this week. Can I DM you the link? Totally cool if not, figured I'd ask."`}
        </Script>
      </Card>

      <Card title="LinkedIn DM (B2B and professional services)">
        <Script>
          {`"Hi [First name] — saw [Business name] in the [industry] space in [city]. I put together a website rebuild preview for you that targets local SEO for [main service]. Here's the live link: [url]. Happy to walk through it if useful — no pressure either way."`}
        </Script>
      </Card>

      <Card title="WhatsApp / SMS — after in-person meeting">
        <Script>
          {`"Great meeting you at [event / location], [First name]. Here's the preview I mentioned: [link]. Ping me when you've had a look."`}
        </Script>
      </Card>
    </div>
  );
}

/* ───────────────────── Objections ───────────────────── */

function Objections() {
  const items = [
    {
      q: "We already have a website.",
      a: `"Totally — most of the businesses I talk to do. The question isn't 'do you have one,' it's 'is it bringing you customers?' I already built a new version for you — takes 2 minutes to compare. If yours is outperforming mine, I'll buy you coffee. Fair?"`,
    },
    {
      q: "It's too expensive.",
      a: `"I hear you. Let's back into it — one new [job type] is worth what, $[deal size] to you? Our Growth plan is $700/month. If we bring you one extra job every other month, it pays for itself 10x. And the setup is $1,500, one time. Want me to show you what's included?"`,
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
    {
      q: "We tried SEO before and it didn't work.",
      a: `"That's super common — most SEO is a black box where you pay for 'activity' and hope for rankings. We do it differently: you see the actual pages we build, the actual keywords we target, and you get a report every month showing where you rank for each one. What did your last SEO guy actually deliver?"`,
    },
    {
      q: "My nephew / brother-in-law / the kid down the street builds sites.",
      a: `"Love that — save some money there. Real question: when their site is built, who's running the SEO? Who's updating it when Google changes algorithms? Who's writing the content that ranks? The site is the easy part — the ongoing work is where results come from."`,
    },
    {
      q: "I'm not ready to commit to a contract.",
      a: `"Great news — we don't do long-term contracts. 30 days out anytime. If we're not earning the monthly fee, you fire us. That's kind of the whole point of what we do."`,
    },
    {
      q: "We do okay on Facebook / social media.",
      a: `"Love that, social builds relationships. Here's the issue — when a new customer hears about you, 80% of them Google you before they call. If what they find there isn't as strong as your Facebook, you lose the deal before it starts. We make sure the Google result matches the quality of your social."`,
    },
    {
      q: "Who else have you done this for?",
      a: `"Fair ask — let me send you over a few examples [or 'I can introduce you to one of our clients in [similar industry]']. But honestly the best proof is the site I already built for you — look at it and tell me if that's the quality you'd want."`,
    },
    {
      q: "Can you guarantee I'll rank #1 on Google?",
      a: `"No — and anyone who does is lying. What I can guarantee is transparent reporting every month showing exactly where you rank, what traffic you're getting, and what leads came in. If the numbers aren't moving, we change the strategy or you fire us."`,
    },
    {
      q: "How long until I see results?",
      a: `"The site is live in 7-10 days. You'll see Google Business Profile calls increase inside 30 days. Meaningful SEO movement — being on page 1 for your city + service — usually lands in the 90-180 day window. Anyone promising overnight results is running a scam."`,
    },
    {
      q: "I just need a website, not the marketing.",
      a: `"Totally fine — we offer Starter at $300/month which is website + hosting + basic SEO + monthly updates. No long-term content plan. If you ever want to scale up to full SEO later, we flip a switch. Want me to walk you through Starter?"`,
    },
    {
      q: "What if I want to cancel?",
      a: `"30-day notice, any time. We don't own your domain, your content, or your brand — if you leave, you take everything with you. That's on purpose. We want you to stay because the work's paying off, not because you're locked in."`,
    },
    {
      q: "How are you different from GoDaddy / Wix / Squarespace?",
      a: `"Those are DIY tools — you build it yourself. Great if you have time and design sense. We do the work for you, plus we run the SEO and Google Business Profile to drive traffic. A template site with no SEO is like putting up a billboard in the desert."`,
    },
    {
      q: "I'm too busy to deal with this right now.",
      a: `"That's exactly the reason to hire us. The whole pitch is: you do zero work. I already built the site — you just approve. We handle Google, content, SEO, all of it. 15 minutes of your time to kick off, then we report monthly. What day next week is worst for you? Let's pick the opposite of that for a call."`,
    },
    {
      q: "Why is the setup fee so high?",
      a: `"Because we're actually building you a custom site — not a drag-and-drop template. It covers design, copywriting for your pages, local SEO setup, Google Business Profile optimization, analytics, and the first 30 days of migration support. Compare that to agencies charging $5-10k for the same thing."`,
    },
    {
      q: "I want to shop around.",
      a: `"Totally fair — and honestly I'd recommend it. Go get 2-3 other quotes. While you do, your preview site stays live at [link]. When you compare, you'll see that (a) most agencies want a contract, (b) most charge setup fees of $3-5k+, and (c) none of them show you the work before you pay. Come back when you've seen the market — I'll be here."`,
    },
    {
      q: "How do I know this isn't a scam?",
      a: `"Fair question. You've seen the site I already built for you — that's real. You can Google Amenti AI, see our reviews, meet our team. We're based in [location], our founders have built [X] sites, here's our phone number and address. No contract, 30-day out, you pay monthly — if we were a scam we wouldn't make it easy to cancel."`,
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

/* ───────────────────── Closing ───────────────────── */

function Closing() {
  return (
    <div className="space-y-4">
      <Card title="The trial close (use this after the demo, before you ask for the sale)">
        <Script>
          {`"On a scale of 1-10, how close is what I just showed you to what you'd want your new site to look like?"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Any 7+ → close them. Below 7 → ask what would make it a 10 and fix
          it.
        </p>
      </Card>

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
          {`"Two options — Starter at $300/month gets your new site live with basic SEO, or Growth at $700/month adds the local landing pages and ongoing blog content so you rank higher. Which one fits where you are right now?"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Give them A or B, not yes or no. Most will pick one.
        </p>
      </Card>

      <Card title="Summary close (for analytical buyers)">
        <Script>
          {`"Let me just recap what we talked about. You said your biggest issue is [pain]. You wanted [outcome]. The Growth plan fixes that by [specific thing #1], [thing #2], and [thing #3]. It's $700/month with a $1,500 one-time setup, no contract, 30-day out any time. Does that line up with what you need?"`}
        </Script>
      </Card>

      <Card title="Urgency / scarcity close">
        <Script>
          {`"I can only build 3 of these sites a month because we actually customize each one. I've got 1 spot left this month. Want to lock it in, or should I put you on next month's list?"`}
        </Script>
      </Card>

      <Card title="Risk-reversal close">
        <Script>
          {`"Here's what I'll do — let's get you live this month. You'll see leads starting to come in within 30 days. If by day 60 you're not seeing a clear return, I'll refund the setup fee. No long-term contract, cancel with 30 days' notice. How's that?"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Run refund offers by Amenti ops before promising specifically.
          It&apos;s a powerful closer but needs to be backed up.
        </p>
      </Card>

      <Card title="Puppy-dog close (let them 'try' the preview)">
        <Script>
          {`"Tell you what — the preview site is already live. Keep the link, show it to your spouse, your team, anyone whose opinion matters. Come back in 48 hours and tell me what you want to change. If it's still a no after that, no hard feelings. Sound fair?"`}
        </Script>
      </Card>

      <Card title="Columbo close (the 'one more thing')">
        <Script>
          {`"Alright, I get it — not a fit right now. Hey, before I hang up, just for my own curiosity — if I could have done ONE thing differently to make this a yes today, what would it have been?"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Once they tell you the real objection, you can address it and
          resurrect the deal. Works shockingly often.
        </p>
      </Card>

      <Card title="Ben Franklin close (for fence-sitters)">
        <Script>
          {`"Okay — let's just write it out. On the 'yes' side: you get a new site live in 10 days, you start ranking for [keywords], your phone starts ringing more, no contract, 30-day out. On the 'no' side: you keep everything exactly how it is today. Which list looks better for your business right now?"`}
        </Script>
      </Card>

      <Card title="The 'if I could / would you' close">
        <Script>
          {`"If I could [get you launched by [date] / knock $200 off the setup / throw in the Google Business optimization for free], would you be ready to move forward today?"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Don&apos;t negotiate down unless they commit up.
        </p>
      </Card>

      <Card title="Takeaway close (for prospects pumping the brakes)">
        <Script>
          {`"You know what, honestly — I'm not sure this is the right fit for you. We only take on businesses that are ready to grow, and it doesn't sound like the timing's there. Let's revisit in 6 months."`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          95% of the time they&apos;ll push back and tell you why it IS the
          right time. Use carefully — only with prospects who are clearly
          stalling, not with genuine concerns.
        </p>
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
          <Bullet>
            Ask for a referral IMMEDIATELY. Buyer&apos;s high is the best time.
          </Bullet>
        </ul>
      </Card>
    </div>
  );
}

/* ───────────────────── Follow-up ───────────────────── */

function FollowUp() {
  return (
    <div className="space-y-4">
      <Card title="The 7-touch cadence (the gold standard)">
        <ul className="space-y-1 text-sm text-slate-300">
          <Bullet>
            <b>Day 0</b> — Cold call + voicemail + SMS with preview link
          </Bullet>
          <Bullet>
            <b>Day 2</b> — Email with preview + 2 sentences on what&apos;s
            included
          </Bullet>
          <Bullet>
            <b>Day 4</b> — SMS: &quot;Did the preview land?&quot;
          </Bullet>
          <Bullet>
            <b>Day 7</b> — Call #2 + different voicemail angle
          </Bullet>
          <Bullet>
            <b>Day 10</b> — Value-add email (a case study, a stat, a link)
          </Bullet>
          <Bullet>
            <b>Day 14</b> — Takeaway SMS: &quot;Closing your file.&quot;
          </Bullet>
          <Bullet>
            <b>Day 21</b> — Break-up email: &quot;Last one from me.&quot;
          </Bullet>
        </ul>
        <p className="mt-2 text-xs text-slate-400">
          80% of deals close between touch 5 and 12. Most people quit at 2.
          That&apos;s why this works.
        </p>
      </Card>

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

      <Card title="Email — day 2 (the problem-focused nudge)">
        <Script>
          {`Subject: Quick thing about [Business name]'s Google ranking

Hey [First name],

Looked at where [Business name] shows up on Google for "[primary keyword]" vs [Competitor] — you're currently on page 2. That's basically invisible. Most clicks go to positions 1-3.

I built you a version of your site designed to fix that exact problem: [link]

If there's a better time to chat, send me a window and I'll call. If you want me to stop bugging you, say the word — all respect.

— [Your name]`}
        </Script>
      </Card>

      <Card title="Email — day 4 (the straight-up ask)">
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

      <Card title="Email — day 7 (the 'different angle' email)">
        <Script>
          {`Subject: One stat about local SEO

Hey [First name],

Quick one while I'm thinking of you. 46% of all Google searches are looking for local info. For your industry it's closer to 70%. Which means if you're not showing up when someone in [city] searches for [service], you're handing business to whoever is.

That preview site I sent: [link]

Built specifically to rank for [city] searches. Takes 10 days to launch, $1,500 one-time setup, $700/month ongoing.

Want to hop on a call? Wednesday works: [calendar link] / I'm open 2pm, 3pm, 4pm.

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
          Break-up emails often pull in the highest reply rate of any
          follow-up.
        </p>
      </Card>

      <Card title="Email — 'reactivation' 30–60 days after break-up">
        <Script>
          {`Subject: Still thinking about [Business name]

Hey [First name],

It's been a minute. I was doing a cleanup of old previews and saw the one I built for [Business name] — still looks good.

Quick check-in: anything change on your end? Happy to rebuild the preview with anything you wanted different.

— [Your name]`}
        </Script>
      </Card>

      <Card title="Call #2 script (re-approach after no response)">
        <Script>
          {`"Hey [First name], [Your name] again. Last time we talked you were slammed — I didn't want to lose touch. Did you get a chance to look at the preview I sent? What's your honest read?"`}
        </Script>
      </Card>

      <Card title="The post-no follow-up (the 'stay in touch' email)">
        <Script>
          {`Subject: No worries — staying in your corner

Hey [First name],

Appreciate you being straight with me that now's not the right time. No hard feelings at all.

I'll drop you a note in 3-4 months just to check in. In the meantime, the preview stays live at [link] — keep the link, show it around, whatever.

If anything changes, my number is [phone].

— [Your name]`}
        </Script>
      </Card>
    </div>
  );
}

/* ───────────────────── Referrals ───────────────────── */

function Referrals() {
  return (
    <div className="space-y-4">
      <Card title="The golden rule: ask for referrals RIGHT after the sale">
        <p className="text-sm text-slate-300">
          Buyer&apos;s high is a real thing. The moment they&apos;ve committed,
          their dopamine is up and they want to validate the decision. A
          referral ask then converts at 3-5x the rate of an ask a month later.
        </p>
      </Card>

      <Card title="Right after they sign — the immediate ask">
        <Script>
          {`"Awesome — welcome aboard. Quick one before I let you go: you know another [industry] owner who'd love this? I'll do their preview for free and, honestly, the more of you guys we work with the better our pricing keeps getting. Who comes to mind?"`}
        </Script>
      </Card>

      <Card title="30 days after launch — the 'I delivered' ask">
        <Script>
          {`"Hey [First name] — first month report. [Report stats]. You happy? Good. Now — who do you know that's where you were 30 days ago? I'd love to do for them what we did for you."`}
        </Script>
      </Card>

      <Card title="Referral intro — what to ask them to send">
        <Script>
          {`"Easiest thing — could you text them something like: 'Hey, these guys Amenti just rebuilt my site and it's driving real calls. They do a free preview before you pay anything. I told [Your name] to reach out.'"`}
        </Script>
        <p className="mt-2 text-xs text-slate-400">
          Always write the intro FOR them. Friction kills referrals.
        </p>
      </Card>

      <Card title="Warm-intro cold call (when you have a referral)">
        <Script>
          {`"Hey [First name], [Your name] from Amenti — [Referrer name] over at [their business] asked me to call you. They said you were the kind of owner I should show what we do. Got 2 minutes? I already put together a preview based on what [Referrer] told me about your business."`}
        </Script>
      </Card>

      <Card title="Networking / chamber / BNI script">
        <Script>
          {`"I work with local businesses in [city] to get their websites and Google rankings fixed — but here's what's different: I build the new site first as a free preview, before you pay a dime. You see the work, then you decide. That reverse-risk thing is how we've grown. Happy to build one for anyone in the room who's curious."`}
        </Script>
      </Card>

      <Card title="Partnerships — other agencies and complementary services">
        <Script>
          {`"I'm looking for partners who work with local businesses but don't build sites or run SEO themselves — think accountants, insurance agents, commercial realtors, contractors, etc. Every time you refer someone and they close, you get [partner commission] / I send you a bottle of [thing]. Want to be on that list?"`}
        </Script>
      </Card>

      <Card title="The 'favor ask' (soft referral)">
        <Script>
          {`"Quick favor — I'm trying to grow and my best clients are the ones who found me through someone they trust. Can you think of 2-3 people — anyone, doesn't have to be [industry] — who might want a free website preview? I'll take it from there."`}
        </Script>
      </Card>

      <Card title="Review ask (same playbook, different ask)">
        <Script>
          {`"One last thing — would you mind leaving us a Google review? Takes 30 seconds. The more reviews we have the more affordable we can keep this for people like you. I'll text you the link — just 3-5 sentences, totally casual."`}
        </Script>
      </Card>
    </div>
  );
}

/* ───────────────────── Shared components ───────────────────── */

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
