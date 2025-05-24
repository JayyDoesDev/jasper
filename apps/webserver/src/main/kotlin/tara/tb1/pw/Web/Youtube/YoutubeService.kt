package tara.tb1.pw.Web.Youtube

import org.springframework.stereotype.Service
import tara.tb1.pw.Web.WebService

data class YoutubeSearchResponse(
        val kind: String,
        val etag: String,
        val nextPageToken: String,
        val regionCode: String,
        val pageInfo: YoutubeSearchPageInfo,
        val items: List<YoutubeSearchItem>
)

data class YoutubeSearchPageInfo(val totalResults: Int, val resultsPerPage: Int)

data class YoutubeSearchItem(
        val kind: String,
        val etag: String,
        val id: YoutubeSearchId,
        val snippet: YoutubeSearchSnippet
)

data class YoutubeSearchId(val kind: String, val videoId: String)

data class YoutubeSearchSnippet(
        val publishedAt: String,
        val channelId: String,
        val title: String,
        val description: String,
        val thumbnails: YoutubeSearchThumbnails,
        val channelTitle: String,
        val liveBroadcastContent: String,
        val publishTime: String
)

data class YoutubeSearchThumbnails(
        val `default`: YoutubeSearchDefault,
        val medium: YoutubeSearchMedium,
        val high: YoutubeSearchHigh
)

data class YoutubeSearchDefault(val url: String, val width: Int, val height: Int)

data class YoutubeSearchMedium(val url: String, val width: Int, val height: Int)

data class YoutubeSearchHigh(val url: String, val width: Int, val height: Int)

data class YoutubeChannelResponse(
        val kind: String? = null,
        val etag: String? = null,
        val id: String? = null,
        val snippet: YoutubeChannelSnippet? = null,
        val defaultLanguage: String? = null,
        val localized: YoutubeChannelLocalized? = null,
        val country: String? = null,
        val contentDetails: YoutubeChannelContentDetails? = null,
        val statistics: YoutubeChannelStatistics? = null,
        val topicDetails: YoutubeChannelTopicDetails? = null,
        val status: YoutubeChannelStatus? = null,
        val brandingSettings: YoutubeChannelBrandingSettings? = null,
        val auditDetails: YoutubeChannelAuditDetails? = null,
        val contentOwnerDetails: YoutubeChannelContentOwnerDetails? = null,
        val localizations: Map<String, YoutubeChannelLocalized>? = null
)

data class YoutubeChannelSnippet(
        val title: String? = null,
        val description: String? = null,
        val customUrl: String? = null,
        val publishedAt: String? = null,
        val thumbnails: Map<String, YoutubeChannelThumbnails>? = null
)

data class YoutubeChannelThumbnails(
        val url: String? = null,
        val width: Int? = null,
        val height: Int? = null
)

data class YoutubeChannelLocalized(val title: String? = null, val description: String? = null)

data class YoutubeChannelContentDetails(
        val relatedPlaylists: YoutubeChannelRelatedPlaylists? = null
)

data class YoutubeChannelRelatedPlaylists(val likes: String? = null, val uploads: String? = null)

data class YoutubeChannelStatistics(
        val viewCount: String? = null,
        val subscriberCount: String? = null,
        val hiddenSubscriberCount: Boolean? = null,
        val videoCount: String? = null
)

data class YoutubeChannelTopicDetails(
        val topicIds: List<String>? = null,
        val topicCategories: List<String>? = null
)

data class YoutubeChannelStatus(
        val privacyStatus: String? = null,
        val isLinked: Boolean? = null,
        val longUploadsStatus: String? = null,
        val madeForKids: Boolean? = null,
        val selfDeclaredMadeForKids: Boolean? = null
)

data class YoutubeChannelBrandingSettings(
        val channel: YoutubeChannelChannel? = null,
        val watch: YoutubeChannelWatch? = null
)

data class YoutubeChannelChannel(
        val title: String? = null,
        val description: String? = null,
        val keywords: String? = null,
        val trackingAnalyticsAccountId: String? = null,
        val unsubscribedTrailer: String? = null,
        val defaultLanguage: String? = null,
        val country: String? = null
)

data class YoutubeChannelWatch(
        val textColor: String? = null,
        val backgroundColor: String? = null,
        val featuredPlaylistId: String? = null
)

data class YoutubeChannelAuditDetails(
        val overallGoodStanding: Boolean? = null,
        val communityGuidelinesGoodStanding: Boolean? = null,
        val copyrightStrikesGoodStanding: Boolean? = null,
        val contentIdClaimsGoodStanding: Boolean? = null
)

data class YoutubeChannelContentOwnerDetails(
        val contentOwner: String? = null,
        val timeLinked: String? = null
)

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

        fun getYoutubeChannel(channelId: String, apiKey: String): YoutubeChannelStatsResponse? {
                return webService.get<YoutubeChannelStatsResponse>(
                        url =
                                "https://www.googleapis.com/youtube/v3/channels?part=statistics&fields=kind,etag,pageInfo,items(id,statistics)&id=$channelId&key=$apiKey"
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
