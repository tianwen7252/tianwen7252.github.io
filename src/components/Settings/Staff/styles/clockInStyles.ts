import { css } from '@emotion/css'

// ClockIn card grid redesign styles
// Scoped font-family: "Public Sans", "Noto Sans TC", "PingFang TC", sans-serif
// Primary color: #7f956a (sage green)
// Background: #f8fafc

const FONT_FAMILY = '"Public Sans", "Noto Sans TC", "PingFang TC", sans-serif'
const COLOR_PRIMARY = '#7f956a'
const COLOR_BG = '#f8fafc'
const COLOR_TEXT = '#1a202c'
const COLOR_MUTED = '#718096'
const COLOR_ORANGE = '#ed8936'
const COLOR_RED = '#e53e3e'

export const styles = {
  containerCss: css`
    padding: 16px;
    background: ${COLOR_BG};
    font-family: ${FONT_FAMILY};
    min-height: 100%;
  `,

  headerCss: css`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 20px;
  `,

  headerTitleCss: css`
    font-size: 20px;
    font-weight: 700;
    color: ${COLOR_TEXT};
  `,

  headerDateCss: css`
    font-size: 14px;
    color: ${COLOR_MUTED};
  `,

  gridCss: css`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  `,

  cardCss: css`
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    padding: 20px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  `,

  avatarWrapCss: css`
    display: flex;
    justify-content: center;
    margin-bottom: 4px;
  `,

  // Avatar border color variants — applied to the wrapper div around AvatarImage
  avatarBorderGreenCss: css`
    display: inline-flex;
    border-radius: 50%;
    border: 3px solid ${COLOR_PRIMARY};
    overflow: hidden;
  `,

  avatarBorderOrangeCss: css`
    display: inline-flex;
    border-radius: 50%;
    border: 3px solid ${COLOR_ORANGE};
    overflow: hidden;
  `,

  avatarBorderRedCss: css`
    display: inline-flex;
    border-radius: 50%;
    border: 3px solid ${COLOR_RED};
    overflow: hidden;
  `,

  nameCss: css`
    font-size: 16px;
    font-weight: 600;
    color: ${COLOR_TEXT};
    margin-top: 12px;
  `,

  roleCss: css`
    font-size: 14px;
    font-weight: 500;
    color: ${COLOR_PRIMARY};
    margin-top: 2px;
  `,

  statusCss: css`
    margin-top: 8px;
  `,

  timesCss: css`
    font-size: 12px;
    color: ${COLOR_MUTED};
    line-height: 1.6;
    margin-top: 4px;
  `,

  vacationBtnCss: css`
    margin-top: 8px;
  `,

  emptyTextCss: css`
    grid-column: 1 / -1;
    text-align: center;
    color: #999;
    padding: 40px 0;
  `,
}
