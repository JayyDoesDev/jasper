package tara.tb1.pw.Web.Youtube

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration

@Configuration
class YoutubeConfig(
        @Value("\${web.youtube.api.key}") private val youtubeApiKey: String,
        @Value("\${web.youtube.api.key.two}") private val youtubeApiKeyTwo: String,
        @Value("\${web.youtube.api.key.three}") private val youtubeApiKeyThree: String
) {
    fun getYoutubeApiKey(): String = youtubeApiKey
    fun getYoutubeApiKeyTwo(): String = youtubeApiKeyTwo
    fun getYoutubeApiKeyThree(): String = youtubeApiKeyThree
}
