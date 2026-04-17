"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  MessageSquare,
  StickyNote,
  CalendarClock,
  MoreVertical,
  GripVertical,
} from "lucide-react";

export type KanbanCardData = {
  id: string;
  title: string;
  businessName: string | null;
  value: number;
  opportunityNumber: string;
};

export function KanbanCard({ card }: { card: KanbanCardData }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  function openDetail() {
    if (isDragging) return;
    router.push(`/opportunities/${card.id}`);
  }

  function stopPropagation(e: React.MouseEvent | React.PointerEvent) {
    e.stopPropagation();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={openDetail}
      className="group relative cursor-pointer rounded-md border border-slate-200 bg-white p-2.5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="flex-1 truncate text-[13px] font-semibold text-slate-800 group-hover:text-slate-900">
          {card.title}
        </div>
        <button
          {...listeners}
          onClick={stopPropagation}
          aria-label="Drag card"
          className="grid h-5 w-5 cursor-grab place-items-center rounded text-slate-400 opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <MoreVertical className="hidden h-3.5 w-3.5 shrink-0 text-slate-400" />
      </div>
      <div className="space-y-0.5 text-[11px] text-slate-500">
        <div>
          <span className="text-slate-400">Business Name:</span>{" "}
          <span className="text-slate-600">
            {card.businessName ?? "—"}
          </span>
        </div>
        <div>
          <span className="text-slate-400">Opportunity Value:</span>{" "}
          <span className="text-slate-600">
            ${card.value.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-slate-400" onClick={stopPropagation}>
        <IconBtn><Phone className="h-3.5 w-3.5" /></IconBtn>
        <IconBtn><Mail className="h-3.5 w-3.5" /></IconBtn>
        <IconBtn><MessageSquare className="h-3.5 w-3.5" /></IconBtn>
        <IconBtn><StickyNote className="h-3.5 w-3.5" /></IconBtn>
        <IconBtn><CalendarClock className="h-3.5 w-3.5" /></IconBtn>
      </div>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      onClick={(e) => e.stopPropagation()}
      className="grid h-5 w-5 place-items-center rounded hover:bg-slate-100"
    >
      {children}
    </button>
  );
}
