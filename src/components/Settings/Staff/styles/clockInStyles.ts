import { css } from '@emotion/css'

// ClockIn card grid redesign styles
// Scoped font-family: "Public Sans", "Noto Sans TC", "PingFang TC", sans-serif
// Primary color: #7f956a (sage green)
// Background: #f8fafc

const COLOR_PRIMARY = '#7f956a'
const COLOR_BG = '#f8fafc'
const COLOR_TEXT = '#1a202c'
const COLOR_MUTED = '#718096'
const COLOR_CLOCKED_OUT = '#cab3f3'
const COLOR_VACATION = '#f88181'
const COLOR_DEFAULT = '#dbe3d2'

export const styles = {
  containerCss: css`
    padding: 16px;
    background: ${COLOR_BG};
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
    font-weight: 500;
    color: ${COLOR_TEXT};
  `,

  headerDateCss: css`
    font-size: 14px;
    color: ${COLOR_MUTED};
  `,

  gridCss: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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

    &:hover,
    &:active {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  `,

  // Vacation card background modifier — applied alongside cardCss
  cardVacationBgCss: css`
    background: ${COLOR_VACATION}26;
  `,

  avatarWrapCss: css`
    display: flex;
    justify-content: center;
    margin-bottom: 4px;
  `,

  // Avatar border color variants — applied to the wrapper div around AvatarImage
  avatarBorderDefaultCss: css`
    display: inline-flex;
    border-radius: 50%;
    border: 3px solid ${COLOR_DEFAULT};
    overflow: hidden;
  `,

  avatarBorderGreenCss: css`
    display: inline-flex;
    border-radius: 50%;
    border: 3px solid ${COLOR_PRIMARY};
    overflow: hidden;
  `,

  avatarBorderClockedOutCss: css`
    display: inline-flex;
    border-radius: 50%;
    border: 3px solid ${COLOR_CLOCKED_OUT};
    overflow: hidden;
  `,

  avatarBorderVacationCss: css`
    display: inline-flex;
    border-radius: 50%;
    border: 3px solid ${COLOR_VACATION};
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
    min-height: 21px;
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

  actionBtnRowCss: css`
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 8px;
  `,

  emptyTextCss: css`
    grid-column: 1 / -1;
    text-align: center;
    color: #999;
    padding: 40px 0;
  `,
}
