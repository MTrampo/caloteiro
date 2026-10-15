"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * Converte de forma segura uma string "YYYY-MM-DD" para um objeto Date local,
 * prevenindo o clássico desvio de fuso horário UTC (UTC-3 voltando 1 dia).
 */
export function parseISODateToLocal(dateStr?: string | null): Date | undefined {
  if (!dateStr) return undefined
  if (typeof dateStr !== "string") return undefined

  const parts = dateStr.trim().split("-").map(Number)
  if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
    const [year, month, day] = parts
    return new Date(year, month - 1, day)
  }

  const fallback = new Date(dateStr)
  return isNaN(fallback.getTime()) ? undefined : fallback
}

/**
 * Converte um objeto Date local para a string ISO "YYYY-MM-DD" esperada
 * pelo banco de dados Supabase e schemas Zod.
 */
export function formatLocalDateToISO(date?: Date | null): string {
  if (!date || isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export interface DatePickerProps {
  value?: string | Date | null
  onChange?: (dateString: string, date?: Date) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
  disabledDays?: (date: Date) => boolean
  id?: string
  name?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione uma data",
  disabled = false,
  className,
  minDate,
  maxDate,
  disabledDays,
  id,
  name,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Normaliza o valor para Date
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? undefined : value
    }
    return parseISODateToLocal(value)
  }, [value])

  const handleSelect = (date?: Date) => {
    if (!date) {
      onChange?.("", undefined)
      return
    }
    const isoString = formatLocalDateToISO(date)
    onChange?.(isoString, date)
    setOpen(false)
  }

  // Combina desabilitação por limites mínimos/máximos se fornecidos
  const isDateDisabled = React.useCallback(
    (date: Date) => {
      if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true
      if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) return true
      if (disabledDays && disabledDays(date)) return true
      return false
    },
    [minDate, maxDate, disabledDays]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            name={name}
            type="button"
            variant="outline"
            disabled={disabled}
            data-empty={!selectedDate}
            className={cn(
              "w-full justify-start text-left font-mono text-xs sm:text-sm h-11 bg-zinc-950/60 border-zinc-800 text-white hover:bg-zinc-900 hover:text-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 data-[empty=true]:text-zinc-500",
              className
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 size-4 text-zinc-400 shrink-0" />
        {selectedDate ? (
          <span className="text-zinc-100 font-medium">
            {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
          </span>
        ) : (
          <span className="text-zinc-500 font-normal">{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-1 bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl rounded-2xl"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          locale={ptBR}
          disabled={isDateDisabled}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
