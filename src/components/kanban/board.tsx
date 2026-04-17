"use client";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from "@dnd-kit/core";
import { KanbanColumn, type KanbanColumnData } from "./column";
import { KanbanCard, type KanbanCardData } from "./card";

export function KanbanBoard({
  initial,
}: {
  initial: KanbanColumnData[];
}) {
  const [cols, setCols] = useState<KanbanColumnData[]>(initial);
  const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function findContainer(id: string) {
    const col = cols.find(
      (c) => c.id === id || c.cards.some((card) => card.id === id)
    );
    return col?.id ?? null;
  }

  function onDragStart(e: DragStartEvent) {
    const id = e.active.id as string;
    const col = cols.find((c) => c.cards.some((card) => card.id === id));
    const card = col?.cards.find((c) => c.id === id);
    if (card) setActiveCard(card);
  }

  async function onDragEnd(e: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = e;
    if (!over) return;
    const fromCol = findContainer(active.id as string);
    const toCol = findContainer(over.id as string);
    if (!fromCol || !toCol) return;
    if (fromCol === toCol && active.id === over.id) return;

    let movedCard: KanbanCardData | null = null;
    const next = cols.map((c) => {
      if (c.id === fromCol) {
        const card = c.cards.find((x) => x.id === active.id) ?? null;
        movedCard = card;
        return { ...c, cards: c.cards.filter((x) => x.id !== active.id) };
      }
      return c;
    });
    if (!movedCard) return;

    const target = next.find((c) => c.id === toCol)!;
    let idx = target.cards.length;
    const overIdx = target.cards.findIndex((x) => x.id === over.id);
    if (overIdx >= 0) idx = overIdx;
    target.cards.splice(idx, 0, movedCard);

    setCols(next);

    await fetch("/api/opportunities/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunityId: (movedCard as KanbanCardData).id,
        stageId: toCol,
        position: idx,
      }),
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full w-full gap-3 overflow-x-auto p-3 scrollbar-thin">
        {cols.map((c) => (
          <KanbanColumn key={c.id} column={c} />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? <KanbanCard card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
