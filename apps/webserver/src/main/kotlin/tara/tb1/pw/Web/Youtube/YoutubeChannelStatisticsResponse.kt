package tara.tb1.pw.Web.Youtube

data class YoutubeChannelStatsResponse(
        val kind: String? = null,
        val etag: String? = null,
        val pageInfo: YoutubeChannelStatsPageInfo? = null,
        val items: List<YoutubeChannelStatsItem>? = null
)

data class YoutubeChannelStatsPageInfo(
        val totalResults: Int? = null,
        val resultsPerPage: Int? = null
)

data class YoutubeChannelStatsItem(
        val id: String? = null,
        val statistics: YoutubeChannelStats? = null
)

data class YoutubeChannelStats(
        val viewCount: String? = null,
        val subscriberCount: String? = null,
        val hiddenSubscriberCount: Boolean? = null,
        val videoCount: String? = null
)
