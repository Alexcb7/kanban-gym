import type { Priority, Task } from "@/app/types"

export type DueFilter = "overdue" | "week"

export type EstFilter = {
  op: "<" | "<=" | ">" | ">=" | "="
  value: number
}

export type ParsedQuery = {
  raw: string
  text: string
  tags: string[]
  priority?: Priority
  due?: DueFilter
  est?: EstFilter
  unknownTokens: string[]
}

function normalize(s: string) {
  return s.trim().toLowerCase()
}

function parseEstToken(token: string): EstFilter | null {
  // token examples:
  // est:<60
  // est:>=120
  // est:60   (interpreta "=")
  const m = token.match(/^est:(<=|>=|<|>|=)?(\d+)$/i)
  if (!m) return null
  const op = (m[1] ?? "=") as EstFilter["op"]
  const value = Number(m[2])
  if (!Number.isFinite(value)) return null
  return { op, value }
}

function parsePriorityToken(token: string): Priority | null {
  // p:high | p:medium | p:low
  const m = token.match(/^p:(low|medium|high)$/i)
  if (!m) return null
  return m[1].toLowerCase() as Priority
}

function parseDueToken(token: string): DueFilter | null {
  const m = token.match(/^due:(overdue|week)$/i)
  if (!m) return null
  return m[1].toLowerCase() as DueFilter
}

function parseTagToken(token: string): string | null {
  // tag:react  (permitimos guiones/underscore)
  const m = token.match(/^tag:([a-z0-9_-]+)$/i)
  if (!m) return null
  return normalize(m[1])
}

function includesText(task: Task, needle: string) {
  if (!needle) return true
  const hay = `${task.title} ${task.description ?? ""}`.toLowerCase()
  return hay.includes(needle)
}

function compareEst(estimationMin: number, f: EstFilter) {
  const v = estimationMin
  if (f.op === "<") return v < f.value
  if (f.op === "<=") return v <= f.value
  if (f.op === ">") return v > f.value
  if (f.op === ">=") return v >= f.value
  return v === f.value
}

function dateAtLocalMidnight(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseDueDate(dueAt?: string): Date | null {
  if (!dueAt) return null
  // soporta "YYYY-MM-DD" o ISO
  const s = dueAt.trim()
  if (!s) return null
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  return dateAtLocalMidnight(d)
}

function matchesDue(task: Task, due: DueFilter) {
  const dueDate = parseDueDate(task.dueAt)
  if (!dueDate) return false

  const today = dateAtLocalMidnight(new Date())

  if (due === "overdue") {
    return dueDate.getTime() < today.getTime()
  }

  // due:week => en los próximos 7 días (incluye hoy), NO incluye overdue
  const in7 = new Date(today)
  in7.setDate(in7.getDate() + 7)
  const t = dueDate.getTime()
  return t >= today.getTime() && t <= in7.getTime()
}

export function parseQuery(raw: string): ParsedQuery {
  const trimmed = raw.trim()
  if (!trimmed) {
    return {
      raw,
      text: "",
      tags: [],
      unknownTokens: [],
    }
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean)

  const tags: string[] = []
  let priority: Priority | undefined
  let due: DueFilter | undefined
  let est: EstFilter | undefined
  const unknownTokens: string[] = []
  const freeTextParts: string[] = []

  for (const tok of tokens) {
    const tag = parseTagToken(tok)
    if (tag) {
      if (!tags.includes(tag)) tags.push(tag)
      continue
    }

    const p = parsePriorityToken(tok)
    if (p) {
      priority = p
      continue
    }

    const d = parseDueToken(tok)
    if (d) {
      due = d
      continue
    }

    const e = parseEstToken(tok)
    if (e) {
      est = e
      continue
    }

    // si parece operador pero no válido => lo guardamos como unknown
    if (tok.includes(":")) {
      unknownTokens.push(tok)
      continue
    }

    freeTextParts.push(tok)
  }

  return {
    raw,
    text: freeTextParts.join(" ").trim().toLowerCase(),
    tags,
    priority,
    due,
    est,
    unknownTokens,
  }
}

export function makeTaskPredicate(parsed: ParsedQuery) {
  return (task: Task) => {
    // texto libre
    if (!includesText(task, parsed.text)) return false

    // tags: AND (tiene que incluirlas todas)
    if (parsed.tags.length > 0) {
      const tset = new Set((task.tags ?? []).map(normalize))
      for (const tag of parsed.tags) {
        if (!tset.has(tag)) return false
      }
    }

    // prioridad
    if (parsed.priority && task.priority !== parsed.priority) return false

    // estimación
    if (parsed.est && !compareEst(task.estimationMin, parsed.est)) return false

    // due
    if (parsed.due && !matchesDue(task, parsed.due)) return false

    return true
  }
}
