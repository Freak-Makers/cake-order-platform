package yjh.ontongsal.cakeorderplatform.admin_api.dashboard.application

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.admin_api.dashboard.presentation.AdminDashboardStatsResponse
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PaymentStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.PaymentRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReservationRepository
import java.time.LocalDate
import java.time.ZoneId

@Service
class AdminDashboardService(
    private val reservationRepository: ReservationRepository,
    private val paymentRepository: PaymentRepository,
) {
    private val seoulZone: ZoneId = ZoneId.of("Asia/Seoul")

    @Transactional(readOnly = true)
    fun getStats(): AdminDashboardStatsResponse {
        // Asia/Seoul 기준 오늘 00:00 ~ 다음날 00:00
        val today = LocalDate.now(seoulZone)
        val startOfToday = today.atStartOfDay()
        val startOfTomorrow = today.plusDays(1).atStartOfDay()

        return AdminDashboardStatsResponse(
            todayReservationCount = reservationRepository.countActiveBySlotStartBetween(startOfToday, startOfTomorrow),
            pendingReservationCount = reservationRepository.countByStatus(ReservationStatus.REQUESTED),
            totalCustomerCount = paymentRepository.countDistinctUserIdByStatus(PaymentStatus.PAID),
            totalRevenue = paymentRepository.sumAmountByStatus(PaymentStatus.PAID),
        )
    }
}
