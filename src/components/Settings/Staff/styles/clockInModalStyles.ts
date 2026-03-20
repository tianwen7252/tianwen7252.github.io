import { css } from '@emotion/css'
import type { ClockInAction } from '../ClockIn'

// ClockInModal glassmorphism styles
// Design: full-screen modal with mesh gradient backgrounds and glass card

const COLOR_TEXT = '#1a202c'
const COLOR_MUTED = '#718096'
const COLOR_PRIMARY = '#7f956a'
const COLOR_RED = '#e53e3e'
const COLOR_DIVIDER = '#e2e8f0'

// ── Gradient background strings ──

const GRADIENT_CLOCK_IN = `
  radial-gradient(ellipse at 20% 50%, #f1f7ed 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, #eff6e9 0%, transparent 50%),
  radial-gradient(ellipse at 50% 80%, #f1f5f9 0%, transparent 50%),
  radial-gradient(ellipse at 80% 80%, #f8fafc 0%, transparent 50%), #f8fafc`

const GRADIENT_CLOCK_OUT = `
  radial-gradient(ellipse at 20% 50%, #fff7ed 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, #f5f3ff 0%, transparent 50%),
  radial-gradient(ellipse at 50% 80%, #fff1f2 0%, transparent 50%),
  radial-gradient(ellipse at 80% 80%, #fdf4ff 0%, transparent 50%), #fdf4ff`

const GRADIENT_VACATION = `
  radial-gradient(ellipse at 20% 50%, #fff1f2 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, #ffe4e6 0%, transparent 50%),
  radial-gradient(ellipse at 50% 80%, #fce7f3 0%, transparent 50%),
  radial-gradient(ellipse at 80% 80%, #fef2f2 0%, transparent 50%), #fef2f2`

// Helper: create a rootClassName CSS that applies gradient to the full-screen
// wrapper and hides the default mask/content backgrounds.
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

export const gradientClockInRootCss = createGradientRootCss(GRADIENT_CLOCK_IN)
export const gradientClockOutRootCss =
  createGradientRootCss(GRADIENT_CLOCK_OUT)
export const gradientVacationRootCss = createGradientRootCss(GRADIENT_VACATION)
// Cancel vacation uses the same red gradient as vacation
export const gradientCancelVacationRootCss =
  createGradientRootCss(GRADIENT_VACATION)

// ── Modal container (glassmorphism) ──

export const styles = {
  // Glass modal container
  modalContainerCss: css`
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
    border-radius: 16px;
    padding: 40px;
    max-width: 500px;
    margin: 0 auto;
  `,

  // System confirm label — centered, slightly larger
  systemLabelCss: css`
    font-size: 14px;
    font-weight: 500;
    color: ${COLOR_MUTED};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    text-align: center;
  `,

  // Title — centered
  titleCss: css`
    font-size: 20px;
    font-weight: 700;
    color: ${COLOR_TEXT};
    margin-bottom: 24px;
    text-align: center;
  `,

  // Glass card
  glassCardCss: css`
    background: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  // Avatar in modal (120px, circular, sage green border)
  avatarModalCss: css`
    border-radius: 50%;
    border: 3px solid ${COLOR_PRIMARY};
    overflow: hidden;
    display: inline-flex;
    margin-bottom: 12px;
  `,

  // Employee name
  employeeNameCss: css`
    font-size: 24px;
    font-weight: 700;
    color: ${COLOR_TEXT};
    margin-bottom: 4px;
  `,

  // Role label (admin)
  roleLabelCss: css`
    font-size: 14px;
    font-weight: 500;
    color: ${COLOR_PRIMARY};
    margin-bottom: 8px;
  `,

  // Info grid (2 columns) — with top divider line
  infoGridCss: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    width: 100%;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid ${COLOR_DIVIDER};
  `,

  // Info grid label — centered
  infoLabelCss: css`
    font-size: 12px;
    font-weight: 500;
    color: ${COLOR_MUTED};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    text-align: center;
  `,

  // Info grid value — centered
  infoValueCss: css`
    font-size: 16px;
    font-weight: 600;
    color: ${COLOR_TEXT};
    text-align: center;
  `,

  // Re-clock-out hint
  reClockOutHintCss: css`
    font-size: 13px;
    color: ${COLOR_MUTED};
    margin-top: 12px;
    text-align: center;
  `,

  // Button row
  buttonRowCss: css`
    display: flex;
    gap: 12px;
    margin-top: 24px;
    justify-content: center;
    width: 100%;
  `,

  // Cancel button
  cancelBtnCss: css`
    background: rgba(255, 255, 255, 0.5);
    color: #4a5568;
    border: 1px solid rgba(0, 0, 0, 0.08);
    padding: 12px 16px;
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

  // Confirm button base
  confirmBtnBaseCss: css`
    color: #fff;
    border: none;
    padding: 12px 16px;
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

  // Confirm button color variants
  confirmClockInCss: css`
    background: ${COLOR_PRIMARY};
  `,

  confirmClockOutCss: css`
    background: ${COLOR_PRIMARY};
  `,

  confirmVacationCss: css`
    background: ${COLOR_RED};
  `,

  confirmCancelVacationCss: css`
    background: ${COLOR_RED};
  `,
}

// Map action to root-level gradient CSS class (for rootClassName)
export const GRADIENT_ROOT_MAP: Record<ClockInAction, string> = {
  clockIn: gradientClockInRootCss,
  clockOut: gradientClockOutRootCss,
  vacation: gradientVacationRootCss,
  cancelVacation: gradientCancelVacationRootCss,
}

// Map action to confirm button color CSS class
export const CONFIRM_COLOR_MAP: Record<ClockInAction, string> = {
  clockIn: styles.confirmClockInCss,
  clockOut: styles.confirmClockOutCss,
  vacation: styles.confirmVacationCss,
  cancelVacation: styles.confirmCancelVacationCss,
}
