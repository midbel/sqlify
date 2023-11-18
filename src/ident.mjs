const reIdent = /^[a-zA-Z][a-zA-Z0-9_]{0,}/

export function checkIdent (ident) {
  ident = ident.trim()
  if (!ident) {
    throw new Error('empty identifier')
  }
  if (!reIdent.test(ident)) {
    throw new Error('invalid identifier')
  }
  return ident
}
