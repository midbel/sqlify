export function sqlify (item) {
  const str = item.toSql?.()
  if (str) {
    return str
  }
  return item == marker ? '?' : item.toString()
}

export function isPrimitive(v) {
  const ok = typeof(v) === "string" || typeof(v) === "number" || typeof(v) === "boolean"
  return ok || v instanceof Date
}

export const marker = Symbol('?')
