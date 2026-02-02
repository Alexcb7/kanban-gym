"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Board from "@/app/components/board/board"
import AuditPanel from "@/app/components/audit/audit-panel"

export default function AppTabs() {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="p-6">
        <Tabs defaultValue="board">
          <div className="flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="board">Tablero</TabsTrigger>
              <TabsTrigger value="audit">Auditoría</TabsTrigger>
            </TabsList>

            <div className="text-sm text-muted-foreground">
              Estado vacío cuidado ✅
            </div>
          </div>

          <TabsContent value="board" className="mt-6">
            <Board />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditPanel />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
