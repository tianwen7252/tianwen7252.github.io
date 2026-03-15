# Plan: StaffAdmin & ClockIn UI Improvements + AuthGuard Sub Verification

## Context

StaffAdmin and ClockIn UIs are minimal and lack status feedback, proper touch sizing for iPad, and edit capabilities. AuthGuard currently uses Google OAuth2 access tokens (no `sub`) — switching to Google ID Token (Sign In with Google) enables whitelist-based admin authorization via the `sub` claim.

---

## 1. AppContext — Add `adminInfo`

**Files:** `src/pages/App/context.tsx`, `src/pages/App/App.tsx`

### context.tsx
Add to `AppContextValue`:
```ts
adminInfo: { sub: string; name: string; email: string } | null
setAdminInfo: (info: { sub: string; name: string; email: string } | null) => void
```
Add defaults in `DefaultContextData` (`adminInfo: null`, `setAdminInfo: () => {}`).

### App.tsx
Mirror the existing `gAPIToken` pattern exactly — add `useState<{...} | null>` with `localStorage` persistence under key `'admin-info'` (JSON stringify/parse). Serialize with `JSON.stringify` on set, `JSON.parse` on init. Add `adminInfo` and `setAdminInfo` to `contextValue` useMemo deps.

---

## 2. AuthGuard — Dual Variant (ID Token + OAuth2)

**Files:** `src/components/AuthGuard/AuthGuard.tsx`, `src/components/AuthGuard/__tests__/AuthGuard.test.tsx`

### Props
```ts
interface AuthGuardProps {
  children: React.ReactNode
  variant?: 'backup' | 'staffAdmin'  // default: 'backup'
}
```

### `variant='backup'` (default — no behavior change)
Existing logic: checks `gAPIToken`, shows OAuth2 login button if null.

### `variant='staffAdmin'` — New ID Token Flow

**JWT decode helper** (inline, no library):
```ts
function decodeJwtPayload(token: string) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
  return JSON.parse(atob(padded))
}
```

**Whitelist constant** (fill in subs when user provides them):
```ts
const ADMIN_SUBS: string[] = []
```

**Login flow:**
1. Button click → `window.google?.accounts?.id.initialize({ client_id: gAPIID + '.apps.googleusercontent.com', callback: handleCredential })` then `.prompt()`
2. `handleCredential(response)`: decode `response.credential` → extract `{ sub, name, email }`
3. If `ADMIN_SUBS.includes(sub)`: call `setAdminInfo({ sub, name, email })` + success notification
4. If not in list: error notification "此帳號無管理員權限"

**Authenticated state for staffAdmin variant** — show a header bar above children:
```
[name / email text]  [登出 Button]
```
Logout: call `window.google?.accounts?.id.revoke(adminInfo.sub, () => {})` then `setAdminInfo(null)`.

**Unauthenticated state for staffAdmin:** Result with `status="403"` title="權限不足", subTitle, Google Sign-In button.

### Tests
- Keep existing 2 tests (backup variant behavior unchanged, just add `variant` prop where missing)
- Add: `variant='staffAdmin'` shows children when `adminInfo` is set in context
- Add: `variant='staffAdmin'` shows 403 when `adminInfo` is null

---

## 3. ClockIn — Status + Larger Cards + Times + Popconfirm

**Files:** `src/components/Settings/Staff/ClockIn.tsx`, `src/components/Settings/Staff/__tests__/ClockIn.test.tsx`

**New file:** `src/components/Settings/Staff/styles/index.tsx`

### Reactive attendance data
Add a second `useLiveQuery` for today's attendances (alongside existing employees query):
```ts
const today = useMemo(() => dayjs().format('YYYY-MM-DD'), [])
const todayAttendances = useLiveQuery(() => API.attendances.getByDate(today), [today]) || []
const attendanceMap = useMemo(() =>
  todayAttendances.reduce((map, r) => ({ ...map, [r.employeeId]: r }), {} as Record<number, RestaDB.Table.Attendance>)
, [todayAttendances])
```

### Card layout (160px wide)
Each card derives status from `attendanceMap[employee.id]`:
- No record → "未打卡", Badge status `default`
- Has `clockIn`, no `clockOut` → "已上班", Badge status `processing`
- Has both → "已下班", Badge status `success`

Display times below name:
```
上班：09:30  下班：18:00  (or --:-- if not yet)
```

### Popconfirm
Wrap each card with `<Popconfirm>`:
- `disabled` when already fully clocked out (show `message.warning` via `onClick` on Card instead)
- `title` contextual: "確定 [name] 上班打卡？" or "確定 [name] 下班打卡？"
- `onConfirm` calls `handleClockInOrOut`

Remove the internal `getByDate` call from `handleClockInOrOut` — use `attendanceMap` directly since it's already reactive.

### Avatar rendering helper
```ts
function renderAvatar(avatar?: string) {
  if (!avatar) return <UserOutlined />
  if (avatar.startsWith('http')) return <img src={avatar} alt="avatar" style={{ width: '100%' }} />
  return <span style={{ fontSize: 36 }}>{avatar}</span>  // emoji
}
```

### Tests
The `useLiveQuery` mock already uses `callback.toString().includes('employees')` to branch. Extend it:
```ts
if (callback.toString().includes('employees')) return [...]
if (callback.toString().includes('attendances')) return []  // default: no attendance
return []
```
Existing clock-in/clock-out test logic remains valid — `handleClockInOrOut` now reads from `attendanceMap` instead of calling `getByDate`, so remove `attendances.getByDate` mock expectations from those tests. Add Popconfirm interaction: use `fireEvent.click` on the card to open Popconfirm, then find and click the "確定" button.

