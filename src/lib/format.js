// Pure display formatters, extracted from App.jsx so they can be unit-tested
// without pulling in the React/Supabase tree.

export const fmt = n => n == null ? '—' : '$' + Math.round(n).toLocaleString()

export const fmtDec = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtDate = (dateStr, withYear = false) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', withYear
    ? { day: 'numeric', month: 'short', year: 'numeric' }
    : { day: 'numeric', month: 'short' }
  )
