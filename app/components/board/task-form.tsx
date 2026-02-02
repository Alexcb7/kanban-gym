"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
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

// Preprocess robusto: convierte string/number -> number
const toNumber = (val: unknown) => {
  if (typeof val === "number") return val
  if (typeof val === "string" && val.trim() !== "") return Number(val)
  return val
}

const schema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  tags: z.array(z.string().min(1)).min(0), // SIEMPRE array (no optional)
  estimationMin: z.preprocess(toNumber, z.number().int().min(1).max(10000)),
  dueAt: z.string().optional(), // yyyy-mm-dd
  status: z.enum(["todo", "doing", "done"]),
})

export type TaskFormValues = z.infer<typeof schema>

export default function TaskForm({
  defaultValues,
  submitLabel,
  onSubmit,
}: {
  defaultValues: TaskFormValues
  submitLabel: string
  onSubmit: (values: TaskFormValues) => void
}) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  })

  const [tagInput, setTagInput] = React.useState("")

  function addTag(raw: string) {
    const t = raw.trim().toLowerCase()
    if (!t) return
    const current = form.getValues("tags")
    if (current.includes(t)) return
    form.setValue("tags", [...current, t], { shouldValidate: true })
  }

  function removeTag(tag: string) {
    const current = form.getValues("tags")
    form.setValue(
      "tags",
      current.filter((x) => x !== tag),
      { shouldValidate: true }
    )
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((vals) => {
          const normalized: TaskFormValues = {
            ...vals,
            title: vals.title.trim(),
            description: vals.description?.trim() || "",
            dueAt: vals.dueAt?.trim() || "",
            tags: vals.tags ?? [],
          }
          onSubmit(normalized)
        })}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: Cinta #4 vibra a +12km/h" autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Detalles, contexto, qué se ha observado…" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad *</FormLabel>
                <Select value={field.value as Priority} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona prioridad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">low</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="high">high</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
                <Select value={field.value as ColumnId} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo">todo</SelectItem>
                    <SelectItem value="doing">doing</SelectItem>
                    <SelectItem value="done">done</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
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
                <FormLabel>Estimación (min) *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha límite (opcional)</FormLabel>
                <FormControl>
                  <Input type="date" value={field.value ?? ""} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Tags</div>

          <div className="flex items-center gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Escribe y pulsa Enter…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag(tagInput)
                  setTagInput("")
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                addTag(tagInput)
                setTagInput("")
              }}
            >
              Añadir
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {form.watch("tags").map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => removeTag(t)}
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Eliminar tag ${t}`}
                title="Click para eliminar"
              >
                <Badge variant="secondary">{t} ✕</Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  )
}
