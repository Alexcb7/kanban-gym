import { v4 as uuidv4 } from "uuid"
import type { AuditAction, AuditEvent, Task } from "@/app/types"

const USER_LABEL: AuditEvent["userLabel"] = "Alumno/a"

function pickTaskSnapshot(t: Task): Record<string, unknown> {
  // Snapshot “útil” (sin inventos): todo lo relevante
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? null,
    priority: t.priority,
    tags: t.tags,
    estimationMin: t.estimationMin,
    createdAt: t.createdAt,
    dueAt: t.dueAt ?? null,
    status: t.status,
  }
}

function diffTask(before: Task, after: Task): { before: Record<string, unknown>; after: Record<string, unknown> } {
  const changedBefore: Record<string, unknown> = {}
  const changedAfter: Record<string, unknown> = {}

  const keys: (keyof Task)[] = [
    "title",
    "description",
    "priority",
    "tags",
    "estimationMin",
    "dueAt",
    "status",
  ]

  for (const k of keys) {
    const b = before[k]
    const a = after[k]
    // comparación simple (tags array)
    const same =
      Array.isArray(b) && Array.isArray(a)
        ? b.length === a.length && b.every((x, i) => x === a[i])
        : b === a

    if (!same) {
      changedBefore[String(k)] = b ?? null
      changedAfter[String(k)] = a ?? null
    }
  }

  return { before: changedBefore, after: changedAfter }
}

export function makeAuditEvent(params: {
  action: AuditAction
  taskId: string
  before?: Task
  after?: Task
}): AuditEvent {
  const timestamp = new Date().toISOString()

  if (params.action === "CREATE" && params.after) {
    return {
      id: uuidv4(),
      timestamp,
      action: "CREATE",
      taskId: params.taskId,
      diff: { after: pickTaskSnapshot(params.after) },
      userLabel: USER_LABEL,
    }
  }

  if (params.action === "DELETE" && params.before) {
    return {
      id: uuidv4(),
      timestamp,
      action: "DELETE",
      taskId: params.taskId,
      diff: { before: pickTaskSnapshot(params.before) },
      userLabel: USER_LABEL,
    }
  }

  if (params.action === "UPDATE" && params.before && params.after) {
    const d = diffTask(params.before, params.after)
    return {
      id: uuidv4(),
      timestamp,
      action: "UPDATE",
      taskId: params.taskId,
      diff: d,
      userLabel: USER_LABEL,
    }
  }

  // MOVE lo haremos en el paso del DnD, pero dejamos base:
  return {
    id: uuidv4(),
    timestamp,
    action: params.action,
    taskId: params.taskId,
    diff: {},
    userLabel: USER_LABEL,
  }
}
