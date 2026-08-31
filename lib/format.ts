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
