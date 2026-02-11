"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function GodModeSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="god-mode" className="text-sm">
        Modo Dios
      </Label>
      <Switch id="god-mode" checked={enabled} onCheckedChange={onChange} />
    </div>
  )
}
