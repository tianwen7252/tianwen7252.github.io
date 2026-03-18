# Tianwen App — CLAUDE.md

## 專案概述

**天文 (Tianwen) App** 是一個餐廳 POS（銷售點）管理系統，以 PWA（漸進式網頁應用程式）形式運作，部署於 GitHub Pages。介面語言為繁體中文。

---

## 技術堆疊

| 類別       | 工具                                        |
| ---------- | ------------------------------------------- |
| 前端框架   | React 18 + TypeScript                       |
| 建置工具   | Vite 7 (`@vitejs/plugin-react-swc`)         |
| UI 元件庫  | Ant Design v5 (antd)                        |
| CSS-in-JS  | Emotion (`@emotion/react`, `@emotion/css`)  |
| 路由       | React Router v7                             |
| 資料庫     | Dexie v4（IndexedDB，瀏覽器本地端）         |
| 圖表       | Chart.js + react-chartjs-2                  |
| 日期處理   | dayjs                                       |
| 工具函式庫 | lodash-es、mathjs                           |
| 測試       | Vitest + @testing-library/react + happy-dom |
| 套件管理   | pnpm 10                                     |
| Linting    | ESLint + Prettier                           |
| Git Hooks  | Husky（pre-commit）                         |
| NodeJS     | v24 (nvm use v24)                           |

---

## 常用指令

```bash
pnpm run start        # 開發伺服器（port 4150）
pnpm run build        # TypeScript 型別檢查 → 更新 manifest → Vite 打包
pnpm run test         # 執行 Vitest 測試
pnpm run test:ui      # Vitest UI 介面
pnpm run coverage     # 產生測試覆蓋率報告
pnpm run lint         # ESLint 檢查（max-warnings 0）
pnpm run tidyCommondities  # 整理商品資料腳本
pnpm run updateManifest    # 更新 public/manifest.json
```

---

## 專案結構

```
src/
├── components/
│   ├── AppHeader/          # 頂部導覽列
│   ├── AuthGuard/          # 認證守衛（員工管理等受保護頁面）
│   ├── Chart/              # 圖表元件
│   ├── Keyboard/           # 數字鍵盤（點餐用）
│   ├── Order/              # 單筆訂單元件
│   ├── StickyHeader/       # 黏性標頭
│   └── Settings/
│       ├── Backup/         # 雲端備份（Google API）
│       ├── Info/           # 系統資訊
│       ├── Products/       # 商品設定
│       ├── Staff/          # 員工打卡（ClockIn、Staff、EditRecordModal）
│       └── StaffAdmin/     # 員工管理（需 AuthGuard）
├── constants/
│   └── defaults/           # 預設商品、訂單類型、班別等常數
├── hooks/                  # 自訂 React Hooks
├── libs/
│   ├── api.ts              # 所有 Dexie 資料庫操作的封裝 API
│   ├── dataCenter.ts       # Dexie 實例與 DB schema（TianwenDB v8）
│   ├── appEvent.ts         # 應用程式事件系統
│   ├── arithmetic.ts       # 數學計算工具
│   ├── chart.ts            # 圖表資料處理
│   ├── common.ts           # 共用工具函式
│   └── dayjs.ts            # dayjs 設定
├── pages/
│   ├── App/                # 根 App + AppContext（全域 context）
│   ├── Home/               # 主頁面（含 Outlet）
│   ├── OrderPage/          # 點餐頁面
│   ├── OrderList/          # 訂單列表
│   ├── Statistics/         # 統計圖表（收入、客數、訂單類型等）
│   ├── Settings/           # 系統設定（含 StorageContext）
│   └── Root/               # React Router 路由設定
├── scripts/
│   ├── generator.ts        # 測試資料產生器
│   ├── manifest.ts         # PWA manifest 更新腳本
│   └── tidy.ts             # 商品資料整理腳本
├── styles/
│   ├── global.ts           # 全域 Emotion CSS（含 PWA standalone 樣式）
│   ├── variables.ts        # CSS 變數、Ant Design token
│   └── index.ts
└── test/
    └── setup.ts            # Vitest 測試設定
```

