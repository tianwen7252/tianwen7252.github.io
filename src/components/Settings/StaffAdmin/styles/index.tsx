import { css } from '@emotion/css'

export const styles = {
  wrapCss: css`
    padding: 0 24px;
  `,
  // Flex layout for merged avatar + name column
  employeeInfoCss: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  // Animal image grid in modal (6 columns)
  imageGridCss: css`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  `,
  // Individual animal image item in the grid picker
  imageItemCss: css`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    border: 2px solid transparent;
    padding: 2px;
    transition: border-color 0.15s;

    &:hover {
      border-color: #d9d9d9;
    }

    img {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
    }
  `,
  // Selected state for image item in grid picker
  imageItemSelectedCss: css`
    border-color: #1677ff !important;
    background: #e6f4ff;
  `,
}
