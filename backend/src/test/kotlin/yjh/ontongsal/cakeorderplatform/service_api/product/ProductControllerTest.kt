package yjh.ontongsal.cakeorderplatform.service_api.product

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class ProductControllerTest(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val productRepository: ProductRepository,
) {

    @BeforeEach
    fun setUp() {
        productRepository.deleteAll()
        val items = (1..30).map {
            ProductEntity(
                name = "케이크 $it",
                description = "설명 $it",
                category = if (it % 2 == 0) "홀케이크" else "치즈케이크",
                price = (10000 + it * 1000).toLong(),
                imageUrl = "https://example.com/$it.jpg",
                status = ProductStatus.AVAILABLE,
            )
        }
        productRepository.saveAll(items)
    }

    @Test
    fun `첫 페이지 조회 - hasNext true와 nextCursor를 반환한다`() {
        val response = mockMvc.get("/api/v1/products?limit=10&sort=latest")
            .andReturn().response.contentAsString

        assertTrue(response.contains("\"hasNext\":true"))
        assertTrue(response.contains("\"nextCursor\""))
        val nextCursor = extractNextCursor(response)
        assertNotNull(nextCursor)
        assertTrue(countItems(response) == 10)
    }

    @Test
    fun `nextCursor로 후속 페이지 조회 - 마지막 페이지에 도달하면 hasNext false`() {
        val first = mockMvc.get("/api/v1/products?limit=10&sort=latest").andReturn().response.contentAsString
        val cursor1 = extractNextCursor(first)!!
        val second = mockMvc.get("/api/v1/products?limit=10&sort=latest&cursor=$cursor1")
            .andReturn().response.contentAsString
        assertTrue(second.contains("\"hasNext\":true"))
        val cursor2 = extractNextCursor(second)!!
        val third = mockMvc.get("/api/v1/products?limit=10&sort=latest&cursor=$cursor2")
            .andReturn().response.contentAsString
        assertTrue(third.contains("\"hasNext\":false"))
        assertNull(extractNextCursor(third))
        assertEquals(10, countItems(third))
    }

    @Test
    fun `잘못된 cursor - 400과 PRODUCT_INVALID_CURSOR 1701`() {
        mockMvc.get("/api/v1/products?cursor=not-a-valid-cursor") {
        }.andExpect {
            status { isBadRequest() }
        }.andReturn().response.contentAsString.let { body ->
            assertTrue(body.contains("\"code\":1701"))
        }
    }

    @Test
    fun `priceAsc 정렬 - 가격 오름차순 + 페이지 이어붙임이 동작한다`() {
        val first = mockMvc.get("/api/v1/products?limit=5&sort=priceAsc").andReturn().response.contentAsString
        val prices1 = extractPrices(first)
        assertEquals(prices1.sorted(), prices1)
        val cursor = extractNextCursor(first)!!
        val second = mockMvc.get("/api/v1/products?limit=5&sort=priceAsc&cursor=$cursor")
            .andReturn().response.contentAsString
        val prices2 = extractPrices(second)
        assertTrue(prices2.first() >= prices1.last())
    }

    @Test
    fun `카테고리 필터 - 지정한 카테고리만 반환한다`() {
        val response = mockMvc.get("/api/v1/products?limit=20&category=치즈케이크")
            .andReturn().response.contentAsString
        val categoriesInResponse = Regex("\"category\":\"([^\"]+)\"").findAll(response).map { it.groupValues[1] }.toList()
        assertTrue(categoriesInResponse.isNotEmpty())
        assertTrue(categoriesInResponse.all { it == "치즈케이크" })
    }

    @Test
    fun `categories 엔드포인트 - 등록된 카테고리 distinct 반환`() {
        val response = mockMvc.get("/api/v1/products/categories").andReturn().response.contentAsString
        assertTrue(response.contains("치즈케이크"))
        assertTrue(response.contains("홀케이크"))
    }

    @Test
    fun `cursor의 sort가 요청 sort와 다르면 400`() {
        val first = mockMvc.get("/api/v1/products?limit=5&sort=latest").andReturn().response.contentAsString
        val cursor = extractNextCursor(first)!!
        mockMvc.get("/api/v1/products?limit=5&sort=priceAsc&cursor=$cursor")
            .andExpect { status { isBadRequest() } }
            .andReturn().response.contentAsString.let { body ->
                assertTrue(body.contains("\"code\":1701"))
            }
    }

    private fun extractNextCursor(json: String): String? {
        val match = Regex("\"nextCursor\":(null|\"([^\"]+)\")").find(json) ?: return null
        return match.groupValues[2].ifEmpty { null }
    }

    private fun countItems(json: String): Int = Regex("\"id\":\\d+").findAll(json).count()

    private fun extractPrices(json: String): List<Long> =
        Regex("\"price\":(\\d+)").findAll(json).map { it.groupValues[1].toLong() }.toList()
}
