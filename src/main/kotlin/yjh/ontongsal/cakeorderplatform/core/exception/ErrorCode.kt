package yjh.ontongsal.cakeorderplatform.core.exception

enum class ErrorCode(
    val code: Int,
    val message: String,
) {
    // User (1000~1099)
    USER_NOT_FOUND(1000, "사용자를 찾을 수 없습니다"),
    USER_CONFLICT(1001, "사용자 충돌 발생"),

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
    BOARD_DELETE_FORBIDDEN(1304, "관리자가 아니면 게시판을 삭제할 수 없습니다.")
}