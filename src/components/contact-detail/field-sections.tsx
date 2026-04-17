"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  User as UserIcon,
  Briefcase,
  Info,
  Target,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Save,
  Loader2,
} from "lucide-react";

type Contact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  phoneType: string | null;
  role: string | null;
  contactType: string | null;
  contactSource: string | null;
  timezone: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  tiktok: string | null;
  website: string | null;
  tags: string[];
  dndCalls: boolean;
  dndSms: boolean;
  dndEmail: boolean;
  business: { id: string; name: string; website: string | null; address: string | null } | null;
};

export function FieldSections({ contact }: { contact: Contact }) {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "dnd" | "actions">("all");
  const [open, setOpen] = useState<Record<string, boolean>>({
    contact: true,
    general: true,
    additional: false,
    lead: false,
    gbp: false,
    audit: false,
    social: false,
  });
  const [form, setForm] = useState(contact);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof Contact>(k: K, v: Contact[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        phoneType: form.phoneType,
        role: form.role,
        contactType: form.contactType,
        contactSource: form.contactSource,
        timezone: form.timezone,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
        address: form.address,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        instagram: form.instagram,
        facebook: form.facebook,
        twitter: form.twitter,
        linkedin: form.linkedin,
        tiktok: form.tiktok,
        website: form.website,
        dndCalls: form.dndCalls,
        dndSms: form.dndSms,
        dndEmail: form.dndEmail,
        tags: form.tags,
      };
      await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setDirty(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-slate-200 px-3">
        {(["all", "dnd", "actions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-[12px] capitalize ${
              tab === t
                ? "border-brand-600 font-medium text-brand-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {t === "all" ? "All Fields" : t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === "all" && (
          <div className="divide-y divide-slate-100">
            <Section
              label="Contact"
              icon={<UserIcon className="h-3.5 w-3.5" />}
              isOpen={open.contact}
              onToggle={() => setOpen((o) => ({ ...o, contact: !o.contact }))}
            >
              <FieldRow label="First name">
                <TextInput value={form.firstName ?? ""} onChange={(v) => update("firstName", v || null)} />
              </FieldRow>
              <FieldRow label="Last name">
                <TextInput value={form.lastName ?? ""} onChange={(v) => update("lastName", v || null)} />
              </FieldRow>
              <FieldRow label="Email">
                <TextInput value={form.email ?? ""} onChange={(v) => update("email", v || null)} />
              </FieldRow>
              <FieldRow label="Phone">
                <TextInput value={form.phone ?? ""} onChange={(v) => update("phone", v || null)} />
              </FieldRow>
              <FieldRow label="Phone type">
                <Select
                  value={form.phoneType ?? "Mobile"}
                  onChange={(v) => update("phoneType", v)}
                  options={["Mobile", "Home", "Work", "Other"]}
                />
              </FieldRow>
              <FieldRow label="Role">
                <TextInput value={form.role ?? ""} onChange={(v) => update("role", v || null)} />
              </FieldRow>
              <FieldRow label="Company">
                <div className="text-[13px] text-slate-700">{form.business?.name ?? "—"}</div>
              </FieldRow>
            </Section>

            <Section
              label="General Info"
              icon={<Info className="h-3.5 w-3.5" />}
              isOpen={open.general}
              onToggle={() => setOpen((o) => ({ ...o, general: !o.general }))}
            >
              <FieldRow label="Contact type">
                <Select
                  value={form.contactType ?? "Lead"}
                  onChange={(v) => update("contactType", v)}
                  options={["Lead", "Customer", "Partner", "Vendor"]}
                />
              </FieldRow>
              <FieldRow label="Contact source">
                <TextInput value={form.contactSource ?? ""} onChange={(v) => update("contactSource", v || null)} />
              </FieldRow>
              <FieldRow label="Timezone">
                <TextInput value={form.timezone ?? ""} onChange={(v) => update("timezone", v || null)} />
              </FieldRow>
              <FieldRow label="Date of birth">
                <TextInput
                  type="date"
                  value={form.dateOfBirth ? new Date(form.dateOfBirth).toISOString().slice(0, 10) : ""}
                  onChange={(v) => update("dateOfBirth", (v ? new Date(v) : null) as any)}
                />
              </FieldRow>
            </Section>

            <Section
              label="Additional Info"
              icon={<Briefcase className="h-3.5 w-3.5" />}
              isOpen={open.additional}
              onToggle={() => setOpen((o) => ({ ...o, additional: !o.additional }))}
            >
              <FieldRow label="Address">
                <TextInput value={form.address ?? ""} onChange={(v) => update("address", v || null)} />
              </FieldRow>
              <FieldRow label="City">
                <TextInput value={form.city ?? ""} onChange={(v) => update("city", v || null)} />
              </FieldRow>
              <FieldRow label="State">
                <TextInput value={form.state ?? ""} onChange={(v) => update("state", v || null)} />
              </FieldRow>
              <FieldRow label="Postal code">
                <TextInput value={form.postalCode ?? ""} onChange={(v) => update("postalCode", v || null)} />
              </FieldRow>
              <FieldRow label="Country">
                <TextInput value={form.country ?? ""} onChange={(v) => update("country", v || null)} />
              </FieldRow>
            </Section>

            <Section
              label="Lead Info"
              icon={<Target className="h-3.5 w-3.5" />}
              isOpen={open.lead}
              onToggle={() => setOpen((o) => ({ ...o, lead: !o.lead }))}
            >
              <FieldRow label="Tags">
                <TagInput
                  tags={form.tags}
                  onChange={(tags) => update("tags", tags)}
                />
              </FieldRow>
            </Section>

            <Section
              label="Google Business Profile"
              icon={<MapPin className="h-3.5 w-3.5" />}
              isOpen={open.gbp}
              onToggle={() => setOpen((o) => ({ ...o, gbp: !o.gbp }))}
            >
              <div className="px-4 py-3 text-[12px] text-slate-500">
                {form.business?.address ? (
                  <>Listed at <span className="text-slate-700">{form.business.address}</span></>
                ) : (
                  "No Google Business Profile linked."
                )}
              </div>
            </Section>

            <Section
              label="Website Audit"
              icon={<Globe className="h-3.5 w-3.5" />}
              isOpen={open.audit}
              onToggle={() => setOpen((o) => ({ ...o, audit: !o.audit }))}
            >
              <FieldRow label="Website">
                <TextInput value={form.website ?? ""} onChange={(v) => update("website", v || null)} placeholder="https://…" />
              </FieldRow>
              <div className="px-4 pb-3 text-[12px] text-slate-500">
                {form.business?.website
                  ? <>Company site: <span className="text-slate-700">{form.business.website}</span></>
                  : "Run an audit from the business drawer to see performance + palette."}
              </div>
            </Section>

            <Section
              label="Social Profiles"
              icon={<Instagram className="h-3.5 w-3.5" />}
              isOpen={open.social}
              onToggle={() => setOpen((o) => ({ ...o, social: !o.social }))}
            >
              <SocialRow icon={<Instagram className="h-3.5 w-3.5" />} label="Instagram" value={form.instagram} onChange={(v) => update("instagram", v)} />
              <SocialRow icon={<Facebook className="h-3.5 w-3.5" />} label="Facebook" value={form.facebook} onChange={(v) => update("facebook", v)} />
              <SocialRow icon={<Twitter className="h-3.5 w-3.5" />} label="Twitter / X" value={form.twitter} onChange={(v) => update("twitter", v)} />
              <SocialRow icon={<Linkedin className="h-3.5 w-3.5" />} label="LinkedIn" value={form.linkedin} onChange={(v) => update("linkedin", v)} />
              <SocialRow icon={<span className="text-[10px] font-bold">TT</span>} label="TikTok" value={form.tiktok} onChange={(v) => update("tiktok", v)} />
            </Section>
          </div>
        )}

        {tab === "dnd" && (
          <div className="space-y-2 p-4 text-sm">
            <DndToggle label="Do not call" value={form.dndCalls} onChange={(v) => update("dndCalls", v)} />
            <DndToggle label="Do not SMS" value={form.dndSms} onChange={(v) => update("dndSms", v)} />
            <DndToggle label="Do not email" value={form.dndEmail} onChange={(v) => update("dndEmail", v)} />
          </div>
        )}

        {tab === "actions" && (
          <div className="space-y-2 p-4 text-sm">
            <ActionButton label="Send email" />
            <ActionButton label="Send SMS" />
            <ActionButton label="Add to campaign" />
            <ActionButton label="Create opportunity" />
            <ActionButton label="Schedule appointment" />
            <ActionButton label="Delete contact" tone="rose" />
          </div>
        )}
      </div>

      {dirty && tab !== "actions" && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          <span>Unsaved changes</span>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1 rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </button>
        </div>
      )}
    </div>
  );
}

function Section({
  label,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-[12px] font-semibold uppercase tracking-wider text-slate-600 hover:bg-slate-50"
      >
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-2 px-4 py-1.5 hover:bg-slate-50/70">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-[13px] text-slate-800">{children}</div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 text-[13px] text-slate-800 hover:border-slate-200 focus:border-brand-400 focus:outline-none"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[13px] text-slate-800 hover:border-slate-200 focus:border-brand-400 focus:outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function SocialRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-2 px-4 py-1.5 hover:bg-slate-50/70">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
        <span className="grid h-5 w-5 place-items-center rounded bg-slate-100 text-slate-500">{icon}</span>
        {label}
      </div>
      <TextInput value={value ?? ""} onChange={(v) => onChange(v || null)} placeholder="https://…" />
    </div>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-1">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700">
          {t}
          <button
            onClick={() => onChange(tags.filter((x) => x !== t))}
            className="text-slate-400 hover:text-rose-600"
          >×</button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            e.preventDefault();
            onChange([...tags, draft.trim()]);
            setDraft("");
          }
        }}
        placeholder="Add tag…"
        className="min-w-[80px] bg-transparent text-[12px] focus:outline-none"
      />
    </div>
  );
}

function DndToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
      <span className="text-[13px] text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 rounded-full transition-colors ${value ? "bg-rose-500" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            value ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

function ActionButton({ label, tone = "slate" }: { label: string; tone?: "slate" | "rose" }) {
  const cls =
    tone === "rose"
      ? "border-rose-200 text-rose-700 hover:bg-rose-50"
      : "border-slate-200 text-slate-700 hover:bg-slate-50";
  return (
    <button className={`w-full rounded-md border bg-white px-3 py-2 text-left text-[13px] ${cls}`}>
      {label}
    </button>
  );
}
