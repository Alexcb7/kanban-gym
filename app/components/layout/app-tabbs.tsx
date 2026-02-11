"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Board from "@/app/components/board/board"
import AuditPanel from "@/app/components/audit/audit-panel"

export default function AppTabs() {
  return (
    <section
      className="
        rounded-2xl border border-zinc-800/60
        bg-black/20 backdrop-blur-sm
        shadow-sm
      "
    >
      <div className="p-6">
        <Tabs defaultValue="board" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TabsList
              className="
                bg-zinc-950/60 border border-zinc-800/60
                rounded-xl p-1
                text-zinc-300
              "
            >
              <TabsTrigger
                value="board"
                className="
                  rounded-lg px-4 py-1.5 text-sm

                  data-[state=inactive]:opacity-100
                  data-[state=inactive]:text-zinc-300
                  data-[state=inactive]:bg-transparent

                  data-[state=active]:opacity-100
                  data-[state=active]:text-white
                  data-[state=active]:bg-transparent
                  data-[state=active]:ring-1
                  data-[state=active]:ring-red-500/40
                "
              >
                Tablero
              </TabsTrigger>

              <TabsTrigger
                value="audit"
                className="
                  rounded-lg px-4 py-1.5 text-sm

                  data-[state=inactive]:opacity-100
                  data-[state=inactive]:text-zinc-300
                  data-[state=inactive]:bg-transparent

                  data-[state=active]:opacity-100
                  data-[state=active]:text-white
                  data-[state=active]:bg-transparent
                  data-[state=active]:ring-1
                  data-[state=active]:ring-red-500/40
                "
              >
                Auditoría
              </TabsTrigger>
            </TabsList>

            <div className="text-sm text-zinc-500">Estado vacío cuidado ✅</div>
          </div>

          <TabsContent value="board" className="mt-2">
            <Board />
          </TabsContent>

          <TabsContent value="audit" className="mt-2">
            <AuditPanel />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
