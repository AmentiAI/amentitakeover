import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { Mail, MessageSquare, Phone, Search } from "lucide-react";

export default async function ConversationsPage() {
  const convs = await prisma.conversation.findMany({
    include: {
      contact: { include: { business: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
  });

  const active = convs[0];
  const activeMsgs = active
    ? await prisma.message.findMany({
        where: { conversationId: active.id },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <>
      <Topbar title="Conversations" />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="max-h-[40vh] w-full shrink-0 overflow-y-auto border-b border-slate-200 bg-white md:max-h-none md:w-80 md:border-b-0 md:border-r">
          <div className="border-b border-slate-200 px-3 py-2">
            <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500">
              <Search className="h-3.5 w-3.5" />
              <input
                placeholder="Search"
                className="flex-1 bg-transparent outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="overflow-y-auto">
            {convs.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">
                No conversations yet.
              </div>
            )}
            {convs.map((c) => {
              const name =
                [c.contact?.firstName, c.contact?.lastName]
                  .filter(Boolean)
                  .join(" ") ||
                c.contact?.business?.name ||
                "Unknown";
              const preview = c.messages[0]?.body ?? "";
              return (
                <div
                  key={c.id}
                  className={`cursor-pointer border-b border-slate-100 px-3 py-2 hover:bg-slate-50 ${
                    c.id === active?.id ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-800">
                      {name}
                    </div>
                    <ChannelIcon channel={c.channel} />
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {c.subject ?? preview}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
          {active ? (
            <>
              <div className="border-b border-slate-200 bg-white px-4 py-2">
                <div className="text-sm font-semibold text-slate-800">
                  {active.subject ?? "Conversation"}
                </div>
                <div className="text-xs text-slate-500">
                  {active.contact?.business?.name ?? ""}
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {activeMsgs.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                      m.direction === "outbound"
                        ? "ml-auto bg-brand-700 text-white"
                        : "bg-white text-slate-800"
                    }`}
                  >
                    {m.body}
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 bg-white p-3">
                <textarea
                  placeholder="Type a reply…"
                  className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                  rows={3}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ChannelIcon({ channel }: { channel: string }) {
  const Icon = channel === "sms" ? Phone : channel === "chat" ? MessageSquare : Mail;
  return <Icon className="h-3.5 w-3.5 text-slate-400" />;
}
