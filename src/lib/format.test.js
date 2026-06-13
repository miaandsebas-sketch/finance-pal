import { describe, it, expect } from 'vitest'
import { fmt, fmtDec, fmtDate } from './format.js'

describe('fmt', () => {
  it('renders an em dash for null/undefined', () => {
    expect(fmt(null)).toBe('—')
    expect(fmt(undefined)).toBe('—')
  })
  it('rounds to whole dollars (locale-independent digits)', () => {
    expect(fmt(0)).toBe('$0')
    expect(fmt(1234.6).startsWith('$')).toBe(true)
    expect(fmt(1234.6).replace(/[^0-9]/g, '')).toBe('1235')
  })
})

describe('fmtDec', () => {
  it('renders an em dash for null', () => {
    expect(fmtDec(null)).toBe('—')
  })
  it('formats with two decimals and en-SG grouping', () => {
    expect(fmtDec(1234.5)).toBe('$1,234.50')
    expect(fmtDec(1000000)).toBe('$1,000,000.00')
  })
})

describe('fmtDate', () => {
  it('formats YYYY-MM-DD as day + short month', () => {
    expect(fmtDate('2026-06-13')).toBe('13 Jun')
  })
  it('includes the year when asked', () => {
    expect(fmtDate('2026-06-13', true)).toBe('13 Jun 2026')
  })
})
