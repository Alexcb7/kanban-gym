"use client"

import * as React from "react"
import { useBoard } from "@/app/hooks/use-board"
import type { AuditAction, AuditEvent } from "@/app/types"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function formatTs(iso: string) {
  return iso.replace("T", " ").slice(0, 19)
}

function diffSummary(e: AuditEvent) {
  const beforeKeys = e.diff?.before ? Object.keys(e.diff.before) : []
  const afterKeys = e.diff?.after ? Object.keys(e.diff.after) : []
  const keys = Array.from(new Set([...beforeKeys, ...afterKeys]))
  if (e.action === "MOVE") return "estado cambiado"
  if (keys.length === 0) return "—"
  return keys.slice(0, 3).join(", ") + (keys.length > 3 ? "…" : "")
}

export default function AuditPanel() {
  const { state, clearAuditLog } = useBoard()

  const [action, setAction] = React.useState<AuditAction | "ALL">("ALL")
  const [taskId, setTaskId] = React.useState("")

  const filtered = React.useMemo(() => {
    return state.auditLog.filter((e) => {
      const okAction = action === "ALL" ? true : e.action === action
      const q = taskId.trim()
      const okTask = q === "" ? true : e.taskId.includes(q)
      return okAction && okTask
    })
  }, [state.auditLog, action, taskId])

  function copySummary() {
    const counts: Record<AuditAction, number> = {
      CREATE: 0,
      UPDATE: 0,
      DELETE: 0,
      MOVE: 0,
    }
    for (const e of filtered) counts[e.action]++

    const recent = filtered.slice(0, 5)
    const text =
      `Resumen de auditoría\n` +
      `- CREATE: ${counts.CREATE}\n` +
      `- UPDATE: ${counts.UPDATE}\n` +
      `- MOVE: ${counts.MOVE}\n` +
      `- DELETE: ${counts.DELETE}\n\n` +
      `Recientes:\n` +
      recent.map((e) => `- ${e.action} ${e.taskId} (${formatTs(e.timestamp)})`).join("\n")

    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Resumen copiado al portapapeles"))
      .catch(() => toast.error("No se pudo copiar el resumen"))
  }

  function clearFilters() {
    setAction("ALL")
    setTaskId("")
  }

  const inputClass =
    "h-11 rounded-xl border border-zinc-800/70 bg-zinc-950/40 text-white placeholder:text-zinc-600 " +
    "focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-0 " +
    "hover:border-red-500/55 transition-colors"

  const triggerClass =
    "h-11 w-[190px] rounded-xl border border-zinc-800/70 bg-zinc-950/40 text-white " +
    "focus:ring-2 focus:ring-red-500/60 focus:ring-offset-0 " +
    "hover:border-red-500/55 transition-colors"

  const softBtn =
    "h-11 rounded-xl border border-zinc-800 bg-zinc-950/40 text-white " +
    "hover:border-red-500/60 hover:bg-red-500/10 transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"

  const dangerBtn =
    "h-11 rounded-xl border border-red-500/35 bg-transparent text-white " +
    "hover:border-red-500/60 hover:bg-red-500/10 transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"

  const BIG_AUDIT_CONTAINER =
    "rounded-2xl border border-red-500/30 bg-black/20 backdrop-blur-sm shadow-sm transition " +
    "hover:border-red-500/55 hover:shadow-[0_0_0_1px_rgba(239,68,68,0.20),0_18px_44px_rgba(239,68,68,0.14)]"

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={action} onValueChange={(v) => setAction(v as AuditAction | "ALL")}>
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Acción" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-950 text-white">
              <SelectItem value="ALL">ALL</SelectItem>
              <SelectItem value="CREATE">CREATE</SelectItem>
              <SelectItem value="UPDATE">UPDATE</SelectItem>
              <SelectItem value="MOVE">MOVE</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>

          <Input
            className={[inputClass, "w-[260px]"].join(" ")}
            placeholder="Filtrar por taskId…"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            aria-label="Filtrar auditoría por taskId"
          />

          <Button type="button" variant="secondary" className={softBtn} onClick={clearFilters}>
            Limpiar
          </Button>
        </div>

        <Button type="button" variant="secondary" className={softBtn} onClick={copySummary}>
          Copiar resumen
        </Button>
      </div>

      {/* Danger action */}
      <Button type="button" variant="secondary" className={dangerBtn} onClick={() => clearAuditLog()}>
        Vaciar log
      </Button>

      <Separator className="bg-zinc-800/60" />

      {/* Table container (GRANDE) */}
      <div className={BIG_AUDIT_CONTAINER}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-red-500/20">
          <div className="text-sm font-semibold text-white">Log de auditoría</div>
          <Badge className="rounded-full border border-zinc-800/70 bg-black/30 text-zinc-200">
            {filtered.length} eventos
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/60">
                <TableHead className="text-zinc-300">Timestamp</TableHead>
                <TableHead className="text-zinc-300">Acción</TableHead>
                <TableHead className="text-zinc-300">Task</TableHead>
                <TableHead className="text-zinc-300">Diff</TableHead>
                <TableHead className="text-zinc-300">Usuario</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow className="border-zinc-800/60">
                  <TableCell colSpan={5} className="py-10 text-center">
                    <div className="mx-auto max-w-xl rounded-2xl border border-red-500/20 bg-zinc-950/25 p-6">
                      <div className="text-base font-medium text-white">Sin eventos</div>
                      <p className="mt-2 text-sm text-zinc-400">
                      </p>
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="secondary"
                          className={softBtn}
                          onClick={clearFilters}
                        >
                          Limpiar filtros
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow
                    key={e.id}
                    className="border-zinc-800/60 hover:bg-white/[0.03] transition-colors"
                  >
                    <TableCell className="whitespace-nowrap text-zinc-200">
                      {formatTs(e.timestamp)}
                    </TableCell>
                    <TableCell className="text-zinc-200">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                          e.action === "DELETE"
                            ? "border-red-500/35 text-zinc-100"
                            : "border-zinc-700/70 text-zinc-200",
                        ].join(" ")}
                      >
                        {e.action}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-300">
                      {e.taskId}
                    </TableCell>
                    <TableCell className="text-zinc-400">{diffSummary(e)}</TableCell>
                    <TableCell className="text-zinc-200">{e.userLabel}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
