import { prisma } from "@/lib/db";
import type { SubmitInput } from "@/lib/form-replay";

const SINGLETON_ID = "default";

// Loads the singleton OutreachPrefill row and maps it onto the SubmitInput
// shape used by `submitContactForm`. Anything passed in `overrides` wins —
// so a single-row UI that already collected user-edited values can override
// the defaults without losing the rest.
export async function loadPrefillAsSubmitInput(
  overrides?: Partial<SubmitInput>,
): Promise<SubmitInput> {
  const row = await prisma.outreachPrefill.findUnique({
    where: { id: SINGLETON_ID },
  });

  // fieldOverrides is a Prisma JSON field — could be {}, null, or a real
  // map. Coerce defensively to a flat string map and let any non-string
  // values fall through.
  const overridesFromDb: Record<string, string> = {};
  if (row?.fieldOverrides && typeof row.fieldOverrides === "object" && !Array.isArray(row.fieldOverrides)) {
    for (const [k, v] of Object.entries(row.fieldOverrides as Record<string, unknown>)) {
      if (typeof v === "string" && v.length > 0) overridesFromDb[k] = v;
    }
  }

  return {
    name: overrides?.name ?? row?.name ?? undefined,
    email: overrides?.email ?? row?.email ?? undefined,
    phone: overrides?.phone ?? row?.phone ?? undefined,
    subject: overrides?.subject ?? row?.subject ?? undefined,
    message: overrides?.message ?? row?.message ?? undefined,
    referralSource: overrides?.referralSource ?? row?.referralSource ?? undefined,
    service: overrides?.service ?? row?.service ?? undefined,
    projectType: overrides?.projectType ?? row?.projectType ?? undefined,
    address: overrides?.address ?? row?.address ?? undefined,
    city: overrides?.city ?? row?.city ?? undefined,
    state: overrides?.state ?? row?.state ?? undefined,
    zip: overrides?.zip ?? row?.zip ?? undefined,
    // Caller-supplied fieldValues win key-by-key over the stored overrides.
    fieldValues: { ...overridesFromDb, ...(overrides?.fieldValues ?? {}) },
    refresh: overrides?.refresh,
    userAgent: overrides?.userAgent,
    dryRun: overrides?.dryRun,
  };
}