---

## 資料庫 Schema（IndexedDB via Dexie）

資料庫名稱：`TianwenDB`，目前版本：`v8`

| Table            | 說明                               |
| ---------------- | ---------------------------------- |
| `orders`         | 訂單記錄（含商品明細、合計、備註） |
| `dailyData`      | 每日彙總資料（日期、總金額）       |
| `commondityType` | 商品分類                           |
| `commondity`     | 商品列表（含上架狀態）             |
| `orderTypes`     | 訂單類型（內用、外帶等）           |
| `employees`      | 員工資料                           |
| `attendances`    | 出勤打卡記錄（上下班）             |

所有資料庫操作請透過 `src/libs/api.ts` 存取，**不要直接操作 `db`**。

---

## 路由結構

```
/           → OrderPage（點餐）
/order      → OrderPage（同上）
/order-list → OrderList（訂單列表，lazy load）
/statistics → Statistics（統計，lazy load）
/settings   → Settings（設定，lazy load）
/login      → 登入（待開發）
```

---

## 元件樣式規範

- 使用 **Emotion CSS-in-JS**，每個有樣式的元件在 `styles/index.tsx` 定義
- 在元件中以 `css={styles.xxxCss}` 注入（Emotion prop）
- 全域 Ant Design token 覆寫在 `src/styles/global.ts`（`antStyles`、`btnStyles`）
- Import alias：`src` → `./src`（在 `vite.config.ts` 與 `vitest.config.ts` 皆已設定）

---

## 測試規範

- 測試檔案以 `*.test.tsx` 命名，放在對應元件的 `__tests__/` 目錄
- 使用 `happy-dom` 作為測試環境
- 測試 timeout：20 秒
- 執行範圍：所有 `**/*.test.tsx`（排除 `node_modules`）

---

## Git Hooks

`pre-commit` 會自動執行：

1. `pnpm run updateManifest` — 更新 manifest 版本
2. `git add public/manifest.json` — 將更新後的 manifest 加入暫存

---

## 重要注意事項

- 這是純前端 PWA，**所有資料儲存在瀏覽器 IndexedDB**，無後端伺服器
- 員工管理（StaffAdmin）頁面受 `AuthGuard` 保護
- 資料庫 schema 版本升級需在 `src/libs/dataCenter.ts` 中修改 `DB_VERSION` 並提供 migration
- 商品名稱拼字沿用 `commondity`（非 `commodity`），為歷史遺留，保持一致性
- 統計圖表資料來自 `orders` + `dailyData` 雙表，透過 `src/pages/Statistics/charts/` 各模組處理
- Vite build 使用手動 chunk 分割：`react`、`lodash`、`antd`、`chartjs`、`mathjs`
- 使用nvm use v24當準備進行執行nodejs
- 套件管理器使用 **pnpm**，所有安裝與執行指令請使用 `pnpm` 而非 `npm`
- **裝置支援**：App 支援 iPad 10（2022）及 iPad 11（2025）以後的版本，CSS 與互動設計需確保在這些裝置上正常運作
- **程式碼注解**：所有程式碼注解（inline comment、JSDoc）一律使用**英文**撰寫
- **專案管理**: 在這個project所建立的專案計畫都要複製專案內容到./claude/plans裡。

---

## Jira 整合

