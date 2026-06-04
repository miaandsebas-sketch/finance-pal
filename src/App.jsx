import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { LayoutDashboard, Wallet, CreditCard, TrendingUp, Hammer, X, Plus, ExternalLink, ChevronDown, ChevronRight, ArrowUpRight, ArrowDownRight, Minus, DollarSign, Settings2, Moon, Sun, Pencil, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid, ComposedChart, ReferenceLine, Cell } from 'recharts'

const THEME = '#0f766e'
const APP_DEVICE_KEY = 'finance-pal-device'

const fmt = n => n == null ? '—' : '$' + Math.round(n).toLocaleString()
const fmtDec = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (dateStr, withYear = false) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', withYear
    ? { day: 'numeric', month: 'short', year: 'numeric' }
    : { day: 'numeric', month: 'short' }
  )

// Displays/accepts DD/MM/YYYY; stores value as YYYY-MM-DD
function DateInput({ value, onChange, className, style }) {
  const toDisplay = v => v ? v.split('-').reverse().join('/') : ''
  const [text, setText] = useState(toDisplay(value))

  useEffect(() => { setText(toDisplay(value)) }, [value])

  function handleChange(e) {
    const raw = e.target.value
    setText(raw)
    const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (m) onChange(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`)
  }

  return (
    <input type="text" value={text} onChange={handleChange}
      onBlur={() => setText(toDisplay(value))}
      placeholder="DD/MM/YYYY" className={className} style={style} />
  )
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    async function initAuth() {
      if (window.location.hash.includes('access_token')) {
        const params = new URLSearchParams(window.location.hash.slice(1))
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token })
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      }
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setAuthLoading(false)
    }
    initAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (authLoading) return null
  if (!session) return <LoginScreen />
  return <MainApp session={session} />
}

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 bg-[#FBF6EE]">
      <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 w-full max-w-xs shadow-sm">
        <div className="text-3xl text-center mb-1">💰</div>
        <h1 className="text-xl font-bold mb-6 text-center text-gray-900">Finance Pal</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email" className="w-full border border-gray-200 rounded-xl px-3 py-3 mb-3 outline-none focus:border-teal-500"
          style={{ fontSize: 16 }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Password" className="w-full border border-gray-200 rounded-xl px-3 py-3 mb-4 outline-none focus:border-teal-500"
          style={{ fontSize: 16 }} />
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: THEME }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

// ── Identity ──────────────────────────────────────────────────────────────────

function Onboarding({ onSelect }) {
  return (
    <div className="min-h-dvh bg-[#FBF6EE] flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 w-full max-w-xs text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Who's using this?</h2>
        <p className="text-sm text-gray-400 mb-6">Personalises your view. You can change this anytime.</p>
        {['Mia', 'Sebastian', 'Shared'].map(name => (
          <button key={name} onClick={() => onSelect(name)}
            className="w-full py-3 border-2 border-gray-100 rounded-xl font-semibold text-gray-800 mb-3 last:mb-0 active:bg-[#FBF6EE]">
            {name === 'Shared' ? 'Shared (see all)' : name}
          </button>
        ))}
      </div>
    </div>
  )
}

function IdentityPicker({ current, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-xs text-center shadow-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Switch view</h2>
        <p className="text-sm text-gray-400 mb-6">Change whose accounts you see first.</p>
        {['Mia', 'Sebastian', 'Shared'].map(name => (
          <button key={name} onClick={() => onSelect(name)}
            className={`w-full py-3 border-2 rounded-xl font-semibold mb-3 last:mb-0 transition-colors ${
              name === current ? 'border-teal-600 text-teal-700' : 'border-gray-100 text-gray-800'
            }`}>
            {name === 'Shared' ? 'Shared (see all)' : name}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

function MainApp({ session }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('ms-theme', next ? 'dark' : 'light')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.content = next ? '#1a1713' : '#0f766e'
    window.parent.postMessage({ type: 'app:theme', theme: next ? 'dark' : 'light' }, '*')
  }

  const [device, setDevice] = useState(null)
  const [deviceReady, setDeviceReady] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [tab, setTab] = useState('dashboard')
  useEffect(() => {
    window.parent.postMessage({ type: 'app:tab', home: tab === 'dashboard' }, '*')
  }, [tab])
  useEffect(() => {
    function onMessage(e) {
      if (e.data?.type === 'app:goHome') setTab('dashboard')
      if (e.data?.type === 'hub:theme') {
        const isDark = e.data.theme === 'dark'
        setDark(isDark)
        document.documentElement.classList.toggle('dark', isDark)
        localStorage.setItem('ms-theme', e.data.theme)
        const meta = document.querySelector('meta[name="theme-color"]')
        if (meta) meta.content = isDark ? '#1a1713' : '#0f766e'
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const [accounts, setAccounts] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [investments, setInvestments] = useState([])
  const [invTypes, setInvTypes] = useState([])
  const [homeItems, setHomeItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const urlDevice = new URLSearchParams(window.location.search).get('device')
    if (urlDevice) {
      setDevice(urlDevice)
    } else {
      const stored = localStorage.getItem(APP_DEVICE_KEY) || localStorage.getItem('mia-seb-identity')
      if (stored) setDevice(stored)
    }
    setDeviceReady(true)
  }, [])

  function handleDeviceSelect(name) {
    localStorage.setItem(APP_DEVICE_KEY, name)
    localStorage.setItem('mia-seb-identity', name)
    setDevice(name)
    setShowPicker(false)
  }

  const fetchAll = useCallback(async () => {
    const [{ data: accs }, { data: snaps }, { data: invs }, { data: types }, { data: home }] = await Promise.all([
      supabase.from('user_accounts').select('*').is('archived_at', null).order('sort_order'),
      supabase.from('account_snapshots').select('*').order('snapshot_date', { ascending: true }),
      supabase.from('investment_purchases').select('*').order('purchase_date', { ascending: false }),
      supabase.from('investment_types').select('*').order('sort_order'),
      supabase.from('home_improvement_items').select('*').order('created_at', { ascending: true }),
    ])
    setAccounts(accs || [])
    setSnapshots(snaps || [])
    setInvestments(invs || [])
    setInvTypes(types || [])
    setHomeItems(home || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const channel = supabase.channel('finance-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_accounts' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'account_snapshots' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investment_purchases' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investment_types' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'home_improvement_items' }, fetchAll)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchAll])

  if (!deviceReady) return null
  if (!device) return <Onboarding onSelect={handleDeviceSelect} />

  const latestSnap = {}
  snapshots.forEach(s => {
    if (!latestSnap[s.account_key] || s.snapshot_date > latestSnap[s.account_key].snapshot_date) {
      latestSnap[s.account_key] = s
    }
  })

  const tabs = [
    { id: 'dashboard',   label: 'Overview', icon: LayoutDashboard },
    { id: 'accounts',    label: 'Accounts', icon: Wallet },
    { id: 'debts',       label: 'Debts',    icon: CreditCard },
    { id: 'investments', label: 'Invest',   icon: TrendingUp },
    { id: 'home',        label: 'Home',     icon: Hammer },
  ]

  return (
    <div className="min-h-dvh bg-[#FBF6EE] flex flex-col">
      <header className="bg-[#FBF6EE] sticky top-0 z-20"
        style={{ borderBottom: '1px solid #ede8df', paddingTop: 'max(20px, env(safe-area-inset-top))' }}>
        <div className="max-w-[30rem] mx-auto px-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: THEME }}>
              <DollarSign size={22} color="white" />
            </div>
            <div>
              <h1 className="text-[1.15rem] font-bold tracking-tight text-gray-900 leading-tight">Finance Pal</h1>
              <p className="text-xs text-gray-400">Mia &amp; Sebastian's finances</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme}
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center active:opacity-70"
              style={{ backgroundColor: `${THEME}1a`, color: THEME }}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setShowPicker(true)}
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-bold text-sm active:opacity-70"
              style={{ backgroundColor: `${THEME}1a`, color: THEME }}>
              {device === 'Shared' ? '★' : (device?.[0] ?? '?').toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-[30rem] mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading…</div>
        ) : tab === 'dashboard' ? (
          <Dashboard latestSnap={latestSnap} accounts={accounts} snapshots={snapshots} dark={dark} />
        ) : tab === 'accounts' ? (
          <Snapshots snapshots={snapshots} accounts={accounts} onRefresh={fetchAll} filter="assets" dark={dark} />
        ) : tab === 'debts' ? (
          <Snapshots snapshots={snapshots} accounts={accounts} onRefresh={fetchAll} filter="debts" dark={dark} />
        ) : tab === 'investments' ? (
          <Investments investments={investments} invTypes={invTypes} latestSnap={latestSnap} onRefresh={fetchAll} dark={dark} />
        ) : (
          <HomeImprovement items={homeItems} onRefresh={fetchAll} device={device} />
        )}
        </div>
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {tabs.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center pt-2 pb-1 gap-0.5 text-[0.65rem] font-medium transition-colors ${
                active ? 'text-teal-700' : 'text-gray-400'
              }`}>
              <Icon size={20} />
              {t.label}
            </button>
          )
        })}
      </nav>

      {showPicker && <IdentityPicker current={device} onSelect={handleDeviceSelect} onClose={() => setShowPicker(false)} />}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ latestSnap, accounts, snapshots, dark }) {
  const assetAccounts = accounts.filter(a => !a.is_debt)
  const debtAccounts  = accounts.filter(a => a.is_debt)

  const excludedAccounts = accounts.filter(a => a.exclude_from_nw)
  const totalAssets    = assetAccounts.filter(a => !a.exclude_from_nw).reduce((s, a) => s + (latestSnap[a.key] ? parseFloat(latestSnap[a.key].amount) : 0), 0)
  const totalDebt      = debtAccounts.filter(a => !a.exclude_from_nw).reduce((s, a)  => s + (latestSnap[a.key] ? parseFloat(latestSnap[a.key].amount) : 0), 0)
  const netWorth       = totalAssets - totalDebt

  // Net worth history — one point per snapshot date, forward-filling missing accounts
  const dates = [...new Set(snapshots.map(s => s.snapshot_date))].sort()
  const netWorthHistory = dates.map(date => {
    const relevant = {}
    snapshots.filter(s => s.snapshot_date <= date).forEach(s => {
      if (!relevant[s.account_key] || s.snapshot_date > relevant[s.account_key].snapshot_date)
        relevant[s.account_key] = s
    })
    let assets = 0, debt = 0
    accounts.forEach(acc => {
      const snap = relevant[acc.key]
      if (!snap || acc.exclude_from_nw) return
      if (!acc.is_debt) assets += parseFloat(snap.amount)
      else debt += parseFloat(snap.amount)
    })
    return {
      label: fmtDate(date),
      netWorth: assets - debt,
      totalAssets: assets,
      totalDebt: debt,
    }
  })

  const savingsDelta = netWorthHistory.slice(1).map((point, i) => ({
    label: point.label,
    delta: point.netWorth - netWorthHistory[i].netWorth,
  }))

  // Trend vs previous snapshot date
  const prev = netWorthHistory.at(-2)
  const curr = netWorthHistory.at(-1)
  const nwDiff   = curr && prev ? curr.netWorth - prev.netWorth : null
  const nwDiffPct = nwDiff != null && prev?.netWorth ? (nwDiff / Math.abs(prev.netWorth)) * 100 : null

  // Per-account previous snapshot for trend arrows
  const prevSnapByKey = {}
  const byKey = {}
  ;[...snapshots].sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date)).forEach(s => {
    byKey[s.account_key] = byKey[s.account_key] || []
    byKey[s.account_key].push(s)
  })
  Object.entries(byKey).forEach(([k, arr]) => { if (arr.length >= 2) prevSnapByKey[k] = arr.at(-2) })

  const includedAssets = assetAccounts.filter(a => !a.exclude_from_nw)
  const includedDebts  = debtAccounts.filter(a => !a.exclude_from_nw)

  const hasPrevAssets = includedAssets.some(a => prevSnapByKey[a.key])
  const prevTotalAssets = hasPrevAssets ? includedAssets.reduce((s, a) => s + (prevSnapByKey[a.key] ? parseFloat(prevSnapByKey[a.key].amount) : 0), 0) : null
  const assetsPct = prevTotalAssets != null && prevTotalAssets !== 0 ? ((totalAssets - prevTotalAssets) / Math.abs(prevTotalAssets)) * 100 : null

  const hasPrevDebt = includedDebts.some(a => prevSnapByKey[a.key])
  const prevTotalDebt = hasPrevDebt ? includedDebts.reduce((s, a) => s + (prevSnapByKey[a.key] ? parseFloat(prevSnapByKey[a.key].amount) : 0), 0) : null
  const debtPct = prevTotalDebt != null && prevTotalDebt !== 0 ? ((totalDebt - prevTotalDebt) / Math.abs(prevTotalDebt)) * 100 : null

  const lastUpdatedDate = snapshots.length > 0
    ? snapshots.reduce((max, s) => s.snapshot_date > max ? s.snapshot_date : max, '')
    : null

  const goalAccounts = accounts.filter(a => a.goal && !a.is_debt)

  function Trend({ current, previous, isDebt }) {
    if (current == null || previous == null) return <span className="text-gray-300 text-xs">—</span>
    const diff = current - previous
    if (diff === 0) return <span className="flex items-center gap-0.5 text-xs text-gray-400"><Minus size={12} /> 0%</span>
    const pct = Math.abs(diff / previous * 100).toFixed(1)
    // For debts, going down is good (green); for assets, going up is good (green)
    const positive = isDebt ? diff < 0 : diff > 0
    return (
      <span className={`flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-emerald-500' : 'text-red-400'}`}>
        {diff > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        {pct}%
      </span>
    )
  }

  return (
    <div className="px-4 pt-4 pb-2 space-y-4">

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Net Worth',    value: netWorth,    pct: nwDiffPct, isDebt: false, accent: true, note: excludedAccounts.length > 0 ? `excl. ${excludedAccounts.map(a => a.label).join(', ')}` : null },
          { label: 'Total Assets', value: totalAssets, pct: assetsPct, isDebt: false },
          { label: 'Total Debt',   value: totalDebt,   pct: debtPct,   isDebt: true  },
          { label: 'Last Updated', value: null,        pct: null,      date: lastUpdatedDate },
        ].map(card => {
          const trendGood = card.isDebt ? card.pct < 0 : card.pct >= 0
          return (
            <div key={card.label} className={`rounded-2xl p-4 ${card.accent ? 'text-white' : 'bg-white'}`}
              style={card.accent ? { backgroundColor: THEME } : {}}>
              <p className={`text-xs font-medium mb-1 ${card.accent ? 'text-white/70' : 'text-gray-400'}`}>{card.label}</p>
              {'date' in card ? (
                <p className="text-sm font-bold leading-tight text-gray-900">{card.date ? fmtDate(card.date, true) : '—'}</p>
              ) : (
                <p className={`text-xl font-bold leading-tight ${card.accent ? 'text-white' : card.isDebt ? 'text-red-500' : 'text-gray-900'}`}>
                  {fmt(card.value)}
                </p>
              )}
              {card.pct != null && (
                <span className={`flex items-center gap-0.5 text-xs mt-1 font-medium ${
                  card.accent
                    ? (trendGood ? 'text-emerald-300' : 'text-red-300')
                    : (trendGood ? 'text-emerald-500' : 'text-red-400')
                }`}>
                  {card.pct >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {Math.abs(card.pct).toFixed(1)}% vs prev
                </span>
              )}
              {card.note && (
                <p className="text-[0.6rem] text-white/50 mt-1 leading-tight">{card.note}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Net worth trend chart */}
      {netWorthHistory.length > 1 && (
        <div className="bg-white rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Net Worth Over Time</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={netWorthHistory}>
              <defs>
                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={THEME} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={THEME} stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="assetsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={dark ? '#2e2b24' : '#f3f4f6'} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: dark ? '#9a9489' : '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                formatter={(v, name) => {
                  const labels = { netWorth: 'Net Worth', totalAssets: 'Assets', totalDebt: 'Debt' }
                  return [fmt(v), labels[name] || name]
                }}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', backgroundColor: dark ? '#242019' : '#fff', color: dark ? '#f0ece4' : '#374151' }}
              />
              <Area type="monotone" dataKey="totalAssets" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#assetsGrad)" dot={false} />
              <Area type="monotone" dataKey="totalDebt" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#debtGrad)" dot={false} />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke={THEME}
                strokeWidth={2}
                fill="url(#nwGrad)"
                dot={(props) => {
                  const isLast = props.index === netWorthHistory.length - 1
                  return isLast ? (
                    <circle key={props.index} cx={props.cx} cy={props.cy} r={4} fill={THEME} stroke="white" strokeWidth={2} />
                  ) : (
                    <g key={props.index} />
                  )
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1 text-[0.65rem] text-gray-500">
              <span className="inline-block w-4 border-t-2 border-solid" style={{ borderColor: THEME }} /> Net Worth
            </span>
            <span className="flex items-center gap-1 text-[0.65rem] text-gray-500">
              <span className="inline-block w-4 border-t-2 border-dashed border-emerald-500" /> Assets
            </span>
            <span className="flex items-center gap-1 text-[0.65rem] text-gray-500">
              <span className="inline-block w-4 border-t-2 border-dashed border-red-400" /> Debt
            </span>
          </div>
        </div>
      )}

      {/* Monthly savings delta */}
      {savingsDelta.length > 0 && (
        <div className="bg-white rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Monthly Savings</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={savingsDelta} barSize={14}>
              <CartesianGrid vertical={false} stroke={dark ? '#2e2b24' : '#f3f4f6'} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: dark ? '#9a9489' : '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                formatter={(v) => [fmt(v), 'Change']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', backgroundColor: dark ? '#242019' : '#fff', color: dark ? '#f0ece4' : '#374151' }}
              />
              <Bar dataKey="delta" radius={[3, 3, 0, 0]}>
                {savingsDelta.map((entry, index) => (
                  <Cell key={index} fill={entry.delta >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Goals progress */}
      {goalAccounts.length > 0 && (
        <div className="bg-white rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Goals</p>
          <div className="space-y-3">
            {goalAccounts.map(acc => {
              const amount = latestSnap[acc.key] ? parseFloat(latestSnap[acc.key].amount) : 0
              const progress = Math.min(amount / acc.goal, 1)
              const pct = Math.round(progress * 100)
              return (
                <div key={acc.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700">{acc.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{fmtDec(amount)} / {fmt(acc.goal)}</span>
                      <span className="text-xs font-semibold text-gray-700">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#10b981' : THEME }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Account list */}
      {accounts.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">No accounts yet — add one in the Snapshots tab.</p>
      ) : (
        <>
          {[
            { heading: 'Assets', items: assetAccounts },
            { heading: 'Debts',  items: debtAccounts  },
          ].filter(g => g.items.length > 0).map(group => (
            <div key={group.heading} className="bg-white rounded-2xl overflow-hidden">
              <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">{group.heading}</p>
              <div className="divide-y divide-gray-50">
                {group.items.map(acc => {
                  const snap = latestSnap[acc.key]
                  const prev = prevSnapByKey[acc.key]
                  const amount = snap ? parseFloat(snap.amount) : null
                  const prevAmount = prev ? parseFloat(prev.amount) : null
                  return (
                    <div key={acc.key} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-800">{acc.label}</p>
                        {snap && (
                          <p className="text-[0.65rem] text-gray-300">
                            {fmtDate(snap.snapshot_date, true)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <p className={`text-sm font-semibold ${acc.is_debt ? 'text-red-500' : 'text-gray-900'}`}>
                          {fmtDec(amount)}
                        </p>
                        <Trend current={amount} previous={prevAmount} isDebt={acc.is_debt} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ── Snapshots ─────────────────────────────────────────────────────────────────

function Snapshots({ snapshots, accounts, onRefresh, filter, dark }) {
  const [showForm, setShowForm] = useState(false)
  const [showManager, setShowManager] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)

  const isDebtsPage = filter === 'debts'
  const visibleAccounts = accounts.filter(a => isDebtsPage ? a.is_debt : !a.is_debt)

  const snapshotsByAccount = {}
  snapshots.forEach(s => {
    if (!snapshotsByAccount[s.account_key]) snapshotsByAccount[s.account_key] = []
    snapshotsByAccount[s.account_key].push(s)
  })

  return (
    <div className="px-4 pt-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-900">{isDebtsPage ? 'Debts' : 'Accounts'}</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowManager(true)}
            className="flex items-center gap-1 text-sm font-medium text-gray-400 active:text-gray-600">
            <Plus size={14} /> {isDebtsPage ? 'Debt' : 'Account'}
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-sm font-medium text-teal-700 active:opacity-70">
            Record Balances
          </button>
        </div>
      </div>

      {visibleAccounts.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">
          No {isDebtsPage ? 'debts' : 'accounts'} yet — tap <span className="font-medium">+ {isDebtsPage ? 'Debt' : 'Account'}</span> to add one.
        </p>
      ) : (
        <div className="space-y-3">
          {visibleAccounts.map(acc => {
            const history = snapshotsByAccount[acc.key] || []
            const chartData = history.map(s => ({
              amount: parseFloat(s.amount),
              label: fmtDate(s.snapshot_date),
            }))
            const latest = history[history.length - 1]
            return (
              <div key={acc.key} className="bg-white rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <button onClick={() => setSelectedAccount(acc)} className="flex items-center gap-1 active:opacity-70">
                    <span className="text-sm font-medium text-gray-800">{acc.label}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </button>
                  <span className={`text-sm font-semibold ${acc.is_debt ? 'text-red-600' : 'text-gray-900'}`}>
                    {latest ? fmtDec(parseFloat(latest.amount)) : '—'}
                  </span>
                </div>
                {chartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={90}>
                    <LineChart data={chartData}>
                      <Line type="monotone" dataKey="amount" stroke={acc.is_debt ? '#ef4444' : THEME} strokeWidth={2} dot={false} />
                      <XAxis dataKey="label"
                        tick={{ fontSize: 9, fill: '#d1d5db' }}
                        axisLine={false} tickLine={false}
                        ticks={[chartData[0].label, chartData.at(-1).label]}
                        interval="preserveStartEnd"
                      />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip formatter={v => fmtDec(v)} labelFormatter={l => l} contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', backgroundColor: dark ? '#242019' : '#fff', color: dark ? '#f0ece4' : '#374151' }} />
                      {acc.goal > 0 && (
                        <ReferenceLine y={acc.goal} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3"
                          label={{ value: fmt(acc.goal), position: 'insideTopRight', fontSize: 9, fill: '#f59e0b' }} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-300 mt-1">{chartData.length === 1 ? 'Add more snapshots to see a chart' : 'No data yet'}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && <SnapshotForm accounts={visibleAccounts} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); onRefresh() }} />}
      {showManager && <AccountManager accounts={visibleAccounts} defaultIsDebt={isDebtsPage} onClose={() => setShowManager(false)} onSaved={() => { setShowManager(false); onRefresh() }} />}
      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          snapshots={snapshotsByAccount[selectedAccount.key] || []}
          onClose={() => setSelectedAccount(null)}
          onRefresh={onRefresh}
          dark={dark}
        />
      )}
    </div>
  )
}

function SnapshotForm({ accounts, onClose, onSaved }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [amounts, setAmounts] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    const entries = Object.entries(amounts).filter(([, v]) => v !== '')
    if (!entries.length) { setError('Enter at least one balance'); return }
    setSaving(true)
    const { data: hh } = await supabase.from('household_members').select('household_id').single()
    if (!hh) { setError('Household not found — check your Supabase setup'); setSaving(false); return }
    const rows = entries.map(([key, val]) => ({
      household_id: hh.household_id,
      account_key: key,
      amount: parseFloat(val),
      snapshot_date: date,
    }))
    const { error: err } = await supabase.from('account_snapshots').upsert(rows, { onConflict: 'household_id,account_key,snapshot_date' })
    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Add Snapshot</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">Date</label>
            <DateInput value={date} onChange={setDate}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
              style={{ fontSize: 16 }} />
          </div>
          {[
            { label: 'Assets', items: accounts.filter(a => !a.is_debt) },
            { label: 'Debts', items: accounts.filter(a => a.is_debt) },
          ].filter(g => g.items.length > 0).map(group => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{group.label}</p>
              {group.items.map(acc => (
                <div key={acc.key} className="mb-3">
                  <label className="text-xs text-gray-500 font-medium">{acc.label}</label>
                  <input type="number" step="0.01" placeholder="Leave blank to skip"
                    value={amounts[acc.key] ?? ''}
                    onChange={e => setAmounts(prev => ({ ...prev, [acc.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
                    style={{ fontSize: 16 }} />
                </div>
              ))}
            </div>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: THEME }}>
            {saving ? 'Saving…' : 'Save Snapshot'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Account Detail ────────────────────────────────────────────────────────────

function AccountDetailModal({ account, snapshots, onClose, onRefresh, dark }) {
  const [editing, setEditing] = useState(null)

  const sorted = [...snapshots].sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date))
  const chartData = [...snapshots].sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date))
    .map(s => ({ amount: parseFloat(s.amount), label: fmtDate(s.snapshot_date) }))

  async function handleDelete(snap) {
    if (!confirm(`Delete snapshot for ${fmtDate(snap.snapshot_date, true)}?`)) return
    await supabase.from('account_snapshots').delete().eq('id', snap.id)
    onRefresh()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85dvh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900">{account.label}</h3>
            <p className="text-xs text-gray-400">{account.owner}{account.is_debt ? ' · Debt' : ''} · {sorted.length} snapshot{sorted.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        {chartData.length > 1 && (
          <div className="px-5 pt-4 shrink-0">
            <ResponsiveContainer width="100%" height={90}>
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="amount" stroke={account.is_debt ? '#ef4444' : THEME} strokeWidth={2} dot={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false}
                  ticks={[chartData[0].label, chartData.at(-1).label]} interval="preserveStartEnd" />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip formatter={v => fmtDec(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', backgroundColor: dark ? '#242019' : '#fff', color: dark ? '#f0ece4' : '#374151' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          {sorted.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No snapshots yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {sorted.map(snap => (
                <div key={snap.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-700">{fmtDate(snap.snapshot_date, true)}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-semibold ${account.is_debt ? 'text-red-600' : 'text-gray-900'}`}>
                      {fmtDec(parseFloat(snap.amount))}
                    </span>
                    <button onClick={() => setEditing(snap)} className="text-gray-300 active:text-teal-600 p-1">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(snap)} className="text-gray-300 active:text-red-400 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <SnapshotEditForm
          snapshot={editing}
          account={account}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); onRefresh() }}
        />
      )}
    </div>
  )
}

function SnapshotEditForm({ snapshot, account, onClose, onSaved }) {
  const [date, setDate] = useState(snapshot.snapshot_date)
  const [amount, setAmount] = useState(String(parseFloat(snapshot.amount)))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    if (!amount) { setError('Amount is required'); return }
    setSaving(true)
    const { error: err } = await supabase
      .from('account_snapshots')
      .update({ amount: parseFloat(amount), snapshot_date: date })
      .eq('id', snapshot.id)
    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md"
        onClick={e => e.stopPropagation()}>
        <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Edit Snapshot</h3>
            <p className="text-xs text-gray-400">{account.label}</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">Date</label>
            <DateInput value={date} onChange={setDate}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
              style={{ fontSize: 16 }} />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Amount (SGD)</label>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
              style={{ fontSize: 16 }} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: THEME }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Account Manager ───────────────────────────────────────────────────────────

function AccountManager({ accounts, onClose, onSaved, defaultIsDebt = false }) {
  const [editing, setEditing] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Manage Accounts</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="divide-y divide-gray-50">
          {accounts.map(acc => (
            <div key={acc.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{acc.label}</p>
                <p className="text-xs text-gray-400">
                  {acc.owner}{acc.goal ? ` · Goal ${fmt(acc.goal)}` : ''}{acc.is_debt ? ' · Debt' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setEditing(acc)}
                  className="text-xs text-teal-600 font-medium active:opacity-60">Edit</button>
                <button onClick={async () => {
                  if (!confirm(`Remove "${acc.label}"? Past snapshots are kept.`)) return
                  await supabase.from('user_accounts').update({ archived_at: new Date().toISOString() }).eq('id', acc.id)
                  onSaved()
                }} className="text-xs text-red-400 font-medium active:opacity-60">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-100">
          {showAdd ? (
            <AccountForm onClose={() => setShowAdd(false)} onSaved={onSaved} defaultIsDebt={defaultIsDebt} />
          ) : (
            <button onClick={() => setShowAdd(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 flex items-center justify-center gap-1 active:border-teal-300 active:text-teal-600">
              <Plus size={16} /> Add account
            </button>
          )}
        </div>
      </div>

      {editing && (
        <AccountForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onSaved() }} />
      )}
    </div>
  )
}

function AccountForm({ initial, onClose, onSaved, defaultIsDebt = false }) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [owner, setOwner] = useState(initial?.owner ?? 'Both')
  const [goal, setGoal] = useState(initial?.goal ?? '')
  const [isDebt, setIsDebt] = useState(initial?.is_debt ?? defaultIsDebt)
  const [excludeFromNw, setExcludeFromNw] = useState(initial?.exclude_from_nw ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    if (!label.trim()) { setError('Label is required'); return }
    setSaving(true)
    const payload = {
      label: label.trim(),
      owner,
      goal: goal !== '' ? parseFloat(goal) : null,
      is_debt: isDebt,
      exclude_from_nw: excludeFromNw,
    }
    let err
    if (initial) {
      ;({ error: err } = await supabase.from('user_accounts').update(payload).eq('id', initial.id))
    } else {
      const { data: hh } = await supabase.from('household_members').select('household_id').single()
      if (!hh) { setError('Household not found'); setSaving(false); return }
      const { data: maxOrder } = await supabase.from('user_accounts').select('sort_order').order('sort_order', { ascending: false }).limit(1).single()
      const key = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '_' + Date.now()
      ;({ error: err } = await supabase.from('user_accounts').insert({
        ...payload,
        key,
        household_id: hh.household_id,
        sort_order: (maxOrder?.sort_order ?? 0) + 1,
      }))
    }
    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md"
        onClick={e => e.stopPropagation()}>
        <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{initial ? 'Edit Account' : 'New Account'}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">Label</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Mingyue — DBS"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
              style={{ fontSize: 16 }} />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Owner</label>
            <select value={owner} onChange={e => setOwner(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500 bg-white"
              style={{ fontSize: 16 }}>
              {['Sebastian', 'Mingyue', 'Both'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Goal (SGD) — optional</label>
            <input type="number" step="1" placeholder="e.g. 20000" value={goal} onChange={e => setGoal(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
              style={{ fontSize: 16 }} />
          </div>
          <label className="flex items-center gap-3 py-1 cursor-pointer">
            <div onClick={() => setIsDebt(v => !v)}
              className={`w-10 h-6 rounded-full transition-colors relative ${isDebt ? 'bg-red-400' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isDebt ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm text-gray-700">This is a debt / liability</span>
          </label>
          <label className="flex items-center gap-3 py-1 cursor-pointer">
            <div onClick={() => setExcludeFromNw(v => !v)}
              className={`w-10 h-6 rounded-full transition-colors relative ${excludeFromNw ? 'bg-teal-500' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${excludeFromNw ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm text-gray-700">Exclude from totals</span>
          </label>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: THEME }}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Investments ───────────────────────────────────────────────────────────────

function Investments({ investments, invTypes, latestSnap, onRefresh, dark }) {
  const [showForm, setShowForm] = useState(false)
  const [showManager, setShowManager] = useState(false)

  const byType = {}
  invTypes.forEach(t => { byType[t.key] = [] })
  investments.forEach(inv => { if (byType[inv.inv_type]) byType[inv.inv_type].push(inv) })

  const monthlyMap = {}
  investments.forEach(inv => {
    const month = inv.purchase_date.slice(0, 7)
    if (!monthlyMap[month]) {
      monthlyMap[month] = { month }
      invTypes.forEach(t => { monthlyMap[month][t.key] = 0 })
    }
    if (monthlyMap[month][inv.inv_type] !== undefined)
      monthlyMap[month][inv.inv_type] += parseFloat(inv.amount)
  })
  let cumulative = 0
  const monthlyChartData = Object.values(monthlyMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(d => {
      cumulative += invTypes.reduce((s, t) => s + (d[t.key] || 0), 0)
      return {
        ...d,
        cumulative,
        label: new Date(d.month + '-01').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
      }
    })

  return (
    <div className="px-4 pt-4 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-900">Investments</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowManager(true)} className="text-gray-400 active:text-gray-600 p-1">
            <Settings2 size={16} />
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-sm font-medium text-teal-700 active:opacity-70">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {monthlyChartData.length > 0 && (
        <div className="bg-white rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Monthly Contributions</p>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={monthlyChartData} barSize={14}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: dark ? '#9a9489' : '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" hide />
              <YAxis yAxisId="right" orientation="right" hide />
              <Tooltip
                formatter={(v, name) => {
                  if (name === 'cumulative') return [fmt(v), 'Cumulative']
                  return [fmt(v), invTypes.find(t => t.key === name)?.label || name]
                }}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', backgroundColor: dark ? '#242019' : '#fff', color: dark ? '#f0ece4' : '#374151' }}
              />
              {invTypes.map(t => (
                <Bar key={t.key} yAxisId="left" dataKey={t.key} stackId="a" fill={t.color} />
              ))}
              <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#6366f1" strokeWidth={2} dot={false} name="cumulative" />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {invTypes.map(t => (
              <div key={t.key} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: t.color }} />
                <span className="text-[0.65rem] text-gray-500">{t.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 inline-block rounded" style={{ backgroundColor: '#6366f1' }} />
              <span className="text-[0.65rem] text-gray-500">Cumulative</span>
            </div>
          </div>
        </div>
      )}

      {invTypes.map(type => {
        const items = byType[type.key]
        const total = items.reduce((s, i) => s + parseFloat(i.amount), 0)
        const isGold = type.key === 'gold'
        const currentValue = isGold ? parseFloat(latestSnap['gold']?.amount ?? NaN) : NaN
        const hasCurrentValue = isGold && !isNaN(currentValue)
        const gainLoss = hasCurrentValue ? currentValue - total : NaN
        return (
          <div key={type.key} className="bg-white rounded-2xl overflow-hidden">
            {isGold ? (
              <div className="px-4 py-3 border-b border-gray-50">
                <span className="font-semibold text-gray-800 block mb-2">{type.emoji} {type.label}</span>
                <div className="flex gap-4">
                  <div>
                    <p className="text-[0.65rem] text-gray-400 mb-0.5">Paid</p>
                    <p className="text-sm font-semibold text-gray-800">{fmtDec(total)}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] text-gray-400 mb-0.5">Current Value</p>
                    <p className="text-sm font-semibold text-gray-800">{hasCurrentValue ? fmtDec(currentValue) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] text-gray-400 mb-0.5">Gain / Loss</p>
                    <p className={`text-sm font-semibold ${!hasCurrentValue ? 'text-gray-400' : gainLoss >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {hasCurrentValue ? (gainLoss >= 0 ? '+' : '') + fmtDec(gainLoss) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <span className="font-semibold text-gray-800">{type.emoji} {type.label}</span>
                <span className="text-sm font-medium text-teal-700">Total Invested {fmtDec(total)}</span>
              </div>
            )}
            {items.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-300">No purchases yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {items.map(inv => (
                  <div key={inv.id} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800">{fmtDec(parseFloat(inv.amount))}</p>
                      <p className="text-xs text-gray-400">
                        {fmtDate(inv.purchase_date, true)}
                      </p>
                      {inv.url && (
                        <a href={inv.url} target="_blank" rel="noreferrer"
                          className="text-xs text-teal-600 flex items-center gap-1 mt-0.5">
                          Link <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                    <button onClick={async () => {
                      await supabase.from('investment_purchases').delete().eq('id', inv.id)
                      onRefresh()
                    }} className="text-gray-200 active:text-red-400 shrink-0 p-1">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {showForm && <InvestmentForm invTypes={invTypes} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); onRefresh() }} />}
      {showManager && <InvestmentTypeManager invTypes={invTypes} investments={investments} onClose={() => setShowManager(false)} onSaved={() => { setShowManager(false); onRefresh() }} />}
    </div>
  )
}

function InvestmentForm({ invTypes, onClose, onSaved }) {
  const [type, setType] = useState(() => invTypes[0]?.key ?? '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    if (!amount) { setError('Amount is required'); return }
    setSaving(true)
    const { data: hh } = await supabase.from('household_members').select('household_id').single()
    if (!hh) { setError('Household not found'); setSaving(false); return }
    const { error: err } = await supabase.from('investment_purchases').insert({
      household_id: hh.household_id,
      inv_type: type,
      amount: parseFloat(amount),
      purchase_date: date,
      url: url || null,
    })
    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md"
        onClick={e => e.stopPropagation()}>
        <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Log Investment</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500 bg-white"
              style={{ fontSize: 16 }}>
              {invTypes.map(t => <option key={t.key} value={t.key}>{t.emoji} {t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Date</label>
            <DateInput value={date} onChange={setDate}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
              style={{ fontSize: 16 }} />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Amount (SGD)</label>
            <input type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
              style={{ fontSize: 16 }} />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Link (optional)</label>
            <input type="url" placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
              style={{ fontSize: 16 }} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: THEME }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}

function InvestmentTypeManager({ invTypes, investments, onClose, onSaved }) {
  const [showAdd, setShowAdd] = useState(false)
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('📈')
  const [color, setColor] = useState('#6366f1')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const PRESET_COLORS = ['#f59e0b', '#0f766e', '#6366f1', '#10b981', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4']

  async function handleAdd(e) {
    e.preventDefault()
    if (!label.trim()) return
    const key = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    setSaving(true)
    setError('')
    const { data: hh } = await supabase.from('household_members').select('household_id').single()
    const nextOrder = invTypes.length > 0 ? Math.max(...invTypes.map(t => t.sort_order)) + 1 : 1
    const { error: err } = await supabase.from('investment_types').insert({
      household_id: hh.household_id,
      key,
      label: label.trim(),
      emoji,
      color,
      sort_order: nextOrder,
    })
    if (err) { setError(err.message); setSaving(false); return }
    setSaving(false)
    onSaved()
  }

  async function handleDelete(type) {
    await supabase.from('investment_types').delete().eq('id', type.id)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-gray-900">Investment Types</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="divide-y divide-gray-50">
            {invTypes.map(type => {
              const hasPurchases = investments.some(i => i.inv_type === type.key)
              return (
                <div key={type.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
                    <span className="text-sm text-gray-800">{type.emoji} {type.label}</span>
                  </div>
                  <button
                    onClick={() => !hasPurchases && handleDelete(type)}
                    disabled={hasPurchases}
                    className={`text-xs px-2.5 py-1 rounded-lg ${hasPurchases ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 active:text-red-600'}`}
                    title={hasPurchases ? 'Has purchases — cannot delete' : 'Delete'}>
                    {hasPurchases ? 'Has purchases' : 'Delete'}
                  </button>
                </div>
              )
            })}
          </div>

          {!showAdd ? (
            <button onClick={() => setShowAdd(true)}
              className="w-full px-5 py-3 text-sm font-medium text-teal-700 text-left flex items-center gap-1.5 active:opacity-70">
              <Plus size={14} /> Add type
            </button>
          ) : (
            <form onSubmit={handleAdd} className="px-5 py-4 space-y-3 border-t border-gray-50">
              <div className="flex gap-2">
                <div className="w-16 shrink-0">
                  <label className="text-xs text-gray-500 font-medium">Emoji</label>
                  <input value={emoji} onChange={e => setEmoji(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-2 py-2 mt-1 outline-none focus:border-teal-500 text-center"
                    style={{ fontSize: 20 }} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-medium">Label</label>
                  <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. REITs"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
                    style={{ fontSize: 16 }} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1.5">Colour</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-300' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowAdd(false); setError('') }}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-gray-500 bg-gray-100 active:opacity-70">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !label.trim()}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: THEME }}>
                  {saving ? 'Saving…' : 'Add'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Home Improvement ──────────────────────────────────────────────────────────

const STATUS_COLORS = {
  'Pending Decision': 'bg-yellow-50 text-yellow-700',
  'Approved':         'bg-green-50 text-green-700',
  'Rejected':         'bg-red-50 text-red-600',
  'Mothballed':       'bg-gray-100 text-gray-500',
  'Implemented':      'bg-[#FBF6EE] text-teal-700',
  'Blocked':          'bg-orange-50 text-orange-700',
}

const QUADRANTS = [
  { urgency: 'Urgent',     importance: 'Important',     label: 'Do First',    color: 'text-red-600' },
  { urgency: 'Not Urgent', importance: 'Important',     label: 'Keep in mind',color: 'text-blue-600' },
  { urgency: 'Urgent',     importance: 'Not Important', label: 'Do Later',    color: 'text-orange-500' },
  { urgency: 'Not Urgent', importance: 'Not Important', label: 'Delay',       color: 'text-gray-400' },
]

function HomeImprovement({ items, onRefresh, device }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  return (
    <div className="px-4 pt-4 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-900">Home Improvement</h2>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-sm font-medium text-teal-700 active:opacity-70">
          <Plus size={16} /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">No items yet — tap Add to get started.</p>
      ) : null}

      {QUADRANTS.map(q => {
        const qItems = items.filter(i => i.urgency === q.urgency && i.importance === q.importance)
        if (qItems.length === 0) return null
        return (
          <div key={`${q.urgency}-${q.importance}`} className="bg-white rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wide ${q.color}`}>{q.label}</span>
              <span className="text-xs text-gray-300">{q.urgency} · {q.importance}</span>
              <span className="ml-auto text-xs text-gray-300">{qItems.length}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {qItems.map(item => (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-500'}`}>
                            {item.status}
                          </span>
                        </div>
                        {item.description && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.description}</p>}
                        <div className="flex flex-wrap gap-x-2 mt-1.5 text-[0.65rem] text-gray-400">
                          {item.proposer && <span>Proposed by {item.proposer}</span>}
                          {item.approver && <span>· Approver: {item.approver}</span>}
                          {item.funded_by && <span>· {item.funded_by}</span>}
                          {item.estimated_budget && <span>· Est. {fmt(item.estimated_budget)}</span>}
                        </div>
                        {item.remarks && <p className="text-[0.65rem] text-gray-300 mt-1 italic">{item.remarks}</p>}
                      </div>
                      <button onClick={() => setEditing(item)} className="text-gray-300 active:text-gray-500 shrink-0 p-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )
      })}

      {(showForm || editing) && (
        <HomeItemForm
          initial={editing}
          device={device}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { setShowForm(false); setEditing(null); onRefresh() }}
          onDeleted={() => { setEditing(null); onRefresh() }}
        />
      )}
    </div>
  )
}

function HomeItemForm({ initial, device, onClose, onSaved, onDeleted }) {
  const defaultProposer = device === 'Mia' ? 'Mingyue' : device === 'Sebastian' ? 'Sebastian' : ''
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [proposer, setProposer] = useState(initial?.proposer ?? defaultProposer)
  const [approver, setApprover] = useState(initial?.approver ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'Pending Decision')
  const [urgency, setUrgency] = useState(initial?.urgency ?? 'Urgent')
  const [importance, setImportance] = useState(initial?.importance ?? 'Important')
  const [fundedBy, setFundedBy] = useState(initial?.funded_by ?? 'Joint Account')
  const [budget, setBudget] = useState(initial?.estimated_budget ?? '')
  const [remarks, setRemarks] = useState(initial?.remarks ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    const { data: hh } = await supabase.from('household_members').select('household_id').single()
    if (!hh) { setError('Household not found'); setSaving(false); return }
    const payload = {
      household_id: hh.household_id,
      title: title.trim(),
      description: description.trim() || null,
      proposer: proposer || null,
      approver: approver || null,
      status, urgency, importance,
      funded_by: fundedBy || null,
      estimated_budget: budget ? parseFloat(budget) : null,
      remarks: remarks.trim() || null,
    }
    const { error: err } = initial
      ? await supabase.from('home_improvement_items').update(payload).eq('id', initial.id)
      : await supabase.from('home_improvement_items').insert(payload)
    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  async function handleDelete() {
    if (!confirm('Delete this item?')) return
    await supabase.from('home_improvement_items').delete().eq('id', initial.id)
    onDeleted()
  }

  function Sel({ label, value, onChange, options }) {
    return (
      <div>
        <label className="text-xs text-gray-500 font-medium">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500 bg-white"
          style={{ fontSize: 16 }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{initial ? 'Edit Item' : 'Add Item'}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Air Purifier"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
              style={{ fontSize: 16 }} />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500 resize-none"
              style={{ fontSize: 16 }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Sel label="Proposer" value={proposer} onChange={setProposer} options={['Sebastian', 'Mingyue']} />
            <Sel label="Approver" value={approver} onChange={setApprover} options={['Sebastian', 'Mingyue']} />
          </div>
          <Sel label="Status" value={status} onChange={setStatus}
            options={['Pending Decision', 'Approved', 'Rejected', 'Mothballed', 'Implemented', 'Blocked']} />
          <div className="grid grid-cols-2 gap-3">
            <Sel label="Urgency" value={urgency} onChange={setUrgency} options={['Urgent', 'Not Urgent']} />
            <Sel label="Importance" value={importance} onChange={setImportance} options={['Important', 'Not Important']} />
          </div>
          <Sel label="Funded By" value={fundedBy} onChange={setFundedBy}
            options={['Joint Account', 'Self', 'Sebastian', 'Mingyue']} />
          <div>
            <label className="text-xs text-gray-500 font-medium">Estimated Budget (SGD)</label>
            <input type="number" step="1" placeholder="Optional" value={budget} onChange={e => setBudget(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
              style={{ fontSize: 16 }} />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Remarks</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500 resize-none"
              style={{ fontSize: 16 }} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: THEME }}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Item'}
          </button>
          {initial && (
            <button type="button" onClick={handleDelete}
              className="w-full py-3 rounded-xl font-semibold text-red-500 border border-red-100 active:bg-red-50">
              Delete
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
