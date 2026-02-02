"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AuditPanel() {
  const count = 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="ALL">
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
            aria-label="Filtrar auditoría por taskId"
          />

          <Button variant="secondary" className="h-11">
            Limpiar
          </Button>
        </div>

        <Button variant="secondary" className="h-11">
          Copiar resumen
        </Button>
      </div>

      <Separator />

      <div className="rounded-2xl border border-border bg-background shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold">Log de auditoría</div>
          <Badge variant="secondary">{count} eventos</Badge>
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
              {count === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center">
                    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card p-6">
                      <div className="text-base font-medium">Sin eventos todavía</div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Cuando crees, edites, borres o muevas tareas, aparecerán aquí
                        con timestamp, acción y diff.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
