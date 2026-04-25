import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bizLogger } from "@/lib/build-logger";
import {
  submitContactForm,
  type StoredContactForm,
  type SubmitInput,
} from "@/lib/form-replay";

export const maxDuration = 60;

// Replays the captured contact form on a prospect's site. The form schema
// must already be in the DB (populated by Build / Enrich when the scrape
// returned no email). Submissions are logged to ActivityEvent so the
// drawer's feed shows what was sent and what came back.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const log = bizLogger(id);
  const body = (await req.json().catch(() => ({}))) as Partial<SubmitInput> & {
    dryRun?: boolean;
  };

  const b = await prisma.scrapedBusiness.findUnique({
    where: { id },
    include: { site: true },
  });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!b.site?.contactForm) {
    return NextResponse.json(
      {
        error:
          "No contact form captured for this business — run Build first (only saved when scrape found no email).",
      },
      { status: 400 },
    );
  }

  const form = b.site.contactForm as unknown as StoredContactForm;
  if (!form.action || !Array.isArray(form.fields)) {
    return NextResponse.json(
      { error: "Stored contact form is malformed; re-run Build to capture again." },
      { status: 400 },
    );
  }

  const input: SubmitInput = {
    name: body.name,
    email: body.email,
    phone: body.phone,
    message: body.message,
    subject: body.subject,
    fieldValues: body.fieldValues,
    refresh: body.refresh,
    userAgent: body.userAgent,
  };

  const startedAt = Date.now();
  await log.info("form.submit_started", `Submitting contact form for ${b.name}`, {
    pageUrl: form.pageUrl,
    action: form.action,
    method: form.method,
    capturedFieldCount: form.fields.length,
    dryRun: Boolean(body.dryRun),
    intents: {
      name: Boolean(input.name),
      email: Boolean(input.email),
      phone: Boolean(input.phone),
      message: Boolean(input.message),
      subject: Boolean(input.subject),
    },
  });

  // Dry-run: build the request but don't actually POST. Returns the
  // mapping so the caller can verify what would be sent before going live.
  if (body.dryRun) {
    const dummy = await submitContactForm(form, { ...input, refresh: false });
    await log.info("form.dry_run", "Dry-run produced field mapping", {
      submittedFields: dummy.submittedFields,
      unmatchedRequiredFields: dummy.unmatchedRequiredFields,
    });
    return NextResponse.json({
      dryRun: true,
      submittedFields: dummy.submittedFields,
      unmatchedRequiredFields: dummy.unmatchedRequiredFields,
    });
  }

  try {
    const result = await submitContactForm(form, input);
    await log.info(
      result.ok ? "form.submit_done" : "form.submit_rejected",
      `Form submission ${result.ok ? "accepted" : "rejected"} (${result.httpStatus})`,
      {
        durationMs: Date.now() - startedAt,
        httpStatus: result.httpStatus,
        finalUrl: result.finalUrl,
        bodyPreview: result.bodyPreview.slice(0, 400),
        submittedFields: result.submittedFields,
        unmatchedRequiredFields: result.unmatchedRequiredFields,
        refreshedHidden: result.refreshedHidden,
      },
    );
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "submission failed";
    await log.error("form.submit_failed", `Form submission threw: ${msg}`, {
      durationMs: Date.now() - startedAt,
      error: msg,
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET returns the captured form schema so a UI can render a preview /
// pre-submission editor without re-running Build.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const b = await prisma.scrapedBusiness.findUnique({
    where: { id },
    include: { site: true },
  });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!b.site?.contactForm) {
    return NextResponse.json({ contactForm: null });
  }
  return NextResponse.json({ contactForm: b.site.contactForm });
}
