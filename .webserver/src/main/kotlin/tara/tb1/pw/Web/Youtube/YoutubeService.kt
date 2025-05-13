package tara.tb1.pw.Web.Youtube

import org.springframework.stereotype.Service

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
class YoutubeService {
    companion object {
        private const val YOUTUBE_API_KEY = "YOUR_YOUTUBE_API"
        private const val YOUTUBE_API_KEY_TWO = "YOUR_YOUTUBE_API_TWO"
        private const val YOUTUBE_API_KEY_THREE = "YOUR_YOUTUBE_API_THREE"
    }

    fun getYoutubeApiKey(): String {
        return Companion.YOUTUBE_API_KEY
    }

    fun getYoutubeApiKeyTwo(): String {
        return Companion.YOUTUBE_API_KEY_TWO
    }

    fun getYoutubeApiKeyThree(): String {
        return Companion.YOUTUBE_API_KEY_THREE
    }

    fun getLatestYoutubeVideo(channelId: String, apiKey: String): Unit {
        return
    }
}
