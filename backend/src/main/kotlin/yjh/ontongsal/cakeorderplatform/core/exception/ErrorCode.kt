package yjh.ontongsal.cakeorderplatform.core.exception

enum class ErrorCode(
    val code: Int,
    val message: String,
) {
    // User (1000~1099)
    USER_NOT_FOUND(1000, "사용자를 찾을 수 없습니다"),
    USER_CONFLICT(1001, "사용자가 이미 존재합니다."),
    INVALID_PASSWORD(1002, "비밀번호가 올바르지 않습니다."),

    // Post (1100~1199)
    ARTICLE_NOT_FOUND(1100, "게시글을 찾을 수 없습니다"),
    ARTICLE_CONFLICT(1101, "게시글 충돌 발생"),
    ARTICLE_DELETED(1102, "삭제된 게시글입니다."),
    ARTICLE_MODIFY_FORBIDDEN(1103, "작성자가 아니면 게시글을 수정할 수 없습니다."),
    ARTICLE_DELETE_FORBIDDEN(1104, "작성자가 아니면 게시글을 삭제할 수 없습니다."),

    // Comment (1200~1299)
    COMMENT_NOT_FOUND(1200, "댓글을 찾을 수 없습니다"),
    COMMENT_CONFLICT(1201, "댓글 충돌 발생"),
    COMMENT_DELETED(1202, "삭제된 댓글입니다."),
    COMMENT_MODIFY_FORBIDDEN(1203, "작성자가 아니면 댓글을 수정할 수 없습니다."),
    COMMENT_DELETE_FORBIDDEN(1204, "작성자가 아니면 댓글을 삭제할 수 없습니다."),

    // Board (1300~1399)
    BOARD_NOT_FOUND(1300, "게시판을 찾을 수 없습니다"),
    BOARD_CONFLICT(1301, "게시판 충돌 발생"),
    BOARD_DELETED(1302, "삭제된 게시판입니다."),
    BOARD_MODIFY_FORBIDDEN(1303, "관리자가 아니면 게시판을 수정할 수 없습니다."),
    BOARD_DELETE_FORBIDDEN(1304, "관리자가 아니면 게시판을 삭제할 수 없습니다."),

    // Todo (1400~1499)
    TODO_NOT_FOUND(1400, "할 일을 찾을 수 없습니다"),
    TODO_FORBIDDEN(1401, "해당 할 일에 대한 권한이 없습니다"),

    // Reservation (1500~1599)
    RESERVATION_NOT_FOUND(1500, "예약을 찾을 수 없습니다"),
    RESERVATION_SLOT_NOT_FOUND(1501, "예약 가능 날짜를 찾을 수 없습니다"),
    INVALID_RESERVATION_STATUS(1502, "현재 예약 상태에서는 진행할 수 없습니다"),
    RESERVATION_FORBIDDEN(1503, "본인 예약만 접근 가능합니다"),
    RESERVATION_SLOT_TAKEN(1504, "이미 예약된 슬롯입니다"),

    // Payment (1600~1699)
    PAYMENT_NOT_FOUND(1600, "결제 내역을 찾을 수 없습니다"),
    PAYMENT_VERIFICATION_FAILED(1601, "결제 검증에 실패했습니다"),
    PAYMENT_AMOUNT_MISMATCH(1602, "결제 금액이 일치하지 않습니다"),

    // Product (1700~1799)
    PRODUCT_NOT_FOUND(1700, "상품을 찾을 수 없습니다"),
    PRODUCT_INVALID_CURSOR(1701, "잘못된 커서입니다"),

    // Favorite (1800~1899)
    FAVORITE_NOT_FOUND(1800, "찜 항목을 찾을 수 없습니다"),
    FAVORITE_ALREADY_EXISTS(1801, "이미 찜한 상품입니다"),

    // Chat (1900~1999)
    CHAT_ROOM_NOT_FOUND(1900, "채팅방을 찾을 수 없습니다"),
    CHAT_ROOM_FORBIDDEN(1901, "본인 채팅방만 접근할 수 있습니다"),
    CHAT_MESSAGE_EMPTY(1902, "메시지 내용이 비어있습니다"),
    CHAT_MESSAGE_TOO_LONG(1903, "메시지가 너무 깁니다"),
    CHAT_ADMIN_NOT_FOUND(1904, "채팅 가능한 관리자가 없습니다"),
    CHAT_UNAUTHORIZED_STOMP(1905, "STOMP 인증에 실패했습니다"),

    // Notification (2000~2099)
    NOTIFICATION_NOT_FOUND(2000, "알림을 찾을 수 없습니다"),
    NOTIFICATION_FORBIDDEN(2001, "해당 알림에 접근할 수 없습니다"),
}
