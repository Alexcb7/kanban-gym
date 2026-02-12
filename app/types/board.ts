import type { AuditEvent } from "./audit"

export type ColumnId = "todo" | "doing" | "done"
export type Priority = "low" | "medium" | "high"

export type TaskGod = {
  javiNotes: string
  score: number | null 
  comment: string
}

export type Task = {
  id: string 
  title: string 
  description?: string
  priority: Priority
  tags: string[]
  estimationMin: number
  createdAt: string 
  dueAt?: string 
  status: ColumnId

  //  Modo Dios
  god?: TaskGod
}

export type BoardState = {
  tasks: Record<string, Task>
  columns: Record<ColumnId, string[]>
  auditLog: AuditEvent[]
}
