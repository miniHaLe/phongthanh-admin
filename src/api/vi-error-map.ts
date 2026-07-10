/**
 * Maps a non-2xx HTTP status (or a network/timeout failure) to a Vietnamese
 * message so `useCrud.onError` renders the same toast it did against the mock.
 * The backend already localizes its error bodies — when a server message is
 * present we surface it verbatim; otherwise we fall back to a status-based map.
 */

/** Sentinel statuses for failures that never reached the server. */
export const NETWORK_ERROR = 0
export const TIMEOUT_ERROR = -1

export function viErrorMessage(status: number, serverMessage?: string): string {
  if (serverMessage && serverMessage.trim()) return serverMessage

  switch (status) {
    case 400:
      return 'Yêu cầu không hợp lệ'
    case 401:
      return 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
    case 403:
      return 'Bạn không có quyền thực hiện thao tác này'
    case 404:
      return 'Không tìm thấy bản ghi'
    case 409:
      return 'Dữ liệu đã thay đổi, vui lòng tải lại và thử lại'
    case TIMEOUT_ERROR:
      return 'Yêu cầu quá thời gian, vui lòng thử lại'
    case NETWORK_ERROR:
      return 'Không thể kết nối máy chủ'
    default:
      return status >= 500
        ? 'Lỗi máy chủ, vui lòng thử lại sau'
        : 'Đã xảy ra lỗi, vui lòng thử lại'
  }
}
