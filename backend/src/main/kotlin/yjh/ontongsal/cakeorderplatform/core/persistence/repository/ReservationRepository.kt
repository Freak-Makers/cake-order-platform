package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationStatus

interface ReservationRepository :
    JpaRepository<ReservationEntity, Long>,
    JpaSpecificationExecutor<ReservationEntity> {

    fun findAllByUserIdOrderByCreatedAtDesc(userId: Long): List<ReservationEntity>
    fun findAllByOrderByCreatedAtDesc(): List<ReservationEntity>

    // 관리자 예약 목록 — 픽업 시간(slot.startAt) 정렬 전용.
    // Pageable 에 Sort 를 넣으면 Hibernate 가 alias `s` 를 root entity 속성으로 해석해 실패하므로
    // ORDER BY 를 JPQL 안에 직접 박은 asc/desc 두 메서드로 분리. Pageable 은 pagination 만 사용.
    @Query(
        value = """
            SELECT r FROM ReservationEntity r, ReservationSlotEntity s
            WHERE r.slotId = s.id
              AND (:status IS NULL OR r.status = :status)
              AND (:keyword IS NULL OR LOWER(r.reservationNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY s.startAt ASC, r.id ASC
        """,
        countQuery = """
            SELECT count(r) FROM ReservationEntity r, ReservationSlotEntity s
            WHERE r.slotId = s.id
              AND (:status IS NULL OR r.status = :status)
              AND (:keyword IS NULL OR LOWER(r.reservationNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """,
    )
    fun searchBySlotStartAtAsc(
        @Param("status") status: ReservationStatus?,
        @Param("keyword") keyword: String?,
        pageable: Pageable,
    ): Page<ReservationEntity>

    @Query(
        value = """
            SELECT r FROM ReservationEntity r, ReservationSlotEntity s
            WHERE r.slotId = s.id
              AND (:status IS NULL OR r.status = :status)
              AND (:keyword IS NULL OR LOWER(r.reservationNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY s.startAt DESC, r.id DESC
        """,
        countQuery = """
            SELECT count(r) FROM ReservationEntity r, ReservationSlotEntity s
            WHERE r.slotId = s.id
              AND (:status IS NULL OR r.status = :status)
              AND (:keyword IS NULL OR LOWER(r.reservationNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """,
    )
    fun searchBySlotStartAtDesc(
        @Param("status") status: ReservationStatus?,
        @Param("keyword") keyword: String?,
        pageable: Pageable,
    ): Page<ReservationEntity>
}
