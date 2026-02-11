"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragCancelEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"

import { useBoard } from "@/app/hooks/use-board"
import type { ColumnId, Task } from "@/app/types"
import TaskDialog from "@/app/components/board/task-dialog"
import TaskCardSortable from "@/app/components/board/task-card-sortable"
import TaskCard from "@/app/components/board/task-card"
import { Badge } from "@/components/ui/badge"

import {
  columnDroppableId,
  isColumnDroppableId,
  getColumnFromDroppableId,
  findColumnByTaskId,
} from "@/lib/dnd"

import SearchBar from "@/app/components/search/search-bar"
import { parseQuery, makeTaskPredicate } from "@/lib/query"
import ImportExportBar from "@/app/components/board/import-export"

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
  god?: Task["god"]
}

function ColumnStatic({
  colId,
  tasks,
  onNew,
  onUpdate,
  onDelete,
  godMode,
}: {
  colId: ColumnId
  tasks: Task[]
  onNew?: () => void
  onUpdate: (taskId: string, data: UpdatePayload) => void
  onDelete: (taskId: string) => void
  godMode: boolean
}) {
  return (
    <div
      className="
        rounded-2xl border border-zinc-800/60 bg-zinc-950/40 backdrop-blur-sm shadow-sm
        hover:border-red-500/25 hover:shadow-[0_0_0_1px_rgba(239,68,68,0.18)]
        transition-colors
      "
    >
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold tracking-wide">{COLUMN_TITLES[colId]}</div>
          <Badge className="border border-zinc-800/70 bg-black/30 text-zinc-200">
            {tasks.length}
          </Badge>
        </div>

        {onNew ? (
          <button
            onClick={onNew}
            className="
              text-sm text-zinc-300 hover:text-white
              underline underline-offset-4 decoration-zinc-700 hover:decoration-red-500/60
              transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 rounded-md
            "
          >
            + Nueva
          </button>
        ) : null}
      </div>

      <div className="p-3 space-y-3 min-h-[140px]">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800/70 bg-black/20 p-5 text-center">
            <div className="text-base font-medium text-white">Sin resultados</div>
            <p className="mt-1 text-sm text-zinc-400">
              Prueba a quitar filtros o cambiar el texto.
            </p>
          </div>
        ) : (
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onUpdate={onUpdate}
              onDelete={onDelete}
              godMode={godMode}
            />
          ))
        )}
      </div>
    </div>
  )
}

