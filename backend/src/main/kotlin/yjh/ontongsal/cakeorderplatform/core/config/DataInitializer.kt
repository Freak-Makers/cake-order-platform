package yjh.ontongsal.cakeorderplatform.core.config

import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository

@Profile("local", "test")
@Configuration
class DataInitializer(
    private val productRepository: ProductRepository,
) : CommandLineRunner {

    override fun run(vararg args: String?) {
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
}
