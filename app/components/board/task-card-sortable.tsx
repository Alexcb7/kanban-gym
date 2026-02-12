"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Task } from "@/app/types"
import TaskCard from "@/app/components/board/task-card"

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

export default function TaskCardSortable({
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    transition: {
      duration: 180,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    },
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
     transition: isDragging ? undefined : transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "will-change-transform",
        // suavidad visual general
        "transition-[opacity,filter] duration-150",
        isDragging ? "opacity-60" : "opacity-100",
      ].join(" ")}
    >
      <div
        {...attributes}
        {...listeners}
        className={[
          "cursor-grab active:cursor-grabbing select-none touch-none",
          // al arrastrar: lift sutil + borde rojo MUY suave (no glow)
          isDragging
            ? "rounded-2xl ring-1 ring-red-500/25 shadow-lg shadow-black/40"
            : "",
        ].join(" ")}
      >
        <TaskCard task={task} onUpdate={onUpdate} onDelete={onDelete} godMode={godMode} />
      </div>
    </div>
  )
}
