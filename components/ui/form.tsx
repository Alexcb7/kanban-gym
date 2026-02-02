"use client"

import * as React from "react"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

/* -------------------------------------------------------------------------- */
/*                                   FORM                                     */
/* -------------------------------------------------------------------------- */

/**
 * ✅ FIX CLAVE
 * Este Form NO es un alias directo de FormProvider.
 * Así preservamos los genéricos y evitamos errores de Control/Resolver.
 */
export function Form<TFieldValues extends FieldValues>({
  children,
  ...methods
}: UseFormReturn<TFieldValues> & {
  children: React.ReactNode
}) {
  return <FormProvider {...methods}>{children}</FormProvider>
}

/* -------------------------------------------------------------------------- */
/*                               FORM FIELD                                   */
/* -------------------------------------------------------------------------- */

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/*                               USE FORM FIELD                               */
/* -------------------------------------------------------------------------- */

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField debe usarse dentro de <FormField>")
  }

  const fieldState = getFieldState(fieldContext.name, formState)

  return {
    name: fieldContext.name,
    ...fieldState,
  }
}

/* -------------------------------------------------------------------------- */
/*                               FORM ITEM                                    */
/* -------------------------------------------------------------------------- */

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

export function FormItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/*                               FORM LABEL                                   */
/* -------------------------------------------------------------------------- */

export function FormLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Label>) {
  const { id } = React.useContext(FormItemContext)
  const { error } = useFormField()

  return (
    <Label
      htmlFor={id}
      className={cn(error && "text-destructive", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                              FORM CONTROL                                  */
/* -------------------------------------------------------------------------- */

export function FormControl({
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { id } = React.useContext(FormItemContext)
  const { error } = useFormField()

  return (
    <div
      id={id}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                              FORM MESSAGE                                  */
/* -------------------------------------------------------------------------- */

export function FormMessage({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { id } = React.useContext(FormItemContext)
  const { error } = useFormField()

  if (!error) return null

  return (
    <p
      id={`${id}-error`}
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {String(error.message)}
    </p>
  )
}
