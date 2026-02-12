export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "MOVE"

export type AuditDiff = {
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

export type AuditEvent = {
  id: string
  timestamp: string // ISO
  action: AuditAction
  taskId: string
  diff: AuditDiff
  userLabel: "Usuario"
}
