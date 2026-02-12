"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function Header() {
  const softBtn =
    "h-11 rounded-xl border border-zinc-800 bg-zinc-950/40 text-white " +
    "hover:border-zinc-600 hover:bg-zinc-900/40 transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"

  const inputClass =
    "h-11 rounded-xl border border-zinc-800/70 bg-zinc-950/40 text-white " +
    "placeholder:text-zinc-600 " +
    "focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-0 " +
    "hover:border-zinc-700/80 transition-colors"

  return (
    <header className="rounded-2xl border border-zinc-800/60 bg-black/20 backdrop-blur-sm shadow-sm">
      <div className="p-6 space-y-5">
        {/* Title */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              🛠️ Gestor de Incidencias — Gimnasio
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Kanban 3 columnas · Auditoría con diff · Búsqueda avanzada · Modo Supervisor
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-zinc-800/70 bg-black/30 text-zinc-200">
              localStorage
            </Badge>
            <Badge className="rounded-full border border-zinc-800/70 bg-black/30 text-zinc-200">
              JSON import/export
            </Badge>
          </div>
        </div>

        <Separator className="bg-zinc-800/60" />

        {/* Search + Actions */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="flex w-full items-center gap-2 lg:max-w-2xl">
            <div className="relative w-full">
              <Input
                aria-label="Búsqueda avanzada"
                placeholder='Buscar…  tag:seguridad p:high est:<60 due:week'
                className={["pr-12", inputClass].join(" ")}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                ⌘K
              </span>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  className={[
                    "h-11 w-11 px-0 rounded-xl border border-zinc-800 bg-zinc-950/40 text-white",
                    "hover:border-zinc-600 hover:bg-zinc-900/40 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60",
                  ].join(" ")}
                  aria-label="Ayuda de búsqueda"
                  title="Ejemplos de búsqueda"
                >
                  ?
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-lg">
                <div className="space-y-2 text-sm">
                  <div className="font-medium">Ejemplos</div>
                  <ul className="space-y-1 text-zinc-400">
                    <li>
                      <span className="text-white">tag:seguridad</span>
                    </li>
                    <li>
                      <span className="text-white">p:high</span>
                    </li>
                    <li>
                      <span className="text-white">due:overdue</span> /{" "}
                      <span className="text-white">due:week</span>
                    </li>
                    <li>
                      <span className="text-white">est:&lt;60</span> /{" "}
                      <span className="text-white">est:&gt;=120</span>
                    </li>
                  </ul>
                  <div className="text-xs text-zinc-500">
                    
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" className={softBtn}>
              Export JSON
            </Button>
            <Button variant="secondary" className={softBtn}>
              Import JSON
            </Button>

            {/* Supervisor Switch */}
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-800/60 bg-black/20 backdrop-blur-sm px-4 py-2">
              <div className="leading-tight">
                <div className="text-xs text-zinc-500">Modo Supervisor</div>
                <div className="text-sm font-medium text-white">OFF</div>
              </div>

              <Switch
                aria-label="Activar Modo Supervisor"
                className="
                  data-[state=checked]:bg-black
                  data-[state=unchecked]:bg-zinc-800
                  border border-zinc-700
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60
                "
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
