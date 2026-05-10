package yjh.ontongsal.cakeorderplatform

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaAuditing

@EnableJpaAuditing
@SpringBootApplication
class CakeOrderPlatformApplication

fun main(args: Array<String>) {
    runApplication<CakeOrderPlatformApplication>(*args)
}
