# Tianwen App — CLAUDE.md

## Project Overview

**Tianwen App** is a restaurant POS (Point of Sale) management system, built as a PWA (Progressive Web App) deployed on GitHub Pages. The UI language is Traditional Chinese (zh-TW).

---

### 技術堆疊

| 類別         | V1（現有）               | V2（目標）                                                             |
| ------------ | ------------------------ | ---------------------------------------------------------------------- |
| 框架         | React 18                 | React 19                                                               |
| 路由         | React Router v7          | TanStack Router                                                        |
| UI 元件庫    | Ant Design v5            | shadcn/ui + Radix UI (primitives) + Magic UI                           |
| UI 主題      | （無）                   | Moss Theme (https://tweakcn.com/themes/cmmi1gb4a000204jl8c300w9a)      |
| CSS          | Emotion CSS-in-JS        | Tailwind CSS v4 + @tailwindcss/vite                                    |
| CSS 工具     | （無）                   | clsx + tailwind-merge (cn utility) + class-variance-authority          |
| 狀態管理     | （無明確方案）           | Zustand + TanStack Query                                               |
| 表單         | antd Form                | React Hook Form + Zod                                                  |
| 動畫         | （無）                   | tw-animate-css + CSS keyframes（取代 Framer Motion，減少 bundle size） |
| 圖示         | （無統一方案）           | lucide-react                                                           |
| 通知         | （無）                   | Sonner（取代原定 Magic UI Animated List）                              |
| 錯誤邊界     | （無）                   | react-error-boundary                                                   |
| 客戶端 DB    | Dexie v4（IndexedDB）    | @sqlite.org/sqlite-wasm + OPFS (opfs-sahpool VFS)                      |
| 備份         | （無）                   | @supabase/supabase-js → Supabase Storage（手動上傳）                   |
| ID 生成      | （無）                   | nanoid                                                                 |
| 多語系       | （無）                   | react-i18next                                                          |
| 圖表         | Chart.js                 | Recharts                                                               |
| Lint         | ESLint                   | Oxlint                                                                 |
| 格式化       | Prettier                 | Oxfmt                                                                  |
| 測試         | Vitest + Testing Library | Vitest + Testing Library + Playwright                                  |
| 部署         | GitHub Pages             | Vercel                                                                 |
| 建置         | Vite 7                   | Vite 8 + @vitejs/plugin-react-swc                                      |
| Repo         | 同 repo，新 branch       | 同 repo，新 branch                                                     |
| Jira         | V1 Project               | V2 Project                                                             |
| 版本發布     | （無）                   | release-please                                                         |
| Import Alias | src/                     | @/ → ./src/                                                            |

---

## Git Hooks

`pre-commit` runs automatically:

1. `pnpm run updateManifest` — update manifest version
2. `git add public/manifest.json` — stage the updated manifest

---

## Important Notes

- Use `nvm use v24` before running any Node.js commands
- Package manager is **pnpm** — always use `pnpm` instead of `npm`
- Device support: iPad 10 (2022) and iPad 11 (2025) or later — CSS and interactions must work on these devices
- Code comments: all inline comments and JSDoc must be written in **English**
- Git branching: never commit directly to main branches (master/main) — all changes must go through feature branch + PR workflow
- Do not use bold or font-semibold text
- Please must follow Tailwind CSS v4's rule
- Modal UI一律使用src/components/modal/modal.tsx
- UI設計時，先以shadcn/UI為參考有沒有可用的UI，再重新設計
- 所有按鈕一律使用RippleButton
- 禁用sm型態或以下的小字型
- Even in **--dangerously-skip-permissions** mode, never delete any files or git branches without user confirmation

---

## Jira Integration

See `.claude/docs/jira-workflow.md` for the Jira integration workflow. Read it before running epic-plan or any Jira-related operations.

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

## git commit format

All AI-generated git commits must include the following footer:

Generated with Claude Code
Co-Authored-By: Claude noreply@anthropic.com
