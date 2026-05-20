package yjh.ontongsal.cakeorderplatform.core.logging

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import kotlin.collections.component1
import kotlin.collections.component2

object JsonMasker {
    private val mapper = ObjectMapper().findAndRegisterModules()

    private const val MASK = "***"

    private val SENSITIVE_KEYS = setOf(
        // body fields
        "password",
        "passwd",
        "pwd",
        "token",
        "email",
        "phone",
        "mobile",
        "ssn",
        "cardnumber",
        "accountnumber",
        // HTTP headers
        "authorization",
        "cookie",
        "set-cookie",
        "proxy-authorization",
    )

    private fun isSensitive(key: String): Boolean = key.lowercase() in SENSITIVE_KEYS

    /**
     * json 마스킹 처리
     */
    fun maskFrom(json: String): String {
        return try {
            val tree = mapper.readTree(json)
            val masked = maskNode(tree)
            mapper.writeValueAsString(masked)
        } catch (e: Exception) {
            json // JSON 아닐 때 그냥 원문
        }
    }

    /**
     * Map 마스크 처리
     */
    fun maskFrom(map: Map<String, Any>): Map<String, Any> {
        return map.mapValues { (key, value) ->
            if (isSensitive(key)) MASK else value
        }
    }

    private fun maskNode(node: JsonNode): JsonNode {
        return when {
            node.isObject -> maskObject(node as ObjectNode)
            node.isArray -> maskArray(node as ArrayNode)
            else -> node
        }
    }

    private fun maskObject(obj: ObjectNode): ObjectNode {
        val fields = obj.fields()
        while (fields.hasNext()) {
            val (key, value) = fields.next()

            if (isSensitive(key)) {
                obj.put(key, MASK)          // ← 민감키는 value를 ***로 치환
            } else {
                obj.set<JsonNode>(key, maskNode(value))  // ← 재귀
            }
        }
        return obj
    }

    private fun maskArray(array: ArrayNode): ArrayNode {
        for (i in 0 until array.size()) {
            array.set(i, maskNode(array[i]))  // 배열도 재귀 처리
        }
        return array
    }
}
