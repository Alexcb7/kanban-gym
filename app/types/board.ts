export type ColumnId = "todo" | "doing" | "done"

export type Priority = "low" | "medium" | "high"

export type Task = {
  id: string // uuid
  title: string 
  description?: string
  priority: Priority
  tags: string[]
  estimationMin: number
  createdAt: string // ISO
  dueAt?: string // ISO optional
  status: ColumnId
}


export type BoardState = {
  tasks: Record<string, Task>
  columns: Record<ColumnId, string[]> 
}
