package yjh.ontongsal.cakeorderplatform.admin_api.dashboard.presentation

data class AdminDashboardStatsResponse(
    val todayReservationCount: Long,    // slotStartAt 이 오늘인 활성 예약 수
    val pendingReservationCount: Long,  // status = REQUESTED 인 예약 수
    val totalCustomerCount: Long,       // PAID 결제 1건 이상 보유한 고유 user 수
    val totalRevenue: Long,             // PAID 결제의 amount 합
)
