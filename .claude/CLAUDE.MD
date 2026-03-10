# 專案全域設定

## 專案概述

<!-- 替換為你的專案描述 -->

- 專案名稱：tianwen7252.github.io
- 類型：iPad App 網頁應用程式
- 目標用戶：<YOUR_TARGET_USERS>

## 技術棧總覽

- Frontend: React 19 + TypeScript + Tailwind CSS + Emotion CSS + Vite + ESLint + shadcn/ui + Zustand
- Backend: IndexDB + Google Drive
- 部署: Docker + GitHub Actions

## 常用指令

```bash
# 安裝依賴
pnpm install

# 開發模式
pnpm start

# 執行測試
pnpm test

# 型別檢查
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build
```

## 程式碼規範

- 縮排：2 spaces
- 引號：單引號（JS/TS）
- 分號：不加
- 行尾：LF
- Commit 格式：Conventional Commits（`feat:`, `fix:`, `chore:`）

## 專案結構

```
src/
├── components/   # 共用 UI 元件
├── features/     # 功能模組（feature-based 架構）
├── hooks/        # 共用 custom hooks
├── lib/          # 第三方套件設定
├── pages/        # 路由頁面
└── utils/        # 工具函式
```

## 注意事項

- 不直接修改 `/generated/` 目錄下的檔案
- 所有 API 呼叫統一透過 `src/lib/api.ts`
- 環境變數需在 `src/env.ts` 中定義並驗證
- 禁止使用`rm -rf`，如需要刪除檔案請先移至備份，確認無誤後再刪除
