import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import type { AuditEvent, BoardState, ColumnId, Task } from "@/app/types"

// ---------- ZOD SCHEMAS ----------
const ColumnIdSchema = z.enum(["todo", "doing", "done"])
const PrioritySchema = z.enum(["low", "medium", "high"])

const TaskGodSchema = z
  .object({
    javiNotes: z.string(),
    score: z.number().min(0).max(10).nullable(),
    comment: z.string(),
  })
  .optional()

const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  description: z.string().optional(),
  priority: PrioritySchema,
  tags: z.array(z.string()),
  estimationMin: z.number().int().min(1),
  createdAt: z.string().min(1),
  dueAt: z.string().optional(),
  status: ColumnIdSchema,
  god: TaskGodSchema,
})

const AuditActionSchema = z.enum(["CREATE", "UPDATE", "DELETE", "MOVE"])

// ✅ diff realista: before/after como objetos de cambios
const AuditDiffSchema = z
  .object({
    before: z.record(z.string(), z.any()).optional(),
    after: z.record(z.string(), z.any()).optional(),
  })
  .optional()

const AuditEventSchema = z.object({
  id: z.string().min(1),
  timestamp: z.string().min(1),
  action: AuditActionSchema,
  taskId: z.string().min(1),
  diff: AuditDiffSchema,
  userLabel: z.string().min(1),
})

const BoardStateSchema = z.object({
  // ✅ Zod v4: record(keyType, valueType)
  tasks: z.record(z.string(), TaskSchema),
  columns: z.object({
    todo: z.array(z.string()),
    doing: z.array(z.string()),
    done: z.array(z.string()),
  }),
  auditLog: z.array(AuditEventSchema),
})

// ---------- HELPERS ----------
function columnKeys(): ColumnId[] {
  return ["todo", "doing", "done"]
}

function nowIso() {
  return new Date().toISOString()
}

function makeIdRegenAudit(oldId: string, newId: string): AuditEvent {
  return {
    id: uuidv4(),
    timestamp: nowIso(),
    action: "UPDATE",
    taskId: newId,
    diff: {
      before: { id: oldId },
      after: { id: newId, note: "Regenerado por ID duplicada durante import" },
    },
    // si quieres cumplir el enunciado estricto:
    userLabel: "Usuario",
  }
}

function assertReferentialIntegrity(state: BoardState): string[] {
  const errors: string[] = []
  const taskIds = new Set(Object.keys(state.tasks))

  for (const col of columnKeys()) {
    state.columns[col].forEach((id, idx) => {
      if (!taskIds.has(id)) {
        errors.push(`columns.${col}[${idx}] referencia id "${id}" que no existe en tasks`)
      }
    })
  }
  return errors
}

/**
 * Detecta IDs duplicadas en columnas:
 * - mismo id repetido en la misma columna o en varias columnas.
 * Resuelve duplicados clonando la tarea y regenerando ID para las ocurrencias extra.
 */
function resolveDuplicateColumnIds(base: BoardState): {
  fixed: BoardState
  regenEvents: AuditEvent[]
  regenCount: number
} {
  const fixed: BoardState = {
    tasks: { ...base.tasks },
    columns: {
      todo: [...base.columns.todo],
      doing: [...base.columns.doing],
      done: [...base.columns.done],
    },
    auditLog: [...base.auditLog],
  }

  const seen = new Set<string>()
  const regenEvents: AuditEvent[] = []
  let regenCount = 0

  for (const col of columnKeys()) {
    for (let i = 0; i < fixed.columns[col].length; i++) {
      const id = fixed.columns[col][i]

      if (!seen.has(id)) {
        seen.add(id)
        continue
      }

      // Duplicado -> regenerar creando una copia de la tarea original
      const original = fixed.tasks[id]
      if (!original) continue

      const newId = uuidv4()
      const cloned: Task = {
        ...original,
        id: newId,
        status: col,
      }

      fixed.tasks[newId] = cloned
      fixed.columns[col][i] = newId

      regenEvents.push(makeIdRegenAudit(id, newId))
      regenCount++

      seen.add(newId)
    }
  }

  // Añadimos eventos al log (al principio)
  if (regenEvents.length > 0) {
    fixed.auditLog = [...regenEvents, ...fixed.auditLog]
  }

  return { fixed, regenEvents, regenCount }
}

export type ImportOk = {
  ok: true
  state: BoardState
  regenCount: number
}

export type ImportFail = {
  ok: false
  errors: string[]
}

export type ImportResult = ImportOk | ImportFail

export function exportBoardToJson(state: BoardState): string {
  return JSON.stringify(state, null, 2)
}

export function downloadJson(filename: string, json: string) {
  const blob = new Blob([json], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function readFileAsText(file: File): Promise<string> {
  return await file.text()
}

export function validateAndNormalizeImport(rawText: string): ImportResult {
  let parsedUnknown: unknown
  try {
    parsedUnknown = JSON.parse(rawText)
  } catch {
    return { ok: false, errors: ["El archivo no es JSON válido."] }
  }

  const parsed = BoardStateSchema.safeParse(parsedUnknown)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
    return { ok: false, errors }
  }

  const candidate = parsed.data as BoardState

  // Integridad referencial
  const integrityErrors = assertReferentialIntegrity(candidate)
  if (integrityErrors.length > 0) {
    return { ok: false, errors: integrityErrors }
  }

  // Resolver IDs duplicadas en columnas
  const { fixed, regenCount } = resolveDuplicateColumnIds(candidate)

  // Re-chequeo rápido
  const integrityErrors2 = assertReferentialIntegrity(fixed)
  if (integrityErrors2.length > 0) {
    return { ok: false, errors: integrityErrors2 }
  }

  return { ok: true, state: fixed, regenCount }
}
