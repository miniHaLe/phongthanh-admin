/**
 * Bảng lương column headers, exact + in order, extracted as a pure array so
 * the header-set spec test doesn't require a full render (BangLuongPage hand-
 * composes its table rather than going through CrudTablePage — see that
 * file's header comment for why).
 */
export const BANG_LUONG_COLUMNS = [
  'STT',
  'Kỳ',
  'Tên NV',
  'Phòng',
  'Chức vụ',
  'Lương cứng',
  'Bảo Hiểm',
  'Phụ cấp',
  'Tăng ca - Nghỉ',
  'Ứng lương',
  'Thưởng - Phạt',
  'Công BH',
  'Công SC',
  'Tổng lương',
  'Thực lãnh',
  'Chọn',
] as const
