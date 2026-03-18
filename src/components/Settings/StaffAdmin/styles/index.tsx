import { css } from '@emotion/css'

export const styles = {
  wrapCss: css`
    padding: 0 24px;
  `,
  avatarCss: css`
    font-size: 28px;
    line-height: 1;
  `,
  emojiGridCss: css`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  `,
  emojiItemCss: css`
    font-size: 28px;
    text-align: center;
    cursor: pointer;
    border-radius: 6px;
    border: 2px solid transparent;
    padding: 4px;
    transition: border-color 0.15s;

    &:hover {
      border-color: #d9d9d9;
    }
  `,
  emojiItemSelectedCss: css`
    border-color: #1677ff !important;
    background: #e6f4ff;
  `,
}
