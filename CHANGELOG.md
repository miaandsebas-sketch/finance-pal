# Finance Pal — Changelog

## Unreleased
- Add standalone theme toggle (visible only when running outside the hub)
- Add CHANGELOG.md

## 2026-06-06
- Add configurable dashboard clusters — named sums of account balances; create/edit/delete from the dashboard pencil menu
- Fix real-time sync: tables added to Supabase Realtime publication; replica identity set to FULL so UPDATE payloads include all columns
- Add retry logic and error handling on all write operations
- Fix modal dark mode on Android (was responding to system `prefers-color-scheme` instead of app toggle)
- Fix chart tick label and dot stroke colors in dark mode

## 2026-06-05
- Extract shared components: `ModalShell`, tooltip helpers, `DevicePicker`, `useHubSync` hook
- Fix login screen icon (now matches the DollarSign icon used in the app header)
- Fix chart focus ring on Android tap (black border was appearing on recharts SVG)

## 2026-06-04
- Add account details page — full snapshot history per account, edit and delete individual entries, mini trend chart
- Allow any account (asset or debt) to be excluded from net worth and dashboard totals via a toggle
- Add assets/debt breakdown, savings delta, goal lines, and cumulative investment charts
- Show trend percentage below account balance in dashboard account list
- Sync dark/light theme with hub via `postMessage`; notify hub of active tab
- Respect system `prefers-color-scheme` on first launch; keep `theme-color` meta in sync
- Replace date inputs with DD/MM/YYYY text fields to override browser locale formatting
- Fix dark mode background (escaped `#` in CSS class selectors so rules apply correctly)

## 2026-06-03
- Initial Finance Pal PWA — React + Vite + Tailwind v4 + Supabase + Vercel
- Dashboard with KPI cards, net worth history chart, and goal tracking
- Split Snapshots tab into separate Accounts and Debts tabs
- Dynamic accounts — add, edit, and remove via Supabase
- Investments tab with gold cost basis, current value, and gain/loss display
- Configurable investment types stored in Supabase table
- Clarify Accounts/Debts tab action buttons (explicit text labels instead of gear icon)
- Constrain content width to 30 rem (matches Transit Pal)
- Light/dark mode toggle; fix missing dark mode color overrides
- Header redesigned to match Transit Pal / Pantry Pal pattern (cream background, icon, avatar)
- Remove logout button (auth is managed by the hub)
- Vercel Analytics added
