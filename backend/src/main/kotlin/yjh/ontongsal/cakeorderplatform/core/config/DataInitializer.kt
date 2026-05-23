package yjh.ontongsal.cakeorderplatform.core.config

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.CommentEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PostEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationSlotEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.SocialProvider
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.UserEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.CommentRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.PostRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReservationRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReservationSlotRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.UserRepository
import java.time.LocalDate
import java.time.LocalTime

private val log = KotlinLogging.logger {}

@Profile("local", "dev")
@Configuration
class DataInitializer(
    private val productRepository: ProductRepository,
    private val postRepository: PostRepository,
    private val reservationSlotRepository: ReservationSlotRepository,
    private val userRepository: UserRepository,
    private val reservationRepository: ReservationRepository,
    private val commentRepository: CommentRepository,
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        seedProducts()
        seedPosts()
        seedReservationSlots()
        seedUsers()
        seedReservations()
        seedComments()
    }

    private fun seedProducts() {
        if (productRepository.count() > 0) return

        val products = listOf(
            ProductEntity(
                name = "생딸기 생크림 케이크",
                description = "국산 설향 딸기가 듬뿍 들어간 케이크",
                category = "홀케이크",
                price = 45000,
                imageUrl = "https://images.unsplash.com/photo-1565958011703-44f9829ba187",
                status = ProductStatus.AVAILABLE
            ),
            ProductEntity(
                name = "초코 가나슈 케이크",
                description = "진한 벨기에산 초콜릿으로 만든 가나슈 케이크",
                category = "홀케이크",
                price = 42000,
                imageUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
                status = ProductStatus.AVAILABLE
            ),
            ProductEntity(
                name = "블루베리 치즈 케이크",
                description = "상큼한 블루베리와 부드러운 필라델피아 치즈의 만남",
                category = "치즈케이크",
                price = 38000,
                imageUrl = "https://images.unsplash.com/photo-1533134242443-d4fd215305ad",
                status = ProductStatus.AVAILABLE
            ),
            ProductEntity(
                name = "망고 쇼트 케이크",
                description = "후숙 잘 된 생망고가 층층이 쌓인 시즌 한정 케이크",
                category = "시즌 한정",
                price = 48000,
                imageUrl = "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62",
                status = ProductStatus.AVAILABLE
            )
        )

        productRepository.saveAll(products)
    }

    private fun seedPosts() {
        if (postRepository.count() > 0L) return
        val products = productRepository.findAll().sortedBy { it.id }
        if (products.isEmpty()) return

        val strawberry = products.getOrNull(0)
        val choco = products.getOrNull(1)
        val mango = products.getOrNull(3)

        val posts = listOf(
            PostEntity(
                productId = strawberry?.id,
                title = "신메뉴! 생딸기 생크림 케이크",
                content = "국산 설향 딸기 시즌을 맞아 새로 출시한 시그니처 케이크입니다. 매일 아침 직접 준비해요.",
                imageUrl = "https://images.unsplash.com/photo-1565958011703-44f9829ba187",
                viewCount = 128,
                likeCount = 12,
            ),
            PostEntity(
                productId = choco?.id,
                title = "초코 가나슈 케이크 — 발렌타인 패키지",
                content = "벨기에산 다크 초콜릿 64% 가나슈로 만든 풍부한 풍미의 케이크. 발렌타인 한정 박스 포장으로 만나보세요.",
                imageUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
                viewCount = 87,
                likeCount = 8,
            ),
            PostEntity(
                productId = mango?.id,
                title = "여름 시즌 한정 — 망고 쇼트 케이크",
                content = "후숙 망고가 층층이 쌓인 인기 메뉴, 7월 한 달간 10% 할인합니다.",
                imageUrl = "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62",
                viewCount = 203,
                likeCount = 25,
            ),
            PostEntity(
                productId = null,
                title = "[공지] 매장 픽업 시간 안내",
                content = "픽업은 평일·주말 모두 10:00~19:00 사이에 가능합니다. 예약 시 슬롯에서 시간을 선택해 주세요.",
                imageUrl = null,
                viewCount = 41,
                likeCount = 2,
                isNotice = true,
            ),
        )
        postRepository.saveAll(posts)
    }

    private fun seedReservationSlots() {
        if (reservationSlotRepository.count() > 0L) return

        // 내일부터 14일간, 매일 10:00 / 14:00 / 18:00 세 슬롯 = 42개
        val baseDate = LocalDate.now()
        val times = listOf(LocalTime.of(10, 0), LocalTime.of(14, 0), LocalTime.of(18, 0))

        val slots = (1..14).flatMap { dayOffset ->
            val day = baseDate.plusDays(dayOffset.toLong())
            times.map { t -> ReservationSlotEntity(startAt = day.atTime(t)) }
        }
        reservationSlotRepository.saveAll(slots)
    }

    private fun seedUsers() {
        if (userRepository.count() > 0L) return
        val users = listOf(
            UserEntity(socialId = "demo-1", nickname = "홍길동", email = "hong@example.com", provider = SocialProvider.KAKAO),
            UserEntity(socialId = "demo-2", nickname = "김영희", email = "kim@example.com", provider = SocialProvider.KAKAO),
            UserEntity(socialId = "demo-3", nickname = "이철수", email = "lee@example.com", provider = SocialProvider.KAKAO),
        )
        userRepository.saveAll(users)
    }

    private fun seedReservations() {
        if (reservationRepository.count() > 0L) return
        val users = userRepository.findAll().sortedBy { it.id }
        val products = productRepository.findAll().sortedBy { it.id }
        val slots = reservationSlotRepository.findAllByOrderByStartAtAsc()
        if (users.isEmpty() || products.isEmpty() || slots.size < 5) return

        // 다양한 상태로 5건 — 모두 가용 슬롯 중 앞의 5개를 점유
        val statuses = listOf(
            ReservationStatus.REQUESTED,
            ReservationStatus.REQUESTED,
            ReservationStatus.CONFIRMED,
            ReservationStatus.PAID,
            ReservationStatus.COMPLETED,
        )

        val reservations = statuses.mapIndexed { idx, status ->
            val slot = slots[idx]
            val user = users[idx % users.size]
            val product = products[idx % products.size]
            val qty = 1
            ReservationEntity(
                reservationNumber = "RES-SEED-${"%02d".format(idx + 1)}",
                userId = user.id,
                productId = product.id,
                slotId = slot.id,
                quantity = qty,
                totalPrice = product.price * qty,
                requirements = if (idx == 0) "레터링 문구: 생일축하해 🎂" else null,
                status = status,
            )
        }
        reservationRepository.saveAll(reservations)
    }

    private fun seedComments() {
        if (commentRepository.count() > 0L) return
        val users = userRepository.findAll().sortedBy { it.id }
        val posts = postRepository.findAll().sortedBy { it.id }
        if (users.size < 3 || posts.size < 4) return

        val u0 = users[0]
        val u1 = users[1]
        val u2 = users[2]
        val strawberry = posts[0]
        val choco = posts[1]
        val mango = posts[2]
        val notice = posts[3]

        val userPool = listOf(u0, u1, u2)
        val strawberryContents = listOf(
            "꼭 먹어보고 싶네요!",
            "딸기 신선해 보여요. 예약했습니다 :)",
            "사진만 봐도 군침이 도네요.",
            "지난 번에도 맛있었어요. 재구매!",
            "포장도 너무 예쁘게 해주세요",
            "어머니 생신 선물로 딱이네요",
            "딸기 양 많아서 행복했어요",
            "주말 픽업 가능한지 궁금해요",
            "사진 더 올려주세요!",
            "달지 않아서 정말 좋아요",
            "친구들이 다 좋아했어요",
            "다음엔 큰 사이즈로 주문할게요",
            "친구 생일에도 주문할 예정이에요",
            "케이크 시트가 너무 부드러워요",
            "딸기 색감이 진짜 예뻐요",
            "주문 후 픽업까지 응대도 친절했어요",
            "포크 챙겨주신 거 감동",
            "다음 시즌도 기다릴게요!",
        )
        val chocoContents = listOf(
            "발렌타인 패키지 너무 예뻐요",
            "선물용으로 좋겠네요!",
            "가나슈 진해서 좋았어요",
            "초콜릿 좋아하면 무조건 추천",
            "박스 디자인 사진 더 봤으면 좋겠어요",
            "다음에 또 시킬게요",
            "쌉싸름한 맛이 일품입니다",
            "달지 않아서 어른 입맛에도 잘 맞아요",
            "촉촉한 식감 너무 좋네요",
            "포장 풀 때부터 향이 좋아요",
            "남자친구 생일 선물로 최고였어요",
            "도시락 사이즈도 있나요?",
        )
        val mangoContents = listOf(
            "망고 시즌 기다렸어요",
            "10% 할인 좋네요",
            "후숙 망고 향이 진짜 좋아요",
            "여름엔 망고가 진리죠",
            "달콤한 망고 듬뿍 들어있어서 만족",
            "한정이라 더 빨리 주문해야겠네요",
            "딸기 케이크보다 더 인기일 듯요",
            "조금 더 새콤한 망고도 부탁드려요",
            "테이크아웃 박스가 든든해요",
            "다음 주에 친구랑 같이 픽업해요",
        )
        val noticeContents = listOf(
            "픽업시간 잘 확인했습니다.",
            "주말도 가능한가요? 좋네요",
            "공휴일 운영 시간도 알려주세요",
            "예약 변경은 어떻게 하나요?",
            "픽업 시 주차는 어디에 하면 되나요?",
            "결제 영수증도 같이 발급되나요?",
            "선물 포장 추가 비용이 있나요?",
            "당일 픽업 가능한지요?",
            "예약 시간 변경 문의드립니다",
            "친절한 안내 감사합니다!",
        )

        // 한 건씩 save + Thread.sleep(10) — 각 댓글의 createdAt 이 ms 단위로 확실히 다르게.
        val total = strawberryContents.size + chocoContents.size + mangoContents.size + noticeContents.size
        log.info { "[seed] inserting $total comments..." }

        strawberryContents.forEachIndexed { idx, content ->
            commentRepository.save(CommentEntity(postId = strawberry.id, userId = userPool[idx % 3].id, content = content))
            Thread.sleep(10)
        }
        chocoContents.forEachIndexed { idx, content ->
            commentRepository.save(CommentEntity(postId = choco.id, userId = userPool[idx % 3].id, content = content))
            Thread.sleep(10)
        }
        mangoContents.forEachIndexed { idx, content ->
            commentRepository.save(CommentEntity(postId = mango.id, userId = userPool[idx % 3].id, content = content))
            Thread.sleep(10)
        }
        noticeContents.forEachIndexed { idx, content ->
            commentRepository.save(CommentEntity(postId = notice.id, userId = userPool[idx % 3].id, content = content))
            Thread.sleep(10)
        }

        // 진단 로그 — 시드된 댓글의 createdAt 이 정말 모두 다른지 콘솔에서 직접 확인.
        val saved = commentRepository.findAll().sortedBy { it.id }
        log.info { "[seed] comments createdAt rows (${saved.size}):" }
        saved.forEach { log.info { "  id=${it.id} postId=${it.postId} createdAt=${it.createdAt}" } }
    }
}
