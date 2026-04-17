"use client";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { KanbanCard, type KanbanCardData } from "./card";
import { bandClass } from "@/lib/stages";
import { MoreHorizontal, Plus } from "lucide-react";

export type KanbanColumnData = {
  id: string;
  name: string;
  color: string;
  cards: KanbanCardData[];
};

export function KanbanColumn({ column }: { column: KanbanColumnData }) {
  const total = column.cards.reduce((s, c) => s + c.value, 0);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex h-full w-64 shrink-0 flex-col rounded-md border border-slate-200 bg-slate-50">
      <div className={`h-1.5 w-full rounded-t-md ${bandClass(column.color)}`} />
      <div className="flex items-start justify-between px-3 pt-2">
        <div>
          <div className="text-[13px] font-semibold text-slate-800">
            {column.name}
          </div>
          <div className="text-[11px] text-slate-500">
            {column.cards.length} Opportunities · ${total.toFixed(2)}
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 overflow-y-auto p-2 scrollbar-thin ${
          isOver ? "bg-slate-100" : ""
        }`}
      >
        <SortableContext
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((c) => (
            <KanbanCard key={c.id} card={c} />
          ))}
        </SortableContext>
      </div>

      <button className="m-2 flex items-center justify-center gap-1 rounded border border-dashed border-slate-300 py-1.5 text-[11px] text-slate-400 hover:bg-white">
        <Plus className="h-3.5 w-3.5" /> Add opportunity
      </button>
    </div>
  );
}
