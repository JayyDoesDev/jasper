package.tb1.pw.Web.Youtube

import org.springframework.web.bind.annotation.*
import tara.tb1.pw.Web.Youtube.YoutubeService

data class YoutubeResponse(
    val channelId: String,
    val title: String,
    val description: String,
    val thumbnailUrl: String,
    val videoUrl: String,
    val publishedAt: String,
    val viewCount: Long,
    val likeCount: Long,
    val dislikeCount: Long,
    val commentCount: Long,
    val duration: String,
)

@RestController
@RequestMapping("/web")
class YoutubeController(private val youtubeService: YoutubeService) {

    }