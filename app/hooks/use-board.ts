"use client"

import * as React from "react"
import { v4 as uuidv4 } from "uuid"
import type { BoardState, ColumnId, Priority, Task } from "@/app/types"
import { getDefaultBoardState, loadBoardState, saveBoardState } from "@/lib/storage"

type CreateTaskInput = {
  title: string
  description?: string
  priority: Priority
  tags: string[]
  estimationMin: number
  dueAt?: string
  status: ColumnId
}

type UpdateTaskInput = {
  title: string
  description?: string
  priority: Priority
  tags: string[]
  estimationMin: number
  dueAt?: string
  status: ColumnId
}

export function useBoard() {
  const [state, setState] = React.useState<BoardState>(getDefaultBoardState)
  const [hydrated, setHydrated] = React.useState(false)

  // Cargar desde localStorage una vez
  React.useEffect(() => {
    const loaded = loadBoardState()
    setState(loaded)
    setHydrated(true)
  }, [])

  // Guardar cuando haya cambios (solo tras hidratar)
  React.useEffect(() => {
    if (!hydrated) return
    saveBoardState(state)
  }, [state, hydrated])

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
    }

    setState((prev) => {
      const next: BoardState = {
        tasks: { ...prev.tasks, [id]: task },
        columns: {
          ...prev.columns,
          [task.status]: [id, ...prev.columns[task.status]],
        },
      }
      return next
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
      }

      // Si cambia de columna, hay que mover el id
      if (existing.status !== nextTask.status) {
        const from = existing.status
        const to = nextTask.status

        const fromIds = prev.columns[from].filter((id) => id !== taskId)
        const toIds = [taskId, ...prev.columns[to].filter((id) => id !== taskId)]

        return {
          tasks: { ...prev.tasks, [taskId]: nextTask },
          columns: {
            ...prev.columns,
            [from]: fromIds,
            [to]: toIds,
          },
        }
      }

      return {
        ...prev,
        tasks: { ...prev.tasks, [taskId]: nextTask },
      }
    })
  }, [])

  const deleteTask = React.useCallback((taskId: string) => {
    setState((prev) => {
      const existing = prev.tasks[taskId]
      if (!existing) return prev

      const { [taskId]: _, ...restTasks } = prev.tasks

      return {
        tasks: restTasks,
        columns: {
          ...prev.columns,
          [existing.status]: prev.columns[existing.status].filter((id) => id !== taskId),
        },
      }
    })
  }, [])

  return {
    state,
    hydrated,
    createTask,
    updateTask,
    deleteTask,
  }
}
