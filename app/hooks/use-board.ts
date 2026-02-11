"use client"

import * as React from "react"
import { v4 as uuidv4 } from "uuid"

import type { BoardState, ColumnId, Priority, Task } from "@/app/types"
import { getDefaultBoardState, loadBoardState, saveBoardState } from "@/lib/storage"
import { makeAuditEvent, makeMoveDiff } from "@/lib/audit"

const AUDIT_MAX = 30

function clampAudit(log: BoardState["auditLog"]) {
  return log.slice(0, AUDIT_MAX)
}

function addAudit(prevLog: BoardState["auditLog"], events: BoardState["auditLog"] | BoardState["auditLog"][number]) {
  const next = Array.isArray(events) ? [...events, ...prevLog] : [events, ...prevLog]
  return clampAudit(next)
}

export type CreateTaskInput = {
  title: string
  description?: string
  priority: Priority
  tags: string[]
  estimationMin: number
  dueAt?: string
  status: ColumnId
  god?: Task["god"]
}

export type UpdateTaskInput = {
  title: string
  description?: string
  priority: Priority
  tags: string[]
  estimationMin: number
  dueAt?: string
  status: ColumnId
  god?: Task["god"]
}

export function useBoard() {
  const [state, setState] = React.useState<BoardState>(getDefaultBoardState)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    const loaded = loadBoardState()
    // ✅ por si vienes de un estado viejo con log gigante
    setState({ ...loaded, auditLog: clampAudit(loaded.auditLog) })
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    saveBoardState(state)
  }, [state, hydrated])

  const replaceState = React.useCallback((next: BoardState) => {
    // Import: reemplaza TODO pero capamos auditoría
    setState({ ...next, auditLog: clampAudit(next.auditLog) })
  }, [])

  const clearAuditLog = React.useCallback(() => {
    setState((prev) => ({ ...prev, auditLog: [] }))
  }, [])

  const createTask = React.useCallback((input: CreateTaskInput) => {
    const id = uuidv4()
    const nowIso = new Date().toISOString()

    const task: Task = {
      id,
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      priority: input.priority,
      tags: input.tags,
      estimationMin: input.estimationMin,
      createdAt: nowIso,
      dueAt: input.dueAt || undefined,
      status: input.status,
      god: input.god,
    }

    setState((prev) => {
      const evt = makeAuditEvent({ action: "CREATE", taskId: id, after: task })

      return {
        tasks: { ...prev.tasks, [id]: task },
        columns: {
          ...prev.columns,
          [task.status]: [id, ...prev.columns[task.status]],
        },
        auditLog: addAudit(prev.auditLog, evt), // ✅ cap 30
      }
    })
  }, [])

  const updateTask = React.useCallback((taskId: string, input: UpdateTaskInput) => {
    setState((prev) => {
      const existing = prev.tasks[taskId]
      if (!existing) return prev

      const nextTask: Task = {
        ...existing,
        title: input.title.trim(),
        description: input.description?.trim() || undefined,
        priority: input.priority,
        tags: input.tags,
        estimationMin: input.estimationMin,
        dueAt: input.dueAt || undefined,
        status: input.status,
        god: input.god,
      }

      const evt = makeAuditEvent({ action: "UPDATE", taskId, before: existing, after: nextTask })

      // si cambia de columna, también hay que mover ids
      if (existing.status !== nextTask.status) {
        const from = existing.status
        const to = nextTask.status

        const fromIds = prev.columns[from].filter((id) => id !== taskId)
        const toIds = [taskId, ...prev.columns[to].filter((id) => id !== taskId)]

        return {
          tasks: { ...prev.tasks, [taskId]: nextTask },
          columns: { ...prev.columns, [from]: fromIds, [to]: toIds },
          auditLog: addAudit(prev.auditLog, evt), // ✅ cap 30
        }
      }

      return {
        ...prev,
        tasks: { ...prev.tasks, [taskId]: nextTask },
        auditLog: addAudit(prev.auditLog, evt), // ✅ cap 30
      }
    })
  }, [])

  const deleteTask = React.useCallback((taskId: string) => {
    setState((prev) => {
      const existing = prev.tasks[taskId]
      if (!existing) return prev

      const evt = makeAuditEvent({ action: "DELETE", taskId, before: existing })
      const { [taskId]: _removed, ...restTasks } = prev.tasks

      return {
        tasks: restTasks,
        columns: {
          ...prev.columns,
          [existing.status]: prev.columns[existing.status].filter((id) => id !== taskId),
        },
        auditLog: addAudit(prev.auditLog, evt), // ✅ cap 30
      }
    })
  }, [])

  const moveTaskDnD = React.useCallback((params: {
    taskId: string
    fromCol: ColumnId
    toCol: ColumnId
    fromIndex: number
    toIndex: number
  }) => {
    setState((prev) => {
      const existing = prev.tasks[params.taskId]
      if (!existing) return prev

      const nextColumns = { ...prev.columns }

      nextColumns[params.fromCol] = nextColumns[params.fromCol].filter((id) => id !== params.taskId)

      const dest = [...nextColumns[params.toCol]]
      const safeIndex = Math.max(0, Math.min(params.toIndex, dest.length))
      dest.splice(safeIndex, 0, params.taskId)
      nextColumns[params.toCol] = dest

      const nextTask: Task = { ...existing, status: params.toCol }

      const evt = makeAuditEvent({ action: "MOVE", taskId: params.taskId })
      evt.diff = makeMoveDiff({
        fromCol: params.fromCol,
        toCol: params.toCol,
        fromIndex: params.fromIndex,
        toIndex: safeIndex,
      })

      return {
        tasks: { ...prev.tasks, [params.taskId]: nextTask },
        columns: nextColumns,
        auditLog: addAudit(prev.auditLog, evt), // ✅ cap 30
      }
    })
  }, [])

  const reorderTaskDnD = React.useCallback((params: {
    col: ColumnId
    fromIndex: number
    toIndex: number
    taskId: string
  }) => {
    setState((prev) => {
      const ids = prev.columns[params.col]
      const next = [...ids]

      const safeTo = Math.max(0, Math.min(params.toIndex, next.length - 1))
      const [removed] = next.splice(params.fromIndex, 1)
      next.splice(safeTo, 0, removed)

      const evt = makeAuditEvent({ action: "MOVE", taskId: params.taskId })
      evt.diff = makeMoveDiff({
        fromCol: params.col,
        toCol: params.col,
        fromIndex: params.fromIndex,
        toIndex: safeTo,
      })

      return {
        ...prev,
        columns: { ...prev.columns, [params.col]: next },
        auditLog: addAudit(prev.auditLog, evt), // ✅ cap 30
      }
    })
  }, [])

  return {
    state,
    hydrated,
    replaceState,
    clearAuditLog, // ✅ nueva función
    createTask,
    updateTask,
    deleteTask,
    moveTaskDnD,
    reorderTaskDnD,
  }
}
