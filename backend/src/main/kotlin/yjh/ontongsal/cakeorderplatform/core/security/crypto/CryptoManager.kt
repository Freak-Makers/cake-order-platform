package yjh.ontongsal.cakeorderplatform.core.security.crypto

import org.springframework.security.crypto.encrypt.TextEncryptor
import org.springframework.stereotype.Component

@Component
class CryptoService(
    private val encryptor: TextEncryptor,
) {

    fun encrypt(value: String): String =
        encryptor.encrypt(value)

    fun decrypt(value: String): String =
        encryptor.decrypt(value)
}
