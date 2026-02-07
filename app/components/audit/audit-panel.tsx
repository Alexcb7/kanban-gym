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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

function formatTs(iso: string) {
  // simple y legible
  return iso.replace("T", " ").slice(0, 19)
}

function diffSummary(e: AuditEvent) {
  const beforeKeys = e.diff.before ? Object.keys(e.diff.before) : []
  const afterKeys = e.diff.after ? Object.keys(e.diff.after) : []
  const keys = Array.from(new Set([...beforeKeys, ...afterKeys]))
  if (e.action === "MOVE") return "estado cambiado"
  if (keys.length === 0) return "—"
  return keys.slice(0, 3).join(", ") + (keys.length > 3 ? "…" : "")
}

export default function AuditPanel() {
  const { state } = useBoard()

  const [action, setAction] = React.useState<AuditAction | "ALL">("ALL")
  const [taskId, setTaskId] = React.useState("")

  const filtered = React.useMemo(() => {
    return state.auditLog.filter((e) => {
      const okAction = action === "ALL" ? true : e.action === action
      const okTask = taskId.trim() === "" ? true : e.taskId.includes(taskId.trim())
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={action} onValueChange={(v) => setAction(v as AuditAction | "ALL")}>
            <SelectTrigger className="h-11 w-[190px]">
              <SelectValue placeholder="Acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ALL</SelectItem>
              <SelectItem value="CREATE">CREATE</SelectItem>
              <SelectItem value="UPDATE">UPDATE</SelectItem>
              <SelectItem value="MOVE">MOVE</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>

          <Input
            className="h-11 w-[260px]"
            placeholder="Filtrar por taskId…"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            aria-label="Filtrar auditoría por taskId"
          />

          <Button
            variant="secondary"
            className="h-11"
            onClick={() => {
              setAction("ALL")
              setTaskId("")
            }}
          >
            Limpiar
          </Button>
        </div>

        <Button variant="secondary" className="h-11" onClick={copySummary}>
          Copiar resumen
        </Button>
      </div>

      <Separator />

      <div className="rounded-2xl border border-border bg-background shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold">Log de auditoría</div>
          <Badge variant="secondary">{filtered.length} eventos</Badge>
        </div>

        <div className="border-t border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Diff</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center">
                    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card p-6">
                      <div className="text-base font-medium">Sin eventos</div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Crea, edita o borra tareas para ver el log con diff.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap">{formatTs(e.timestamp)}</TableCell>
                    <TableCell>{e.action}</TableCell>
                    <TableCell className="font-mono text-xs">{e.taskId}</TableCell>
                    <TableCell className="text-muted-foreground">{diffSummary(e)}</TableCell>
                    <TableCell>{e.userLabel}</TableCell>
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
