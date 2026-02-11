"use client"

import * as React from "react"
import type { Task } from "@/app/types"
import { Badge } from "@/components/ui/badge"

export default function GodSummary({ tasks }: { tasks: Task[] }) {
  const scored = tasks.filter((t) => typeof t.god?.score === "number")
  const unscored = tasks.filter((t) => t.god?.score === null || t.god?.score === undefined)

  const avg =
    scored.length === 0
      ? null
      : Math.round((scored.reduce((a, t) => a + (t.god!.score as number), 0) / scored.length) * 10) /
        10

  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-black/20 backdrop-blur-sm p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-sm font-semibold text-white tracking-wide">Panel Supervisor</div>
          <div className="text-xs text-zinc-400">
            Rúbrica interna (solo visible en modo supervisor)
          </div>
        </div>

        <Badge className="rounded-full border border-zinc-800/70 bg-zinc-950/40 text-zinc-200">
          {avg === null ? "Media: —" : `Media: ${avg}/10`}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge className="rounded-full border border-zinc-800/70 bg-black/30 text-zinc-200">
          Revisadas: {scored.length}
        </Badge>
        <Badge
          className={[
            "rounded-full border bg-black/30 text-zinc-200",
            unscored.length > 0 ? "border-red-500/30" : "border-zinc-800/70",
          ].join(" ")}
        >
          Sin revisar: {unscored.length}
        </Badge>
      </div>

      {unscored.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/25 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-white">Tareas sin revisión</div>
            <Badge className="rounded-full border border-red-500/30 bg-transparent text-zinc-100">
              pendientes
            </Badge>
          </div>

          <ul className="mt-2 list-disc pl-5 text-sm text-zinc-400 space-y-1">
            {unscored.slice(0, 6).map((t) => (
              <li key={t.id} className="leading-snug">
                <span className="text-zinc-200">{t.title}</span>
              </li>
            ))}
            {unscored.length > 6 ? <li className="text-zinc-500">…</li> : null}
          </ul>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/25 p-3">
          <div className="text-sm text-zinc-300">
            ✅ Todo revisado. No hay tareas pendientes de supervisión.
          </div>
        </div>
      )}
    </div>
  )
}
