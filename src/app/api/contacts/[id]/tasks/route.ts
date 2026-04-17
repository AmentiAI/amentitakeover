import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  dueAt: z.string().optional(),
  assigneeId: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
      assigneeId: parsed.data.assigneeId,
      contactId: id,
    },
  });
  await prisma.activityEvent.create({
    data: {
      type: "task.created",
      title: "Task created",
      contactId: id,
      actorId: parsed.data.assigneeId,
      details: { taskId: task.id, title: parsed.data.title },
    },
  });
  return NextResponse.json(task);
}

const Patch = z.object({ done: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: contactId } = await params;
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });
  const json = await req.json();
  const parsed = Patch.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const task = await prisma.task.update({ where: { id: taskId }, data: { done: parsed.data.done } });
  await prisma.activityEvent.create({
    data: {
      type: parsed.data.done ? "task.completed" : "task.reopened",
      title: parsed.data.done ? "Task completed" : "Task reopened",
      contactId,
      details: { taskId },
    },
  });
  return NextResponse.json(task);
}
