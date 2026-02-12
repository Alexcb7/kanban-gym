"use client"

import * as React from "react"
import type { Task, ColumnId, Priority, TaskGod } from "@/app/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import TaskForm, { type TaskFormValues } from "@/app/components/board/task-form"

export default function TaskDialog({
  mode,
  open,
  onOpenChange,
  initialTask,
  onCreate,
  onUpdate,
  godMode = false,
}: {
  mode: "create" | "edit"
  open: boolean
  onOpenChange: (v: boolean) => void
  initialTask?: Task
  onCreate?: (data: TaskFormValues) => void
  onUpdate?: (data: TaskFormValues) => void
  godMode?: boolean
}) {
  const title = mode === "create" ? "Nueva tarea" : "Editar tarea"

  const emptyGod: TaskGod = { javiNotes: "", score: null, comment: "" }

  const defaults: TaskFormValues = initialTask
    ? {
        title: initialTask.title,
        description: initialTask.description ?? "",
        priority: initialTask.priority,
        tags: initialTask.tags,
        estimationMin: initialTask.estimationMin,
        dueAt: initialTask.dueAt ?? "",
        status: initialTask.status,
        god: initialTask.god ?? emptyGod,
      }
    : {
        title: "",
        description: "",
        priority: "medium" as Priority,
        tags: [],
        estimationMin: 30,
        dueAt: "",
        status: "todo" as ColumnId,
        god: emptyGod,
      }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(94vw,56rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-hide border-red-900/60 bg-zinc-950/95 p-4 text-white shadow-2xl shadow-red-950/40 sm:p-5">
        <DialogHeader>
         <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>

        <TaskForm
          godMode={godMode}
          defaultValues={defaults}
          submitLabel={mode === "create" ? "Crear" : "Guardar"}
          onSubmit={(values) => {
            if (mode === "create") onCreate?.(values)
            else onUpdate?.(values)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
