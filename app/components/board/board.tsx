"use client"

import * as React from "react"
import { useBoard } from "@/app/hooks/use-board"
import type { ColumnId, Task } from "@/app/types"
import TaskDialog from "@/app/components/board/task-dialog"
import TaskCard from "@/app/components/board/task-card"
import { Badge } from "@/components/ui/badge"

const COLUMN_TITLES: Record<ColumnId, string> = {
  todo: "Todo",
  doing: "Doing",
  done: "Done",
}

type UpdatePayload = {
  title: string
  description?: string
  priority: Task["priority"]
  tags: string[]
  estimationMin: number
  dueAt?: string
  status: Task["status"]
}

function Column({
  colId,
  tasks,
  onNew,
  onUpdate,
  onDelete,
}: {
  colId: ColumnId
  tasks: Task[]
  onNew?: () => void
  onUpdate: (taskId: string, data: UpdatePayload) => void
  onDelete: (taskId: string) => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">{COLUMN_TITLES[colId]}</div>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>

        {onNew ? (
          <button onClick={onNew} className="text-sm underline underline-offset-4">
            + Nueva
          </button>
        ) : null}
      </div>

      <div className="p-3 space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-5 text-center">
            <div className="text-base font-medium">Sin tareas</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {colId === "todo"
                ? "Crea una incidencia para empezar."
                : colId === "doing"
                ? "Cuando empieces una tarea, estará aquí."
                : "Cuando termines una tarea, aparecerá aquí."}
            </p>
          </div>
        ) : (
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default function Board() {
  const { state, createTask, updateTask, deleteTask } = useBoard()
  const [openCreate, setOpenCreate] = React.useState(false)

  const todoTasks = state.columns.todo.map((id) => state.tasks[id]).filter(Boolean)
  const doingTasks = state.columns.doing.map((id) => state.tasks[id]).filter(Boolean)
  const doneTasks = state.columns.done.map((id) => state.tasks[id]).filter(Boolean)

  const totalTodo = todoTasks.reduce((a, t) => a + t.estimationMin, 0)
  const totalDoing = doingTasks.reduce((a, t) => a + t.estimationMin, 0)
  const totalDone = doneTasks.reduce((a, t) => a + t.estimationMin, 0)

  return (
    <div className="space-y-4">
      {/* mini resumen */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Todo: {totalTodo} min</Badge>
        <Badge variant="secondary">Doing: {totalDoing} min</Badge>
        <Badge variant="secondary">Done: {totalDone} min</Badge>
        <div className="ml-auto text-sm text-muted-foreground">(DnD en el Paso 4)</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Column
          colId="todo"
          tasks={todoTasks}
          onNew={() => setOpenCreate(true)}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
        <Column
          colId="doing"
          tasks={doingTasks}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
        <Column
          colId="done"
          tasks={doneTasks}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      </div>

      {/* Dialog Crear */}
      <TaskDialog
        mode="create"
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreate={(data) => {
          createTask(data)
          setOpenCreate(false)
        }}
      />
    </div>
  )
}
