package tara.tb1.pw.Web.Youtube

import org.springframework.stereotype.Service
import tara.tb1.pw.Web.WebService

data class YoutubeSearchResponse(
        val kind: String,
        val etag: String,
        val nextPageToken: String,
        val regionCode: String,
        val pageInfo: PageInfo,
        val items: List<Item>
)

data class PageInfo(val totalResults: Int, val resultsPerPage: Int)

data class Item(val kind: String, val etag: String, val id: Id, val snippet: Snippet)

data class Id(val kind: String, val videoId: String)

data class Snippet(
        val publishedAt: String,
        val channelId: String,
        val title: String,
        val description: String,
        val thumbnails: Thumbnails,
        val channelTitle: String,
        val liveBroadcastContent: String
)

data class Thumbnails(val `default`: Default, val medium: Medium, val high: High)

data class Default(val url: String, val width: Int, val height: Int)

data class Medium(val url: String, val width: Int, val height: Int)

data class High(val url: String, val width: Int, val height: Int)

@Service
class YoutubeService(private val youtubeConfig: YoutubeConfig, private val webService: WebService) {

    fun getYoutubeApiKey(): String {
        return youtubeConfig.getYoutubeApiKey()
    }

    fun getYoutubeApiKeyTwo(): String {
        return youtubeConfig.getYoutubeApiKeyTwo()
    }

    fun getYoutubeApiKeyThree(): String {
        return youtubeConfig.getYoutubeApiKeyThree()
    }

    fun getLatestYoutubeVideo(channelId: String, apiKey: String): YoutubeSearchResponse? {
        return webService.get<YoutubeSearchResponse>(
                url =
                        "https://www.googleapis.com/youtube/v3/search?key=$apiKey&channelId=$channelId&part=snippet,id&order=date&maxResults=1"
        )
    }

    fun getRandomYoutubeApiKey(): String {
        val apiKeys =
                listOf(
                        youtubeConfig.getYoutubeApiKey(),
                        youtubeConfig.getYoutubeApiKeyTwo(),
                        youtubeConfig.getYoutubeApiKeyThree()
                )
        return apiKeys.random()
    }
}
