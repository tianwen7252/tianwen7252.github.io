# Tianwen App — CLAUDE.md

## Project Overview

**Tianwen App** is a restaurant POS (Point of Sale) management system, built as a PWA (Progressive Web App) deployed on GitHub Pages. The UI language is Traditional Chinese (zh-TW).

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
- Do not use bold text
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
