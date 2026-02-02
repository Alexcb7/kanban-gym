"use client"

import * as React from "react"
import type { Task } from "@/app/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import TaskDialog from "@/app/components/board/task-dialog"

type UpdatePayload = {
  title: string
  description?: string
  priority: Task["priority"]
  tags: string[]
  estimationMin: number
  dueAt?: string
  status: Task["status"]
}

function priorityLabel(p: Task["priority"]) {
  if (p === "high") return "HIGH"
  if (p === "medium") return "MED"
  return "LOW"
}

export default function TaskCard({
  task,
  onUpdate,
  onDelete,
}: {
  task: Task
  onUpdate: (taskId: string, data: UpdatePayload) => void
  onDelete: (taskId: string) => void
}) {
  const [openEdit, setOpenEdit] = React.useState(false)

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium leading-tight">{task.title}</div>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {task.description}
            </p>
          ) : null}
        </div>
        <Badge variant="secondary">{priorityLabel(task.priority)}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{task.estimationMin} min</Badge>
        {task.dueAt ? (
          <Badge variant="outline">due: {task.dueAt.slice(0, 10)}</Badge>
        ) : null}
        {task.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setOpenEdit(true)}
          aria-label={`Editar tarea ${task.title}`}
        >
          Editar
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              aria-label={`Borrar tarea ${task.title}`}
            >
              Borrar
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Borrar esta tarea?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará “{task.title}”. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(task.id)}>
                Borrar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <TaskDialog
          mode="edit"
          open={openEdit}
          onOpenChange={setOpenEdit}
          initialTask={task}
          onUpdate={(data) => {
            onUpdate(task.id, data)
            setOpenEdit(false)
          }}
        />
      </div>
    </div>
  )
}
