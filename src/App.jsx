import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { LayoutDashboard, Camera, TrendingUp, Hammer, LogOut, X, Plus, ExternalLink, ChevronDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const THEME = '#0f766e'
const APP_DEVICE_KEY = 'finance-pal-device'

const ACCOUNTS = [
  { key: 'sebastian_ac',        label: 'Sebastian — A/C',         owner: 'Sebastian', goal: 15000 },
  { key: 'mingyue_ac',          label: 'Mingyue — A/C',           owner: 'Mingyue',   goal: 160000 },
  { key: 'combined_ac',         label: 'Combined — A/C',          owner: 'Both',      goal: 5000 },
  { key: 'sebastian_cpf',       label: 'Sebastian — CPF',         owner: 'Sebastian', goal: null },
  { key: 'mingyue_cpf',         label: 'Mingyue — CPF',           owner: 'Mingyue',   goal: null },
  { key: 'sebastian_srs',       label: 'Sebastian — SRS',         owner: 'Sebastian', goal: null },
  { key: 'mingyue_srs',         label: 'Mingyue — SRS',           owner: 'Mingyue',   goal: null },
  { key: 'sebastian_insurance', label: 'Sebastian — Insurance',   owner: 'Sebastian', goal: null },
  { key: 'mingyue_td',          label: 'Mingyue — Time Deposit',  owner: 'Mingyue',   goal: null },
  { key: 'mingyue_ibkr',        label: 'Mingyue — IBKR',         owner: 'Mingyue',   goal: 11000 },
  { key: 'sebastian_ibkr',      label: 'Sebastian — IBKR',       owner: 'Sebastian', goal: null },
  { key: 'gold',                label: 'Gold',                    owner: 'Both',      goal: 8000 },
  { key: 'housing_loan',        label: 'Housing Loan',            owner: 'Both',      goal: null, isDebt: true },
]

const ASSET_KEYS = ACCOUNTS.filter(a => !a.isDebt).map(a => a.key)

const fmt = n => n == null ? '—' : '$' + Math.round(n).toLocaleString()
const fmtDec = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ── Auth ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
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
    <div className="min-h-dvh flex items-center justify-center px-6 bg-teal-50">
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
    <div className="min-h-dvh bg-teal-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 w-full max-w-xs text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Who's using this?</h2>
        <p className="text-sm text-gray-400 mb-6">Personalises your view. You can change this anytime.</p>
        {['Mia', 'Sebastian', 'Shared'].map(name => (
          <button key={name} onClick={() => onSelect(name)}
            className="w-full py-3 border-2 border-gray-100 rounded-xl font-semibold text-gray-800 mb-3 last:mb-0 active:bg-gray-50">
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
  const [device, setDevice] = useState(null)
  const [deviceReady, setDeviceReady] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [tab, setTab] = useState('dashboard')

  const [snapshots, setSnapshots] = useState([])
  const [investments, setInvestments] = useState([])
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
    const [{ data: snaps }, { data: invs }, { data: home }] = await Promise.all([
      supabase.from('account_snapshots').select('*').order('snapshot_date', { ascending: true }),
      supabase.from('investment_purchases').select('*').order('purchase_date', { ascending: false }),
      supabase.from('home_improvement_items').select('*').order('created_at', { ascending: true }),
    ])
    setSnapshots(snaps || [])
    setInvestments(invs || [])
    setHomeItems(home || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const channel = supabase.channel('finance-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'account_snapshots' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investment_purchases' }, fetchAll)
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
    { id: 'dashboard',   label: 'Overview',     icon: LayoutDashboard },
    { id: 'snapshots',   label: 'Snapshots',    icon: Camera },
    { id: 'investments', label: 'Investments',  icon: TrendingUp },
    { id: 'home',        label: 'Home',         icon: Hammer },
  ]

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
      <header className="text-white px-5 pb-4 flex items-center justify-between"
        style={{ backgroundColor: THEME, paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <div>
          <h1 className="text-[1.15rem] font-semibold tracking-tight">Finance Pal</h1>
          <button onClick={() => setShowPicker(true)}
            className="text-[0.7rem] text-white/60 flex items-center gap-0.5 active:text-white/90">
            {device} <ChevronDown size={10} />
          </button>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-white/60 active:text-white p-1">
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading…</div>
        ) : tab === 'dashboard' ? (
          <Dashboard latestSnap={latestSnap} />
        ) : tab === 'snapshots' ? (
          <Snapshots snapshots={snapshots} onRefresh={fetchAll} />
        ) : tab === 'investments' ? (
          <Investments investments={investments} onRefresh={fetchAll} />
        ) : (
          <HomeImprovement items={homeItems} onRefresh={fetchAll} device={device} />
        )}
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

function Dashboard({ latestSnap }) {
  const totalAssets = ASSET_KEYS.reduce((sum, key) => {
    const s = latestSnap[key]
    return sum + (s ? parseFloat(s.amount) : 0)
  }, 0)
  const housingLoan = latestSnap['housing_loan'] ? parseFloat(latestSnap['housing_loan'].amount) : 0
  const netWorth = totalAssets - housingLoan

  return (
    <div className="px-4 pt-4 space-y-4">
      <div className="rounded-2xl p-5 text-white" style={{ backgroundColor: THEME }}>
        <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">Net Worth</p>
        <p className="text-3xl font-bold">{fmt(netWorth)}</p>
        <div className="mt-3 flex gap-4 text-xs text-white/70">
          <span>Assets {fmt(totalAssets)}</span>
          <span>Debt {fmt(housingLoan)}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl divide-y divide-gray-50">
        {ACCOUNTS.map(acc => {
          const snap = latestSnap[acc.key]
          const amount = snap ? parseFloat(snap.amount) : null
          const progress = acc.goal && amount != null ? Math.min(amount / acc.goal, 1) : null
          return (
            <div key={acc.key} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{acc.label}</span>
                <span className={`text-sm font-semibold ${acc.isDebt ? 'text-red-600' : 'text-gray-900'}`}>
                  {fmtDec(amount)}
                </span>
              </div>
              {acc.goal && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${progress != null ? (progress * 100).toFixed(1) : 0}%`, backgroundColor: THEME }} />
                  </div>
                  <span className="text-[0.65rem] text-gray-400 shrink-0">
                    {progress != null ? `${Math.round(progress * 100)}%` : '—'} of {fmt(acc.goal)}
                  </span>
                </div>
              )}
              {snap && (
                <p className="text-[0.65rem] text-gray-300 mt-0.5">
                  as of {new Date(snap.snapshot_date + 'T00:00:00').toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Snapshots ─────────────────────────────────────────────────────────────────

function Snapshots({ snapshots, onRefresh }) {
  const [showForm, setShowForm] = useState(false)

  const snapshotsByKey = {}
  snapshots.forEach(s => {
    if (!snapshotsByKey[s.account_key]) snapshotsByKey[s.account_key] = []
    snapshotsByKey[s.account_key].push(s)
  })

  return (
    <div className="px-4 pt-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-900">Balance Snapshots</h2>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-sm font-medium text-teal-700 active:opacity-70">
          <Plus size={16} /> Add
        </button>
      </div>

      {ACCOUNTS.map(acc => {
        const history = snapshotsByKey[acc.key] || []
        const chartData = history.map(s => ({
          date: s.snapshot_date,
          amount: parseFloat(s.amount),
          label: new Date(s.snapshot_date + 'T00:00:00').toLocaleDateString('en-SG', { day: 'numeric', month: 'short' }),
        }))
        const latest = history[history.length - 1]
        return (
          <div key={acc.key} className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-800">{acc.label}</span>
              <span className="text-sm font-semibold text-gray-900">{latest ? fmtDec(parseFloat(latest.amount)) : '—'}</span>
            </div>
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={chartData}>
                  <Line type="monotone" dataKey="amount" stroke={THEME} strokeWidth={2} dot={false} />
                  <XAxis dataKey="label" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip formatter={v => fmtDec(v)} labelFormatter={l => l} contentStyle={{ fontSize: 12 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-gray-300 mt-1">{chartData.length === 1 ? 'Add more snapshots to see a chart' : 'No data yet'}</p>
            )}
          </div>
        )
      })}

      {showForm && <SnapshotForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); onRefresh() }} />}
    </div>
  )
}

function SnapshotForm({ onClose, onSaved }) {
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
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
              style={{ fontSize: 16 }} />
          </div>
          {ACCOUNTS.map(acc => (
            <div key={acc.key}>
              <label className="text-xs text-gray-500 font-medium">{acc.label}</label>
              <input type="number" step="0.01" placeholder="Leave blank to skip"
                value={amounts[acc.key] ?? ''}
                onChange={e => setAmounts(prev => ({ ...prev, [acc.key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 outline-none focus:border-teal-500"
                style={{ fontSize: 16 }} />
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

// ── Investments ───────────────────────────────────────────────────────────────

const INV_TYPES = [
  { key: 'gold',            label: 'Gold',             emoji: '🪙' },
  { key: 'ibkr_mingyue',   label: 'IBKR — Mingyue',  emoji: '📈' },
  { key: 'ibkr_sebastian', label: 'IBKR — Sebastian', emoji: '📈' },
]

function Investments({ investments, onRefresh }) {
  const [showForm, setShowForm] = useState(false)

  const byType = {}
  INV_TYPES.forEach(t => { byType[t.key] = [] })
  investments.forEach(inv => { if (byType[inv.inv_type]) byType[inv.inv_type].push(inv) })

  return (
    <div className="px-4 pt-4 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-900">Investment Log</h2>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-sm font-medium text-teal-700 active:opacity-70">
          <Plus size={16} /> Add
        </button>
      </div>

      {INV_TYPES.map(type => {
        const items = byType[type.key]
        const total = items.reduce((s, i) => s + parseFloat(i.amount), 0)
        return (
          <div key={type.key} className="bg-white rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <span className="font-semibold text-gray-800">{type.emoji} {type.label}</span>
              <span className="text-sm font-medium text-teal-700">Total {fmtDec(total)}</span>
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-300">No purchases yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {items.map(inv => (
                  <div key={inv.id} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800">{fmtDec(parseFloat(inv.amount))}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(inv.purchase_date + 'T00:00:00').toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {inv.url && (
                        <a href={inv.url} target="_blank" rel="noreferrer"
                          className="text-xs text-teal-600 flex items-center gap-1 mt-0.5">
                          Receipt <ExternalLink size={10} />
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

      {showForm && <InvestmentForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); onRefresh() }} />}
    </div>
  )
}

function InvestmentForm({ onClose, onSaved }) {
  const [type, setType] = useState('gold')
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
              {INV_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
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

// ── Home Improvement ──────────────────────────────────────────────────────────

const STATUS_COLORS = {
  'Pending Decision': 'bg-yellow-50 text-yellow-700',
  'Approved':         'bg-green-50 text-green-700',
  'Rejected':         'bg-red-50 text-red-600',
  'Mothballed':       'bg-gray-100 text-gray-500',
  'Implemented':      'bg-teal-50 text-teal-700',
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

      {QUADRANTS.map(q => {
        const qItems = items.filter(i => i.urgency === q.urgency && i.importance === q.importance)
        return (
          <div key={`${q.urgency}-${q.importance}`} className="bg-white rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wide ${q.color}`}>{q.label}</span>
              <span className="text-xs text-gray-300">{q.urgency} · {q.importance}</span>
              {qItems.length > 0 && <span className="ml-auto text-xs text-gray-300">{qItems.length}</span>}
            </div>
            {qItems.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-300">Nothing here</p>
            ) : (
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
            )}
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
      status,
      urgency,
      importance,
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
