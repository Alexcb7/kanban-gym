"use client"

import * as React from "react"
import { parseQuery } from "@/lib/query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const parsed = React.useMemo(() => parseQuery(value), [value])

  const inputClass =
    "h-11 rounded-xl border border-zinc-800/70 bg-zinc-950/40 text-white placeholder:text-zinc-600 " +
    "focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-0 " +
    "hover:border-red-500/55 transition-colors"

  const softBtn =
    "h-11 rounded-xl border border-zinc-800 bg-zinc-950/40 text-white " +
    "hover:border-red-500/60 hover:bg-red-500/10 transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[260px]">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder='Buscar… (ej: "api tag:mantenimiento p:high est:>=120 due:week")'
            aria-label="Búsqueda avanzada de tareas"
            className={inputClass}
          />
        </div>

        {value.trim() ? (
          <Button variant="secondary" className={softBtn} onClick={() => onChange("")}>
            Limpiar
          </Button>
        ) : null}
      </div>

      {/* Chips de lo parseado */}
      <div className="flex flex-wrap gap-2">
        {parsed.text ? (
          <Badge className="border border-zinc-800/70 bg-black/30 text-zinc-200">
            text: “{parsed.text}”
          </Badge>
        ) : null}

        {parsed.tags.map((t) => (
          <Badge key={t} className="border border-zinc-800/70 bg-black/30 text-zinc-200">
            tag:{t}
          </Badge>
        ))}

        {parsed.priority ? (
          <Badge className="border border-zinc-800/70 bg-black/30 text-zinc-200">
            p:{parsed.priority}
          </Badge>
        ) : null}

        {parsed.due ? (
          <Badge className="border border-zinc-800/70 bg-black/30 text-zinc-200">
            due:{parsed.due}
          </Badge>
        ) : null}

        {parsed.est ? (
          <Badge className="border border-zinc-800/70 bg-black/30 text-zinc-200">
            est:{parsed.est.op}
            {parsed.est.value}
          </Badge>
        ) : null}

        {parsed.unknownTokens.length > 0 ? (
          <Badge className="border border-red-500/35 bg-black/30 text-zinc-100">
            tokens no válidos: {parsed.unknownTokens.join(", ")}
          </Badge>
        ) : null}
      </div>

      {value.trim() ? (
        <p className="text-sm text-zinc-400">
          Nota: durante la búsqueda, el Drag & Drop se desactiva para evitar movimientos raros con listas filtradas.
        </p>
      ) : null}
    </div>
  )
}
