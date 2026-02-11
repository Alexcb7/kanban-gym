"use client"

import * as React from "react"
import Board from "@/app/components/board/board"
import AuditPanel from "@/app/components/audit/audit-panel"
import GodModeSwitch from "@/app/components/godmode/god-mode-switch"
import GodSummary from "@/app/components/godmode/god-summary"
import { loadGodMode, saveGodMode } from "@/lib/god-mode"
import { useBoard } from "@/app/hooks/use-board"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Page() {
  const { state } = useBoard()
  const [godMode, setGodMode] = React.useState(false)

  React.useEffect(() => setGodMode(loadGodMode()), [])
  React.useEffect(() => saveGodMode(godMode), [godMode])

  const allTasks = React.useMemo(() => Object.values(state.tasks), [state.tasks])

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Fondo suave (sin rojo, solo profundidad) */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-zinc-800/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-zinc-800/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 space-y-5">
        {/* Header sticky con blur */}
        <header className="sticky top-0 z-40 -mx-4 px-4 py-4 border-b border-zinc-800/60 bg-black/60 backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">Gym Ops Board</h1>
              <p className="text-sm text-zinc-400">
                Mantenimiento · Clases · Recepción — auditoría, búsqueda e import/export
              </p>
            </div>

            <div className="flex items-center gap-3">
              <GodModeSwitch enabled={godMode} onChange={setGodMode} />
            </div>
          </div>
        </header>

        {/* Panel supervisor */}
        {godMode ? (
          <div
            className="
              rounded-2xl border border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm p-4
              shadow-sm hover:border-red-500/30 hover:shadow-[0_0_0_1px_rgba(239,68,68,0.20)]
              transition-colors
            "
          >
            <GodSummary tasks={allTasks} />
          </div>
        ) : null}

        {/* Tabs */}
        <Tabs defaultValue="board" className="w-full">
          <TabsList className="w-full justify-start gap-2 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm p-1">
            <TabsTrigger
              value="board"
              className="
                rounded-xl
                data-[state=active]:bg-black/60 data-[state=active]:text-white
                data-[state=active]:shadow-[0_0_0_1px_rgba(239,68,68,0.18)]
                data-[state=active]:border data-[state=active]:border-red-500/30
              "
            >
              Tablero
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="
                rounded-xl
                data-[state=active]:bg-black/60 data-[state=active]:text-white
                data-[state=active]:shadow-[0_0_0_1px_rgba(239,68,68,0.18)]
                data-[state=active]:border data-[state=active]:border-red-500/30
              "
            >
              Auditoría
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-4">
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm p-4 shadow-sm">
              <Board godMode={godMode} />
            </div>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm p-4 shadow-sm">
              <AuditPanel />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
