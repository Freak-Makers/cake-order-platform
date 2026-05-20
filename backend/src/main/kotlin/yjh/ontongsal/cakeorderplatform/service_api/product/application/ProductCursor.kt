package yjh.ontongsal.cakeorderplatform.service_api.product.application

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import java.util.Base64

enum class ProductSort {
    LATEST,
    PRICE_ASC,
    PRICE_DESC;

    companion object {
        fun fromQuery(raw: String?): ProductSort = when (raw) {
            "priceAsc" -> PRICE_ASC
            "priceDesc" -> PRICE_DESC
            else -> LATEST
        }
    }
}

data class ProductCursor(
    val sort: ProductSort,
    val lastValue: String,
    val lastId: Long,
) {
    companion object {
        private val mapper = ObjectMapper().findAndRegisterModules()

        fun encode(cursor: ProductCursor): String {
            val json = mapper.writeValueAsBytes(cursor)
            return Base64.getUrlEncoder().withoutPadding().encodeToString(json)
        }

        fun decode(raw: String): ProductCursor {
            return try {
                val json = Base64.getUrlDecoder().decode(raw)
                mapper.readValue(json)
            } catch (e: Exception) {
                throw AppException.BadRequest(ErrorCode.PRODUCT_INVALID_CURSOR)
            }
        }
    }
}
