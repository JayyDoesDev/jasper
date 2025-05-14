package tara.tb1.pw.Web

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class WebService {
    val httpClient = HttpClient.newHttpClient()
    val logger = LoggerFactory.getLogger(WebService::class.java)

    final inline fun <reified T> get(url: String): T? {
        val request =
                HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Accept", "application/json")
                        .build()

        try {
            val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())
            if (response.statusCode() == 200) {
                val mapper = jacksonObjectMapper()
                logger.info("Response: ${response.body()}")
                return mapper.readValue<T>(response.body())
            }
        } catch (e: Exception) {
            logger.error("Error fetching data from YouTube API", e)
        }
        return null
    }
}
