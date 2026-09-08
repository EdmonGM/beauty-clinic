import { format, set } from "date-fns"

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function formatPrice(value: { toNumber(): number } | number): string {
  const amount = typeof value === "number" ? value : value.toNumber()
  return priceFormatter.format(amount)
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const hourLabel = `${hours} hr${hours > 1 ? "s" : ""}`
  if (hours === 0) return `${mins} min`
  if (mins === 0) return hourLabel
  return `${hourLabel} ${mins} min`
}

/** Parses a "YYYY-MM-DD" string into a local Date at midnight. */
export function parseDateStr(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/** Formats a Date's time-of-day as "HH:mm". */
export function formatTimeStr(date: Date): string {
  return format(date, "HH:mm")
}

/** Sets a "HH:mm" time-of-day onto a given date. */
export function setTimeStr(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number)
  return set(date, { hours, minutes, seconds: 0, milliseconds: 0 })
}