**Jira Project:** [DEV](https://tianwen7252.atlassian.net/jira/software/projects/DEV/boards)

Priority, type, 標籤類的保持英文，其餘生成的內容都是繁體中文(台灣地區)

### 票據階層

```
Epic (plan title)
  ├── Story: Scope A  [component:auth]        ← planner 建立
  │     ├── Subtask: [TDD] Story A            ← tdd-guide 建立
  │     ├── Bug: [Critical] issue             ← code-reviewer CRITICAL
  │     └── Subtask: [High] issue             ← code-reviewer HIGH
  ├── Story: Scope B  [component:order]
  │     └── Subtask: [TDD] Story B
  └── Task: [Security] finding  [security:critical]  ← security-reviewer 建立
```

### Jira Status 流程

```
To Do → In Progress → Done (git push)
              │
              └──→ Verified (E2E 通過)
Done/Verified → REOPENED (CRITICAL bug)
```

| Status      | 類別    | 說明                           |
| ----------- | ------- | ------------------------------ |
| To Do       | new     | 建立時預設                     |
| In Progress | active  | 開始工作時                     |
| Done        | done    | git push 時自動轉換            |
| Verified    | done    | E2E 測試全部通過時             |
| REOPENED    | new     | code-reviewer 發現 CRITICAL 時 |
| DELETE      | —       | 僅手動使用                     |

### 自動化流程

| 事件                   | Jira 動作                                                                       |
| ---------------------- | ------------------------------------------------------------------------------- |
| planner 完成           | 建立 **Epic** + N 個 **Stories**，Epic/首個 Story → In Progress                 |
| `[STORY: DEV-X]` marker | 該 Story → In Progress                                                        |
| tdd-guide 完成         | 在 active Story 下建 **Subtask** `[TDD] ...` → Done                             |
| code-reviewer 完成     | CRITICAL → **Bug** + Story → REOPENED；HIGH → **Subtask**；MEDIUM/LOW → Comment |
| security-reviewer 完成 | 在 Epic 下建獨立 **Task** `[Security] ...`，加 `security:critical/medium` label |
| `git commit`           | 在 active Story 加 commit SHA comment                                           |
| `git push`             | active Story → Done；若所有子票完成 → Epic → Done                               |
| E2E 全部通過           | active Story → Verified；若所有子票完成 → Epic → Verified                       |

### Session 狀態（`.jira-session.json`）

```json
{
  "epicKey": "DEV-10",
  "epicSummary": "Plan title",
  "planFile": ".claude/plans/2026-03-16-feature.md",
  "stories": [
    { "key": "DEV-11", "summary": "Auth scope", "scope": "component:auth" }
  ],
  "activeStoryKey": "DEV-11"
}
```

手動切換 active story：`node ~/.claude/scripts/jira-utils.js session-set-active DEV-12`

或在 agent prompt 中加 `[STORY: DEV-12]` marker。

### 相關檔案

| 檔案                                 | 用途                                                           |
| ------------------------------------ | -------------------------------------------------------------- |
| `~/.claude/scripts/jira-utils.js`    | Jira REST API helper（所有操作的入口）                         |
| `.claude/hooks/jira-pretask-hook.js` | **PreToolUse** hook：偵測 `[STORY:]` marker，更新 session      |
| `.claude/hooks/jira-task-hook.js`    | **PostToolUse** hook：agent 完成後建立/更新 Jira 票據          |
| `.claude/hooks/jira-bash-hook.js`    | **PostToolUse** hook：git commit/push 觸發 Story/Epic 狀態更新 |
| `~/.claude/agents/jira-sync.md`      | 手動同步 agent                                                 |

### 手動操作

```bash
# 建立 Epic
node ~/.claude/scripts/jira-utils.js create-epic "Plan Title" "Description"

# 建立 Story（掛在 Epic 下）
node ~/.claude/scripts/jira-utils.js create-story "Story title" "AC..." DEV-10 "component:auth"

# 建立 Subtask（掛在 Story 下）
node ~/.claude/scripts/jira-utils.js create-subtask "[TDD] title" "spec..." DEV-11

# 建立安全 Task（掛在 Epic 下）
node ~/.claude/scripts/jira-utils.js create-security-task "[Security] XSS" "desc" DEV-10 "security:critical"

# 轉換狀態
node ~/.claude/scripts/jira-utils.js transition DEV-11 "Done"

# 確認 Epic 所有子票完成
node ~/.claude/scripts/jira-utils.js check-epic-done DEV-10

# 查看目前 session
node ~/.claude/scripts/jira-utils.js session-read
```
