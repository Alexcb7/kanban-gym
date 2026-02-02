"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function Header() {
  return (
    <header className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="p-6 space-y-5">
        {/* Title */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">
              🛠️ Gestor de Incidencias — Gimnasio
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kanban 3 columnas · Auditoría con diff · Búsqueda avanzada · Modo Dios
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">localStorage</Badge>
            <Badge variant="secondary">JSON import/export</Badge>
          </div>
        </div>

        <Separator />

        {/* Search + Actions */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-center gap-2 lg:max-w-2xl">
            <div className="relative w-full">
              <Input
                aria-label="Búsqueda avanzada"
                placeholder='Buscar…  tag:seguridad p:high est:<60 due:week'
                className="h-11 pr-12"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ⌘K
              </span>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  className="h-11 w-11 px-0"
                  aria-label="Ayuda de búsqueda"
                  title="Ejemplos de búsqueda"
                >
                  ?
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2 text-sm">
                  <div className="font-medium">Ejemplos</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li><span className="text-foreground">tag:seguridad</span></li>
                    <li><span className="text-foreground">p:high</span></li>
                    <li><span className="text-foreground">due:overdue</span> / <span className="text-foreground">due:week</span></li>
                    <li><span className="text-foreground">est:&lt;60</span> / <span className="text-foreground">est:&gt;=120</span></li>
                  </ul>
                  <div className="text-xs text-muted-foreground">
                    Luego activamos atajo real Ctrl/Cmd + K.
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" className="h-11">
              Export JSON
            </Button>
            <Button variant="secondary" className="h-11">
              Import JSON
            </Button>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2">
              <div className="leading-tight">
                <div className="text-xs text-muted-foreground">Modo Dios</div>
                <div className="text-sm font-medium">OFF</div>
              </div>
              <Switch aria-label="Activar Modo Dios" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
