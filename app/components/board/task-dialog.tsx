"use client"

import * as React from "react"
import type { Task, ColumnId, Priority } from "@/app/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import TaskForm, { type TaskFormValues } from "@/app/components/board/task-form"

export default function TaskDialog({
  mode,
  open,
  onOpenChange,
  initialTask,
  onCreate,
  onUpdate,
}: {
  mode: "create" | "edit"
  open: boolean
  onOpenChange: (v: boolean) => void
  initialTask?: Task
  onCreate?: (data: TaskFormValues) => void
  onUpdate?: (data: TaskFormValues) => void
}) {
  const title = mode === "create" ? "Nueva tarea" : "Editar tarea"

  const defaults: TaskFormValues = initialTask
    ? {
        title: initialTask.title,
        description: initialTask.description ?? "",
        priority: initialTask.priority,
        tags: initialTask.tags,
        estimationMin: initialTask.estimationMin,
        dueAt: initialTask.dueAt ?? "",
        status: initialTask.status,
      }
    : {
        title: "",
        description: "",
        priority: "medium" as Priority,
        tags: [],
        estimationMin: 30,
        dueAt: "",
        status: "todo" as ColumnId,
      }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <TaskForm
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
