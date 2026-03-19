import { css } from '@emotion/css'

// ClockInModal glassmorphism styles
// Scoped font-family: "Public Sans", "Noto Sans TC", "PingFang TC", sans-serif
// Design: full-screen modal with mesh gradient backgrounds and glass card

const FONT_FAMILY = '"Public Sans", "Noto Sans TC", "PingFang TC", sans-serif'
const COLOR_TEXT = '#1a202c'
const COLOR_MUTED = '#718096'
const COLOR_PRIMARY = '#7f956a'
const COLOR_RED = '#e53e3e'
const COLOR_GRAY = '#718096'

// ── Mesh gradient background variants ──

export const gradientClockInCss = css`
  background:
    radial-gradient(ellipse at 20% 50%, #f1f7ed 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, #eff6e9 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, #f1f5f9 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, #f8fafc 0%, transparent 50%),
    #f8fafc;
`

export const gradientClockOutCss = css`
  background:
    radial-gradient(ellipse at 20% 50%, #fff7ed 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, #f5f3ff 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, #fff1f2 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, #fdf4ff 0%, transparent 50%),
    #fdf4ff;
`

export const gradientVacationCss = css`
  background:
    radial-gradient(ellipse at 20% 50%, #fff1f2 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, #ffe4e6 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, #fce7f3 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, #fef2f2 0%, transparent 50%),
    #fef2f2;
`

export const gradientCancelVacationCss = css`
  background:
    radial-gradient(ellipse at 20% 50%, #f1f5f9 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, #f7fafc 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, #edf2f7 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, #f0f4f8 0%, transparent 50%),
    #f0f4f8;
`

// ── Modal container (glassmorphism) ──

export const styles = {
  // Glass modal container
  modalContainerCss: css`
    font-family: ${FONT_FAMILY};
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
    border-radius: 16px;
    padding: 40px;
    max-width: 500px;
    margin: 0 auto;
  `,

  // System confirm label
  systemLabelCss: css`
    font-size: 12px;
    font-weight: 500;
    color: ${COLOR_MUTED};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  `,

  // Title
  titleCss: css`
    font-size: 20px;
    font-weight: 700;
    color: ${COLOR_TEXT};
    margin-bottom: 24px;
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

  // Info grid (2 columns)
  infoGridCss: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    width: 100%;
    margin-top: 16px;
  `,

  // Info grid label
  infoLabelCss: css`
    font-size: 12px;
    font-weight: 500;
    color: ${COLOR_MUTED};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  `,

  // Info grid value
  infoValueCss: css`
    font-size: 16px;
    font-weight: 600;
    color: ${COLOR_TEXT};
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
    font-family: ${FONT_FAMILY};

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
    font-family: ${FONT_FAMILY};

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
    background: ${COLOR_GRAY};
  `,
}

// Map action to gradient CSS class
export const GRADIENT_MAP: Record<string, string> = {
  clockIn: gradientClockInCss,
  clockOut: gradientClockOutCss,
  vacation: gradientVacationCss,
  cancelVacation: gradientCancelVacationCss,
}

// Map action to confirm button color CSS class
export const CONFIRM_COLOR_MAP: Record<string, string> = {
  clockIn: styles.confirmClockInCss,
  clockOut: styles.confirmClockOutCss,
  vacation: styles.confirmVacationCss,
  cancelVacation: styles.confirmCancelVacationCss,
}
