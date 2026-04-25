import { prisma } from "@/lib/db";

// Structured logging for the build/scrape/enrich pipeline. Every call
// writes to the server console (visible in `next dev` output) AND
// persists an ActivityEvent row tagged with the scraped-business id, so
// the drawer's Activity feed can render a full report after the fact.

type Level = "info" | "warn" | "error";

export type BizLogger = {
  info: (type: string, title: string, details?: Record<string, unknown>) => Promise<void>;
  warn: (type: string, title: string, details?: Record<string, unknown>) => Promise<void>;
  error: (type: string, title: string, details?: Record<string, unknown>) => Promise<void>;
};

export function bizLogger(scrapedBusinessId: string): BizLogger {
  const write = async (
    level: Level,
    type: string,
    title: string,
    details?: Record<string, unknown>,
  ) => {
    const tag = `[biz:${scrapedBusinessId.slice(0, 8)} ${type}]`;
    const detailsForConsole = details ? JSON.stringify(details) : "";
    if (level === "error") console.error(tag, title, detailsForConsole);
    else if (level === "warn") console.warn(tag, title, detailsForConsole);
    else console.log(tag, title, detailsForConsole);

    try {
      await prisma.activityEvent.create({
        data: {
          type,
          title,
          details: { scrapedBusinessId, level, ...(details ?? {}) },
        },
      });
    } catch (err) {
      console.error("[build-logger] failed to persist activity event:", err);
    }
  };

  return {
    info: (t, ti, d) => write("info", t, ti, d),
    warn: (t, ti, d) => write("warn", t, ti, d),
    error: (t, ti, d) => write("error", t, ti, d),
  };
}
