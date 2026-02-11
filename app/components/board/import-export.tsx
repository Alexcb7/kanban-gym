"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import type { BoardState } from "@/app/types"
import {
  downloadJson,
  exportBoardToJson,
  readFileAsText,
  validateAndNormalizeImport,
} from "@/lib/import-export"

export default function ImportExportBar({
  state,
  onImportState,
}: {
  state: BoardState
  onImportState: (next: BoardState) => void
}) {
  const fileRef = React.useRef<HTMLInputElement | null>(null)
  const [errors, setErrors] = React.useState<string[] | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)

  function doExport() {
    setErrors(null)
    setInfo(null)
    const json = exportBoardToJson(state)
    downloadJson("kanban-board-export.json", json)
    setInfo("Exportado ✅ (kanban-board-export.json)")
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    setErrors(null)
    setInfo(null)

    const file = e.target.files?.[0]
    if (!file) return

    const text = await readFileAsText(file)
    const res = validateAndNormalizeImport(text)

    if (!res.ok) {
      setErrors(res.errors)
      return
    }

    onImportState(res.state)

    if (res.regenCount > 0) {
      setInfo(
        `Importado ✅ (se regeneraron ${res.regenCount} IDs duplicadas y se registró en auditoría)`
      )
    } else {
      setInfo("Importado ✅")
    }

    e.target.value = ""
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-zinc-800/60 bg-black/20 backdrop-blur-sm p-4 transition-colors">
        <div className="flex flex-wrap items-center gap-2">

          <Button
            variant="secondary"
            onClick={doExport}
            className="
              rounded-xl border border-zinc-800 bg-zinc-950/40 text-white
              hover:border-red-500/60 hover:bg-red-500/10
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60
            "
          >
            Exportar JSON
          </Button>

          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onPickFile}
          />

          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            className="
              rounded-xl border border-zinc-800 bg-zinc-950/40 text-white
              hover:border-red-500/60 hover:bg-red-500/10
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60
            "
          >
            Importar JSON
          </Button>

          <div className="ml-auto text-sm text-zinc-400">
            Persistencia: <span className="text-zinc-200">localStorage ✅</span>
          </div>
        </div>

        {info ? (
          <div className="mt-2 text-sm text-zinc-300">
            {info}
          </div>
        ) : null}
      </div>

      {errors && errors.length > 0 ? (
        <Alert
          variant="destructive"
          className="
            rounded-2xl border border-red-500/30 bg-black/30 text-white
          "
        >
          <AlertTitle>No se ha importado</AlertTitle>
          <AlertDescription className="text-zinc-300">
            <div className="mt-2 space-y-1">
              {errors.slice(0, 10).map((err, i) => (
                <div key={i}>
                  <span className="text-red-400/80">•</span>{" "}
                  <span className="text-zinc-200">{err}</span>
                </div>
              ))}
              {errors.length > 10 ? <div>• …</div> : null}
            </div>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
