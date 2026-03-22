# Tianwen App — CLAUDE.md

## 專案概述

**天文 (Tianwen) App** 是一個餐廳 POS（銷售點）管理系統，以 PWA（漸進式網頁應用程式）形式運作，部署於 GitHub Pages。介面語言為繁體中文。

---

## Git Hooks

`pre-commit` 會自動執行：

1. `pnpm run updateManifest` — 更新 manifest 版本
2. `git add public/manifest.json` — 將更新後的 manifest 加入暫存

---

## 重要注意事項

- 使用nvm use v24當準備進行執行nodejs
- 套件管理器使用 **pnpm**，所有安裝與執行指令請使用 `pnpm` 而非 `npm`
- 裝置支援：App 支援 iPad 10（2022）及 iPad 11（2025）以後的版本，CSS 與互動設計需確保在這些裝置上正常運作
- 程式碼注解：所有程式碼注解（inline comment、JSDoc）一律使用**英文**撰寫
- 專案管理: 在這個project所建立的專案計畫都要複製專案內容到./claude/plans裡。
- Git 分支規範：禁止直接 commit 到主要分支（master/main），所有變更必須透過 feature branch + PR 流程進行
- 即使在 **--dangerously-skip-permissions** 的模式下，絕對不能刪除任何檔案或git branch，在刪除前一定要經過使用者同意才行

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
