import { css } from '@emotion/css'

// RecordModal glassmorphism styles
// Design: full-screen modal with mesh gradient backgrounds and glass card
// Two gradient themes: ADD (green/sage) and EDIT (blue/purple)

const COLOR_TEXT = '#1a202c'
const COLOR_MUTED = '#718096'
const COLOR_PRIMARY = '#7f956a'
const COLOR_BLUE = '#3b82f6'
const COLOR_RED = '#e53e3e'
const COLOR_DIVIDER = '#e2e8f0'

// ── Gradient background strings ──

// Gradient for ADD mode (green tint, similar to clockIn)
const GRADIENT_ADD = `
  radial-gradient(ellipse at 20% 50%, #f1f7ed 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, #eff6e9 0%, transparent 50%),
  radial-gradient(ellipse at 50% 80%, #f1f5f9 0%, transparent 50%),
  radial-gradient(ellipse at 80% 80%, #f8fafc 0%, transparent 50%), #f8fafc`

// Gradient for EDIT mode (blue tint)
const GRADIENT_EDIT = `
  radial-gradient(ellipse at 20% 50%, #eef2ff 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, #e0e7ff 0%, transparent 50%),
  radial-gradient(ellipse at 50% 80%, #f0f4ff 0%, transparent 50%),
  radial-gradient(ellipse at 80% 80%, #f5f8ff 0%, transparent 50%), #f5f8ff`

// Helper: create rootClassName CSS that applies gradient to full-screen wrapper
// and hides default mask/content backgrounds (same pattern as clockInModalStyles)
function createGradientRootCss(gradientBg: string): string {
  return css`
    .ant-modal-mask {
      background: transparent !important;
    }
    .ant-modal-wrap {
      background: ${gradientBg};
    }
    .ant-modal-content {
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
    }
  `
}

// ── Root-level gradient classes (applied via rootClassName) ──

export const gradientAddRootCss = createGradientRootCss(GRADIENT_ADD)
export const gradientEditRootCss = createGradientRootCss(GRADIENT_EDIT)

// ── Modal container (glassmorphism) ──

export const recordModalStyles = {
  // Glass modal container
  modalContainerCss: css`
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
    border-radius: 16px;
    padding: 32px;
    max-width: 500px;
    margin: 0 auto;
  `,

  // System label (e.g. "新增紀錄" / "修改紀錄")
  systemLabelCss: css`
    font-size: 13px;
    font-weight: 500;
    color: ${COLOR_MUTED};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    text-align: center;
  `,

  // Title
  titleCss: css`
    font-size: 18px;
    font-weight: 700;
    color: ${COLOR_TEXT};
    margin-bottom: 20px;
    text-align: center;
  `,

  // Glass card (inner card)
  glassCardCss: css`
    background: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  // Avatar area
  avatarCss: css`
    border-radius: 50%;
    overflow: hidden;
    display: inline-flex;
    margin-bottom: 8px;
  `,

  // Employee name
  employeeNameCss: css`
    font-size: 20px;
    font-weight: 700;
    color: ${COLOR_TEXT};
    margin-bottom: 4px;
  `,

  // Date display
  dateLabelCss: css`
    font-size: 14px;
    color: ${COLOR_MUTED};
    margin-bottom: 12px;
  `,

  // Shift badge
  shiftBadgeCss: css`
    display: inline-block;
    background: ${COLOR_BLUE};
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 9999px;
    margin-bottom: 12px;
  `,

  // Form section (below glass card info)
  formSectionCss: css`
    width: 100%;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid ${COLOR_DIVIDER};
  `,

  // Form row
  formRowCss: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  `,

  // Form label
  formLabelCss: css`
    font-size: 13px;
    font-weight: 500;
    color: ${COLOR_MUTED};
    min-width: 80px;
  `,

  // Type radio group wrapper
  typeGroupCss: css`
    display: flex;
    gap: 12px;
  `,

  // Type radio button (inactive)
  typeOptionCss: css`
    padding: 6px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid ${COLOR_DIVIDER};
    background: rgba(255, 255, 255, 0.5);
    color: ${COLOR_TEXT};
    transition: all 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.8);
    }
  `,

  // Type radio button (active)
  typeOptionActiveCss: css`
    padding: 6px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid ${COLOR_PRIMARY};
    background: ${COLOR_PRIMARY};
    color: #fff;
  `,

  // Button row
  buttonRowCss: css`
    display: flex;
    gap: 12px;
    margin-top: 20px;
    justify-content: center;
    width: 100%;
  `,

  // Cancel button (same pattern as clockInModal)
  cancelBtnCss: css`
    background: rgba(255, 255, 255, 0.5);
    color: #4a5568;
    border: 1px solid rgba(0, 0, 0, 0.08);
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.15s ease;
    flex: 1;

    &:hover {
      transform: translateY(-2px);
    }
  `,

  // Save button
  saveBtnCss: css`
    background: ${COLOR_PRIMARY};
    color: #fff;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
    flex: 1;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `,

  // Delete button (edit mode only)
  deleteBtnCss: css`
    background: transparent;
    color: ${COLOR_RED};
    border: 1px solid ${COLOR_RED};
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: ${COLOR_RED};
      color: #fff;
    }
  `,
}
