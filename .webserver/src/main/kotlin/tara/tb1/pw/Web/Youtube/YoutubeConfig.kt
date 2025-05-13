package tara.tb1.pw.Web.Youtube

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration

@Configuration
class YoutubeConfig(
        @Value("\${web.youtube.api.key}") val youtubeApiKey: String,
        @Value("\${web.youtube.api.key.two}") val youtubeApiKeyTwo: String,
        @Value("\${web.youtube.api.key.three}") val youtubeApiKeyThree: String
) {
    fun getYoutubeApiKey(): String {
        return youtubeApiKey
    }

    fun getYoutubeApiKeyTwo(): String {
        return youtubeApiKeyTwo
    }

    fun getYoutubeApiKeyThree(): String {
        return youtubeApiKeyThree
    }
}
