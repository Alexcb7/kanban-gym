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
  god?: Task["god"]
}

function priorityLabel(p: Task["priority"]) {
  if (p === "high") return "HIGH"
  if (p === "medium") return "MED"
  return "LOW"
}

function priorityClass(p: Task["priority"]) {
  if (p === "high") return "border-red-500/35 text-white"
  if (p === "medium") return "border-zinc-600/70 text-zinc-200"
  return "border-zinc-700/70 text-zinc-300"
}

function isOverdue(dueAt?: string) {
  if (!dueAt) return false
  const due = new Date(dueAt).getTime()
  if (Number.isNaN(due)) return false
  return due < Date.now()
}

export default function TaskCard({
  task,
  onUpdate,
  onDelete,
  godMode = false,
}: {
  task: Task
  onUpdate: (taskId: string, data: UpdatePayload) => void
  onDelete: (taskId: string) => void
  godMode?: boolean
}) {
  const [openEdit, setOpenEdit] = React.useState(false)

  const score = typeof task.god?.score === "number" ? `${task.god.score}/10` : "—"
  const overdue = isOverdue(task.dueAt)

  return (
    <div
      className={[
        "rounded-2xl border bg-black/30 backdrop-blur-sm p-4 space-y-3 shadow-sm",
        "border-zinc-800/60",
        "hover:border-zinc-700/80 transition-colors",
        overdue ? "border-red-500/30" : "",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium leading-tight text-white">
            {task.title}
          </div>

          {task.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
              {task.description}
            </p>
          ) : null}
        </div>

        {/* Prioridad */}
        <Badge
          className={[
            "shrink-0 rounded-full border bg-transparent px-2 py-0.5 text-[11px] tracking-wide",
            priorityClass(task.priority),
            task.priority === "high" ? "shadow-[0_0_0_1px_rgba(239,68,68,0.12)]" : "",
          ].join(" ")}
        >
          {priorityLabel(task.priority)}
        </Badge>
      </div>

      {/* Meta + tags */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="rounded-full border border-zinc-800/70 bg-zinc-950/40 text-zinc-200">
          {task.estimationMin} min
        </Badge>

        {task.dueAt ? (
          <Badge
            className={[
              "rounded-full border bg-transparent text-zinc-200",
              overdue ? "border-red-500/35" : "border-zinc-800/70",
            ].join(" ")}
          >
            due: {task.dueAt.slice(0, 10)}
          </Badge>
        ) : null}

        {task.tags.map((tag) => (
          <Badge
            key={tag}
            className="
              rounded-full border border-zinc-800/70 bg-zinc-950/40 text-zinc-300
              hover:border-zinc-600/80 transition-colors
            "
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Supervisor */}
      {godMode ? (
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/35 backdrop-blur-sm p-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white">Notas del Supervisor</div>

            <Badge
              className="
                rounded-full border border-zinc-700/70 bg-black/30 text-zinc-200
              "
            >
              Calidad: {score}
            </Badge>
          </div>

          <p className="text-sm text-zinc-400">
            {task.god?.javiNotes?.trim() ? task.god.javiNotes : "— (sin observaciones)"}
          </p>

          {task.god?.comment?.trim() ? (
            <p className="text-sm">
              <span className="font-medium text-white">Comentario:</span>{" "}
              <span className="text-zinc-400">{task.god.comment}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          aria-label={`Editar tarea ${task.title}`}
          onClick={() => setOpenEdit(true)}
          className="
            rounded-xl border border-zinc-800 bg-zinc-950/40 text-white
            hover:border-zinc-600 hover:bg-zinc-900/40
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60
          "
        >
          Editar
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              aria-label={`Borrar tarea ${task.title}`}
              className="
                rounded-xl border border-red-500/35 bg-transparent text-white
                hover:border-red-500/55 hover:bg-white/5
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60
              "
            >
              Borrar
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent
            className="
              rounded-2xl border border-zinc-800/70 bg-zinc-950 text-white
              backdrop-blur-sm
            "
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">¿Borrar esta tarea?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Se eliminará “{task.title}”. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                className="
                  rounded-xl border border-zinc-800 bg-zinc-950/40 text-white
                  hover:border-zinc-600 hover:bg-zinc-900/40
                  transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60
                "
              >
                Cancelar
              </AlertDialogCancel>

              {/* Acción de borrar*/}
              <AlertDialogAction
                onClick={() => onDelete(task.id)}
                className="
                  rounded-xl border border-red-500/35 bg-transparent text-white
                  hover:border-red-500/55 hover:bg-white/5
                  transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60
                "
              >
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
          godMode={godMode}
          onUpdate={(data) => {
            onUpdate(task.id, data)
            setOpenEdit(false)
          }}
        />
      </div>
    </div>
  )
}
