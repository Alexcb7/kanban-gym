import type { AuditEvent } from "./audit"

export type ColumnId = "todo" | "doing" | "done"
export type Priority = "low" | "medium" | "high"

export type TaskGod = {
  javiNotes: string
  score: number | null // null = sin evaluar
  comment: string
}

export type Task = {
  id: string // uuid
  title: string // min 3
  description?: string
  priority: Priority
  tags: string[]
  estimationMin: number
  createdAt: string // ISO
  dueAt?: string // ISO optional
  status: ColumnId

  // ✅ Modo Dios
  god?: TaskGod
}

export type BoardState = {
  tasks: Record<string, Task>
  columns: Record<ColumnId, string[]>
  auditLog: AuditEvent[]
}
