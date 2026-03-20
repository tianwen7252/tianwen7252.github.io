import { css } from '@emotion/css'

// Color palette for records page
const COLOR_PRIMARY = '#7f956a' // sage green
const COLOR_BG = '#f8fafc' // page background
const COLOR_TEXT = '#1a202c' // dark text
const COLOR_MUTED = '#94a3b8' // slate-400, for "未打卡"
const COLOR_BLUE = '#3b82f6' // blue, for "休假" label and today
const COLOR_BLUE_LIGHT = '#eff6ff' // light blue bg
const COLOR_BORDER = '#f1f5f9' // slate-100, borders
const COLOR_WEEKEND_BG = '#f8fafc50' // weekend row bg (semi-transparent)
const COLOR_HOVER_BG = 'rgba(127, 149, 106, 0.1)' // primary/10 hover
const COLOR_WHITE = '#ffffff'
const COLOR_HEADER_BG = '#f8fafc' // header bg

export const recordsStyles = {
  // ---- Container & Header ----

  containerCss: css`
    padding: 24px;
    background: ${COLOR_BG};
    min-height: 100%;
  `,

  headerCss: css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  `,

  titleCss: css`
    font-size: 24px;
    font-weight: 900;
    color: ${COLOR_TEXT};
    letter-spacing: -0.5px;
  `,

  toggleGroupCss: css`
    display: flex;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 12px;
  `,

  toggleBtnActiveCss: css`
    background: ${COLOR_WHITE};
    color: ${COLOR_PRIMARY};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    font-weight: 700;
    font-size: 13px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    cursor: pointer;
  `,

  toggleBtnCss: css`
    background: transparent;
    color: #64748b;
    border-radius: 8px;
    font-size: 13px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    cursor: pointer;

    &:hover {
      color: #334155;
    }
  `,

  filterBarCss: css`
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  `,

  searchInputCss: css`
    width: 100%;
  `,

  selectCss: css`
    width: 100%;
  `,

  // ---- Table View ----

  tableWrapperCss: css`
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid ${COLOR_BORDER};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    background: ${COLOR_WHITE};
  `,

  tableCss: css`
    width: 100%;
    text-align: left;
    border-collapse: collapse;
  `,

  tableHeadRowCss: css`
    background: ${COLOR_HEADER_BG};
    border-bottom: 1px solid ${COLOR_BORDER};
  `,

  tableHeadCellCss: css`
    padding: 16px 24px;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
    min-width: 160px;
  `,

  tableDateHeadCellCss: css`
    padding: 16px 24px;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
    position: sticky;
    left: 0;
    z-index: 2;
    background: ${COLOR_HEADER_BG};
    width: 120px;
    min-width: 120px;
  `,

  tableRowCss: css`
    border-bottom: 1px solid ${COLOR_BORDER};
    transition: background 0.15s ease;

    &:hover {
      background: #f8fafc;
    }
  `,

  tableDateCellCss: css`
    padding: 20px 24px;
    font-size: 13px;
    font-weight: 700;
    color: ${COLOR_TEXT};
    position: sticky;
    left: 0;
    background: ${COLOR_WHITE};
    z-index: 1;
    border-right: 1px solid ${COLOR_BORDER};
  `,

  tableBodyCellCss: css`
    padding: 20px 24px;
  `,

  cellClickableCss: css`
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid transparent;
    transition: all 0.15s ease;

    &:hover {
      background: ${COLOR_HOVER_BG};
      border-color: rgba(127, 149, 106, 0.2);
    }
  `,

  cellTimeCss: css`
    font-size: 13px;
    font-weight: 500;
    color: #334155;
  `,

  cellNoRecordCss: css`
    font-size: 13px;
    font-style: italic;
    color: ${COLOR_MUTED};
  `,

  cellVacationCss: css`
    display: inline-block;
    font-size: 12px;
    font-weight: 700;
    color: ${COLOR_BLUE};
    background: ${COLOR_BLUE_LIGHT};
    border-radius: 4px;
    padding: 2px 10px;
  `,

  tableWeekendRowCss: css`
    background: ${COLOR_WEEKEND_BG};
  `,

  tableWeekendDateCellCss: css`
    padding: 20px 24px;
    font-size: 13px;
    font-weight: 700;
    color: ${COLOR_MUTED};
    position: sticky;
    left: 0;
    background: ${COLOR_WEEKEND_BG};
    z-index: 1;
    border-right: 1px solid ${COLOR_BORDER};
  `,

  tableWeekendContentCss: css`
    text-align: center;
    font-size: 12px;
    color: ${COLOR_MUTED};
    letter-spacing: 2px;
    font-weight: 700;
  `,

  employeeHeaderCss: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  `,

  // ---- Calendar View ----

  calendarWrapperCss: css`
    background: ${COLOR_WHITE};
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  `,

  calendarGridCss: css`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  `,

  calendarHeaderRowCss: css`
    border-bottom: 1px solid #e2e8f0;
    background: ${COLOR_HEADER_BG};
  `,

  calendarHeaderCellCss: css`
    padding: 16px 0;
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    border-right: 1px solid #e2e8f0;

    &:last-child {
      border-right: none;
    }
  `,

  calendarBodyGridCss: css`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: #e2e8f0;
    gap: 1px;
  `,

  calendarDayCellCss: css`
    min-height: 140px;
    padding: 12px;
    background: ${COLOR_WHITE};
    cursor: pointer;
    transition: background 0.15s ease;
    display: flex;
    flex-direction: column;

    &:hover {
      background: #f8fafc;
    }
  `,

  calendarTodayCellCss: css`
    min-height: 140px;
    padding: 12px;
    background: ${COLOR_BLUE_LIGHT}80;
    border: 2px solid rgba(59, 130, 246, 0.2);
    cursor: pointer;
    transition: background 0.15s ease;
    display: flex;
    flex-direction: column;
  `,

  calendarWeekendCellCss: css`
    background: ${COLOR_WHITE};
    display: flex;
    flex-direction: column;
  `,

  calendarWeekendRestCss: css`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    font-weight: 500;
  `,

  calendarOutsideCellCss: css`
    opacity: 0.4;
  `,

  calendarDateLabelCss: css`
    font-size: 13px;
    font-weight: 700;
    color: ${COLOR_TEXT};
    margin-bottom: 8px;
  `,

  calendarDateLabelMutedCss: css`
    font-size: 13px;
    font-weight: 700;
    color: ${COLOR_MUTED};
    margin-bottom: 8px;
  `,

  calendarTodayHeaderCss: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  `,

  calendarTodayBadgeCss: css`
    background: ${COLOR_BLUE};
    color: ${COLOR_WHITE};
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 9999px;
  `,

  calendarCardsContainerCss: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,

  employeeCardCss: css`
    font-size: 11px;
    background: #f8fafc;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid ${COLOR_BORDER};
  `,

  employeeCardNameCss: css`
    font-weight: 700;
    color: ${COLOR_TEXT};
  `,

  employeeCardTimeCss: css`
    display: flex;
    gap: 8px;
    color: #64748b;
    margin-top: 2px;
  `,

  employeeCardClockInCss: css`
    color: ${COLOR_PRIMARY};
    font-weight: 700;
  `,

  employeeCardClockOutCss: css`
    color: #334155;
    font-weight: 700;
  `,

  employeeCardClockMissingCss: css`
    color: #cbd5e1;
  `,

  employeeCardVacationCss: css`
    font-size: 11px;
    background: rgba(59, 130, 246, 0.05);
    padding: 8px;
    border-radius: 4px;
    border: 1px solid rgba(59, 130, 246, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,

  employeeCardVacationLabelCss: css`
    color: ${COLOR_BLUE};
    font-size: 10px;
    font-weight: 700;
  `,

  employeeCardNoRecordCss: css`
    font-style: italic;
    color: ${COLOR_MUTED};
  `,

  // ---- Bottom Hint ----

  hintCss: css`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${COLOR_MUTED};
    font-size: 13px;
    margin-top: 16px;
  `,
}