function ColumnDnD({
  colId,
  taskIds,
  tasksById,
  onNew,
  onUpdate,
  onDelete,
  godMode,
}: {
  colId: ColumnId
  taskIds: string[]
  tasksById: Record<string, Task>
  onNew?: () => void
  onUpdate: (taskId: string, data: UpdatePayload) => void
  onDelete: (taskId: string) => void
  godMode: boolean
}) {
  const colDropId = columnDroppableId(colId)
  const { setNodeRef, isOver } = useDroppable({ id: colDropId })

  const tasks = taskIds.map((id) => tasksById[id]).filter(Boolean)

  return (
    <div
      ref={setNodeRef}
      className={[
        "rounded-2xl border bg-zinc-950/40 backdrop-blur-sm shadow-sm transition-colors",
        "border-zinc-800/60 hover:border-red-500/25 hover:shadow-[0_0_0_1px_rgba(239,68,68,0.18)]",
        isOver ? "ring-2 ring-red-500/45 border-red-500/30 shadow-[0_0_18px_rgba(239,68,68,0.12)]" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold tracking-wide">{COLUMN_TITLES[colId]}</div>
          <Badge className="border border-zinc-800/70 bg-black/30 text-zinc-200">
            {tasks.length}
          </Badge>
        </div>

        {onNew ? (
          <button
            onClick={onNew}
            className="
              text-sm text-zinc-300 hover:text-white
              underline underline-offset-4 decoration-zinc-700 hover:decoration-red-500/60
              transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 rounded-md
            "
          >
            + Nueva
          </button>
        ) : null}
      </div>

      <div className="p-3 space-y-3 min-h-[140px]">
        <SortableContext items={[colDropId, ...taskIds]} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800/70 bg-black/20 p-5 text-center">
              <div className="text-base font-medium text-white">Sin tareas</div>
              <p className="mt-1 text-sm text-zinc-400">
                {colId === "todo"
                  ? "Registra una incidencia o gestión para empezar."
                  : colId === "doing"
                  ? "Arrastra aquí lo que está en curso."
                  : "Lo finalizado aparece aquí."}
              </p>
            </div>
          ) : (
            tasks.map((t) => (
              <TaskCardSortable
                key={t.id}
                task={t}
                onUpdate={onUpdate}
                onDelete={onDelete}
                godMode={godMode}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

export default function Board({ godMode }: { godMode: boolean }) {
  const {
    state,
    replaceState,
    createTask,
    updateTask,
    deleteTask,
    moveTaskDnD,
    reorderTaskDnD,
  } = useBoard()

  const [openCreate, setOpenCreate] = React.useState(false)

  // ✅ búsqueda
  const [query, setQuery] = React.useState("")
  const parsed = React.useMemo(() => parseQuery(query), [query])
  const predicate = React.useMemo(() => makeTaskPredicate(parsed), [parsed])
  const isFiltering = query.trim().length > 0

  const allTasks = React.useMemo(() => Object.values(state.tasks), [state.tasks])
  const filteredTasks = React.useMemo(() => {
    if (!isFiltering) return allTasks
    return allTasks.filter(predicate)
  }, [allTasks, isFiltering, predicate])

  const filteredByCol = React.useMemo(() => {
    const by: Record<ColumnId, Task[]> = { todo: [], doing: [], done: [] }
    for (const t of filteredTasks) by[t.status].push(t)
    return by
  }, [filteredTasks])

  const totalTodo = filteredByCol.todo.reduce((a, t) => a + t.estimationMin, 0)
  const totalDoing = filteredByCol.doing.reduce((a, t) => a + t.estimationMin, 0)
  const totalDone = filteredByCol.done.reduce((a, t) => a + t.estimationMin, 0)

  // ---- DnD (solo cuando no hay filtro) ----
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const [activeId, setActiveId] = React.useState<string | null>(null)

  const activeTask: Task | null = React.useMemo(() => {
    if (!activeId) return null
    return state.tasks[activeId] ?? null
  }, [activeId, state.tasks])

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function onDragCancel(_e: DragCancelEvent) {
    setActiveId(null)
  }

  function onDragEnd(e: DragEndEvent) {
    const active = String(e.active.id)
    const over = e.over ? String(e.over.id) : null
    setActiveId(null)
    if (!over) return
    if (active === over) return

    const fromCol = findColumnByTaskId(state, active)
    if (!fromCol) return
    const fromIndex = state.columns[fromCol].indexOf(active)
    if (fromIndex < 0) return

    if (isColumnDroppableId(over)) {
      const toCol = getColumnFromDroppableId(over)

      if (toCol === fromCol) {
        const toIndex = state.columns[toCol].length - 1
        if (toIndex !== fromIndex) {
          reorderTaskDnD({ col: toCol, fromIndex, toIndex, taskId: active })
        }
        return
      }

      const toIndex = state.columns[toCol].length
      moveTaskDnD({ taskId: active, fromCol, toCol, fromIndex, toIndex })
      return
    }

    const toCol = findColumnByTaskId(state, over)
    if (!toCol) return
    const toIndex = state.columns[toCol].indexOf(over)
    if (toIndex < 0) return

    if (fromCol === toCol) {
      reorderTaskDnD({ col: fromCol, fromIndex, toIndex, taskId: active })
      return
    }

    moveTaskDnD({ taskId: active, fromCol, toCol, fromIndex, toIndex })
  }

  const dropAnimation = {
    duration: 200,
    easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.35" } },
    }),
  }

  return (
    <div className="space-y-4">
      {/* ✅ Import/Export */}
      <div className="rounded-2xl border border-zinc-800/60 bg-black/20 backdrop-blur-sm p-3">
        <ImportExportBar state={state} onImportState={replaceState} />
      </div>

      {/* ✅ Search */}
      <div className="rounded-2xl border border-zinc-800/60 bg-black/20 backdrop-blur-sm p-3">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {/* mini resumen */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800/60 bg-black/20 backdrop-blur-sm px-3 py-2">
        <Badge className="border border-zinc-800/70 bg-zinc-950/40 text-zinc-200">
          Todo: {totalTodo} min
        </Badge>
        <Badge className="border border-zinc-800/70 bg-zinc-950/40 text-zinc-200">
          Doing: {totalDoing} min
        </Badge>
        <Badge className="border border-zinc-800/70 bg-zinc-950/40 text-zinc-200">
          Done: {totalDone} min
        </Badge>

        <div className="ml-auto text-xs text-zinc-400">
          {isFiltering ? "Búsqueda activa (DnD desactivado)" : "DnD activo"}
        </div>
      </div>

      {/* Render */}
      {isFiltering ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <ColumnStatic
            colId="todo"
            tasks={filteredByCol.todo}
            onNew={() => setOpenCreate(true)}
            onUpdate={updateTask}
            onDelete={deleteTask}
            godMode={godMode}
          />
          <ColumnStatic
            colId="doing"
            tasks={filteredByCol.doing}
            onUpdate={updateTask}
            onDelete={deleteTask}
            godMode={godMode}
          />
          <ColumnStatic
            colId="done"
            tasks={filteredByCol.done}
            onUpdate={updateTask}
            onDelete={deleteTask}
            godMode={godMode}
          />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragCancel={onDragCancel}
          onDragEnd={onDragEnd}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <ColumnDnD
              colId="todo"
              taskIds={state.columns.todo}
              tasksById={state.tasks}
              onNew={() => setOpenCreate(true)}
              onUpdate={updateTask}
              onDelete={deleteTask}
              godMode={godMode}
            />
            <ColumnDnD
              colId="doing"
              taskIds={state.columns.doing}
              tasksById={state.tasks}
              onUpdate={updateTask}
              onDelete={deleteTask}
              godMode={godMode}
            />
            <ColumnDnD
              colId="done"
              taskIds={state.columns.done}
              tasksById={state.tasks}
              onUpdate={updateTask}
              onDelete={deleteTask}
              godMode={godMode}
            />
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? (
              <div className="cursor-grabbing rounded-2xl ring-1 ring-red-500/35 shadow-[0_0_18px_rgba(239,68,68,0.14)] backdrop-blur-sm">
                <TaskCard
                  task={activeTask}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  godMode={godMode}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Dialog Crear */}
      <TaskDialog
        mode="create"
        open={openCreate}
        onOpenChange={setOpenCreate}
        godMode={godMode}
        onCreate={(data) => {
          createTask(data)
          setOpenCreate(false)
        }}
      />
    </div>
  )
}
