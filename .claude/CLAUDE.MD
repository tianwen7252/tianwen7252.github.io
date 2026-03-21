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

## 元件樣式規範

- 使用 **Emotion CSS-in-JS**，每個有樣式的元件在 `styles/index.tsx` 定義
- 在元件中以 `css={styles.xxxCss}` 注入（Emotion prop）
- 全域 Ant Design token 覆寫在 `src/styles/global.ts`（`antStyles`、`btnStyles`）
- Import alias：`src` → `./src`（在 `vite.config.ts` 與 `vitest.config.ts` 皆已設定）

---

## Git Hooks

`pre-commit` 會自動執行：

1. `pnpm run updateManifest` — 更新 manifest 版本
2. `git add public/manifest.json` — 將更新後的 manifest 加入暫存

---

## 重要注意事項

- 這是純前端 PWA，**所有資料儲存在瀏覽器 IndexedDB**，無後端伺服器
- 所有資料庫操作請透過 `src/libs/api.ts` 存取，不要直接操作 `db`
- 員工管理（StaffAdmin）頁面受 `AuthGuard` 保護
- 資料庫 schema 版本升級需在 `src/libs/dataCenter.ts` 中修改 `DB_VERSION` 並提供 migration
- 商品名稱拼字沿用 `commondity`（非 `commodity`），為歷史遺留，保持一致性
- 統計圖表資料來自 `orders` + `dailyData` 雙表，透過 `src/pages/Statistics/charts/` 各模組處理
- Vite build 使用手動 chunk 分割：`react`、`lodash`、`antd`、`chartjs`、`mathjs`
- 使用nvm use v24當準備進行執行nodejs
- 套件管理器使用 **pnpm**，所有安裝與執行指令請使用 `pnpm` 而非 `npm`
- 裝置支援：App 支援 iPad 10（2022）及 iPad 11（2025）以後的版本，CSS 與互動設計需確保在這些裝置上正常運作
- 程式碼注解：所有程式碼注解（inline comment、JSDoc）一律使用**英文**撰寫
- 專案管理: 在這個project所建立的專案計畫都要複製專案內容到./claude/plans裡。
- Git 分支規範：禁止直接 commit 到主要分支（master/main），所有變更必須透過 feature branch + PR 流程進行
- 即使在 **--dangerously-skip-permissions** 的模式下，絕對不能刪除任何檔案或git branch，在刪除前一定要經過使用者同意才行
- 每次開發以develop branch為主，開發前先從master做rebase

---

## Jira 整合

Jira 整合流程詳見 `.claude/docs/jira-workflow.md`，執行 epic-plan 或 Jira 相關操作時請先讀取該檔案。

---

## Compact Instructions

When compacting, always preserve:

- Current file paths being edited and their modification status
- Test failure messages and error traces
- Architecture decisions made this session
- All TODO items and their completion status

Your context window will be automatically compacted as it approaches its limit,
allowing you to continue working indefinitely from where you left off.
Therefore, do not stop tasks early due to token budget concerns.
