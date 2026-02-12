"use client"

import * as React from "react"
import { z } from "zod"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnId, Priority } from "@/app/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const schema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  tags: z.array(z.string().min(1)).min(0),

  estimationMin: z.coerce.number().int().min(1).max(10000),

  dueAt: z.string().optional(), // yyyy-mm-dd
  status: z.enum(["todo", "doing", "done"]),

  // Modo Supervisor
  god: z.object({
    javiNotes: z.string(),
    score: z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? null : Number(v)),
      z.number().min(0).max(10).nullable()
    ),
    comment: z.string(),
  }),
})

export type TaskFormValues = z.infer<typeof schema>

export default function TaskForm({
  defaultValues,
  submitLabel,
  onSubmit,
  godMode = false,
}: {
  defaultValues: TaskFormValues
  submitLabel: string
  onSubmit: (values: TaskFormValues) => void
  godMode?: boolean
}) {
 
  const form = useForm<TaskFormValues, any, TaskFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<TaskFormValues, any, TaskFormValues>,
    defaultValues,
    mode: "onChange",
  })

  const [tagInput, setTagInput] = React.useState("")

  function addTag(raw: string) {
    const t = raw.trim().toLowerCase()
    if (!t) return
    const current = form.getValues("tags") ?? []
    if (current.includes(t)) return
    form.setValue("tags", [...current, t], { shouldValidate: true })
  }

  function removeTag(tag: string) {
    const current = form.getValues("tags") ?? []
    form.setValue(
      "tags",
      current.filter((x) => x !== tag),
      { shouldValidate: true }
    )
  }


  const labelClass = "text-xs font-medium text-zinc-300"
  const messageClass = "text-xs text-red-400/90"

  const inputClass =
    "bg-zinc-950/40 border-zinc-800/70 text-white placeholder:text-zinc-600 " +
    "focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-0 " +
    "hover:border-red-500/35 transition-colors rounded-xl"

  const textareaClass =
    "bg-zinc-950/40 border-zinc-800/70 text-white placeholder:text-zinc-600 " +
    "focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-0 " +
    "hover:border-red-500/35 transition-colors rounded-xl min-h-[96px]"

  const triggerClass =
    "bg-zinc-950/40 border-zinc-800/70 text-white " +
    "focus:ring-2 focus:ring-red-500/60 focus:ring-offset-0 " +
    "hover:border-red-500/35 transition-colors rounded-xl"

  const softBtn =
    "rounded-xl border border-zinc-800 bg-zinc-950/40 text-white " +
    "hover:border-red-500/35 hover:bg-zinc-900/40 transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"

  return (
    <Form {...form}>
      <form
        className="
          space-y-3
          rounded-2xl border border-zinc-800/60 bg-black/30 backdrop-blur-md p-3
          shadow-[0_0_18px_rgba(239,68,68,0.08)]
          hover:border-red-500/25 hover:shadow-[0_0_22px_rgba(239,68,68,0.12)]
          transition-colors
        "
        onSubmit={form.handleSubmit((vals) => {
          const normalized: TaskFormValues = {
            ...vals,
            title: vals.title.trim(),
            description: vals.description?.trim() || "",
            dueAt: vals.dueAt?.trim() || "",
            tags: vals.tags ?? [],
            god: {
              javiNotes: vals.god?.javiNotes ?? "",
              score: vals.god?.score ?? null,
              comment: vals.god?.comment ?? "",
            },
          }
          onSubmit(normalized)
        })}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Título *</FormLabel>
              <FormControl>
                <Input {...field} className={inputClass} placeholder="Ej: Revisar cinta #3" autoFocus />
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Descripción</FormLabel>
              <FormControl>
                <Textarea {...field} className={textareaClass} placeholder="Detalles, contexto…" />
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Prioridad *</FormLabel>
                <Select value={field.value as Priority} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className={triggerClass}>
                      <SelectValue placeholder="Selecciona prioridad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-zinc-800 bg-zinc-950 text-white">
                    <SelectItem value="low">low</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="high">high</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className={messageClass} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Estado *</FormLabel>
                <Select value={field.value as ColumnId} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className={triggerClass}>
                      <SelectValue placeholder="Selecciona estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-zinc-800 bg-zinc-950 text-white">
                    <SelectItem value="todo">todo</SelectItem>
                    <SelectItem value="doing">doing</SelectItem>
                    <SelectItem value="done">done</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className={messageClass} />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="estimationMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Estimación (min) *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} className={inputClass} />
                </FormControl>
                <FormMessage className={messageClass} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Fecha límite (opcional)</FormLabel>
                <FormControl>
                  <Input type="date" value={field.value ?? ""} onChange={field.onChange} className={inputClass} />
                </FormControl>
                <FormMessage className={messageClass} />
              </FormItem>
            )}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-300">Tags</div>

          <div className="flex items-center gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Escribe y Enter…"
              className={inputClass}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag(tagInput)
                  setTagInput("")
                }
              }}
            />
            <Button type="button" variant="secondary" className={softBtn} onClick={() => { addTag(tagInput); setTagInput("") }}>
              Añadir
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(form.watch("tags") ?? []).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => removeTag(t)}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
                title="Click para eliminar"
              >
                <Badge className="rounded-full border border-zinc-800/70 bg-zinc-950/40 text-zinc-200 hover:border-red-500/35 transition-colors">
                  {t} <span className="text-zinc-400">✕</span>
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Supervisor */}
        {godMode ? (
          <div className="rounded-2xl border border-zinc-800/60 bg-black/30 backdrop-blur-md p-3 space-y-3 hover:border-red-500/25 transition-colors">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Modo Supervisor</div>
              <Badge className="border border-zinc-800/70 bg-black/30 text-zinc-200">Extra</Badge>
            </div>

            <FormField
              control={form.control}
              name="god.javiNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea {...field} className={textareaClass} placeholder="Notas internas…" />
                  </FormControl>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="god.score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Calidad (0–10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        step={1}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="god.comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Comentario</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputClass} placeholder="Breve feedback" />
                    </FormControl>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" className={softBtn}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