---

## 4. StaffAdmin — Table + Edit + Emoji Avatar + Attendance Summary

**Files:** `src/components/Settings/StaffAdmin/StaffAdmin.tsx`, `src/components/Settings/StaffAdmin/__tests__/StaffAdmin.test.tsx`

**New file:** `src/components/Settings/StaffAdmin/styles/index.tsx`

### Layout: antd `Table` (replacing `Space` + `Card` grid)

Columns:
| Column | Key | Render |
|---|---|---|
| 頭像 | `avatar` | `renderAvatar(employee.avatar)` — same helper as ClockIn (extract to shared util or duplicate) |
| 姓名 | `name` | plain text |
| 今日狀態 | computed | `<Tag>` from `attendanceMap` — "未打卡" / "已上班 HH:mm" / "已下班 HH:mm–HH:mm" |
| 操作 | — | Edit `<Button>` + Delete `<Popconfirm>` |

Today's attendance reactive query: same pattern as ClockIn (copy `useLiveQuery` + `attendanceMap`).

### Edit modal (unified add/edit)
State: `editingEmployee: RestaDB.Table.Employee | null`
- "新增員工" button → sets `editingEmployee` to `null`, opens modal
- Edit button → sets `editingEmployee` to that employee, opens modal (pre-fills form)
- Modal title: `editingEmployee ? '編輯員工' : '新增員工'`
- `handleSaveEmployee`:
  - if `editingEmployee`: `API.employees.set(editingEmployee.id!, { name, avatar })`
  - else: `API.employees.add({ name, avatar, status: 'active' })`

Use `useEffect` to populate form when `editingEmployee` changes:
```ts
useEffect(() => {
  if (isModalOpen) form.setFieldsValue(editingEmployee ?? { name: '', avatar: '' })
}, [isModalOpen, editingEmployee, form])
```

### Emoji avatar picker
Predefined constant (20 emojis):
```ts
const AVATAR_EMOJIS = ['😀','😊','🙂','😎','🤩','👩','👨','👧','👦','🧑','👩‍🍳','👨‍🍳','🧑‍💼','👩‍💼','👨‍💼','🐱','🐶','🦊','🐼','🐨']
```
Use `Form.useWatch('avatar', form)` to track selection for border highlight. Render as a 5-column CSS grid inside `Form.Item name="avatar"`. Clicking an emoji calls `form.setFieldValue('avatar', emoji)`.

### AuthGuard variant
Change `<AuthGuard>` to `<AuthGuard variant="staffAdmin">`.

### Tests
Update mock context: `gAPIToken: 'fake-token'` → `adminInfo: { sub: 'test-sub', name: 'Admin', email: 'admin@test.com' }`. Add tests for edit flow and emoji selection.

---

## 5. File Summary

### Modified
| File | Change |
|---|---|
| `src/pages/App/context.tsx` | Add `adminInfo` / `setAdminInfo` to interface and defaults |
| `src/pages/App/App.tsx` | Add `adminInfo` state + localStorage persistence + contextValue |
| `src/components/AuthGuard/AuthGuard.tsx` | Add `variant` prop; implement ID token + sub whitelist for `staffAdmin` |
| `src/components/AuthGuard/__tests__/AuthGuard.test.tsx` | Add `staffAdmin` variant tests |
| `src/components/Settings/Staff/ClockIn.tsx` | Reactive attendance, badge status, times, Popconfirm, larger cards |
| `src/components/Settings/Staff/__tests__/ClockIn.test.tsx` | Extend `useLiveQuery` mock; update for Popconfirm interaction |
| `src/components/Settings/StaffAdmin/StaffAdmin.tsx` | Table layout, edit modal, emoji picker, attendance column, `variant='staffAdmin'` |
| `src/components/Settings/StaffAdmin/__tests__/StaffAdmin.test.tsx` | Update context mock; add edit + emoji tests |

### Created
| File | Purpose |
|---|---|
| `src/components/Settings/Staff/styles/index.tsx` | Emotion styles for ClockIn cards |
| `src/components/Settings/StaffAdmin/styles/index.tsx` | Emotion styles for Table, emoji grid |

---

## 6. Pending

- **`ADMIN_SUBS` whitelist**: User will provide the sub values — add them to the constant in `AuthGuard.tsx` when received.
- **Note**: `google.accounts.id` is part of the Google Identity Services (GIS) script. Verify `index.html` loads `https://accounts.google.com/gsi/client`. The existing `window.google?.accounts?.oauth2` also comes from this script, so it should already be present.

---

## Verification

1. `npm run start` → navigate to Settings → 員工打卡
   - Confirm card size is larger, status badges show correctly
   - Clock in an employee, verify "已上班 HH:mm" appears immediately (reactive)
   - Confirm Popconfirm dialog appears before committing
2. Settings → 員工管理
   - Confirm 403 shown before login
   - Login with Google (once sub list is added, verify admin/non-admin cases)
   - Confirm Table renders with avatar, name, status columns
   - Test add employee with emoji avatar
   - Test edit employee name and avatar
   - Test delete with Popconfirm
3. Settings → 雲端備份
   - Confirm existing OAuth2 flow still works (no regression)
4. `npm run test` — all tests pass
5. `npm run lint` — no warnings
