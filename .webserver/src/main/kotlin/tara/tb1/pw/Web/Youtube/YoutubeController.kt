package tara.tb1.pw.Web.Youtube

import java.time.Instant
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import tara.tb1.pw.Enitity.YoutubeChannelEntity
import tara.tb1.pw.Repository.YoutubeChannelRepository
import tara.tb1.pw.Repository.YoutubeRepository

data class AddChannelRequest(val channelId: String)

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

data class ChannelResponse(val channelId: String, val videos: List<YoutubeResponse>)

@RestController
@RequestMapping("/web/youtube")
class YoutubeController(
        private val youtubeService: YoutubeService,
        private val youtubeRepository: YoutubeRepository,
        private val youtubeChannelRepository: YoutubeChannelRepository
) {
    @PostMapping("/channel")
    fun addChannel(@RequestBody request: AddChannelRequest): ResponseEntity<Any> {
        if (youtubeChannelRepository.existsByChannelId(request.channelId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(mapOf("error" to "Channel already exists"))
        }

        val apiKey = youtubeService.getRandomYoutubeApiKey()
        val response = youtubeService.getLatestYoutubeVideo(request.channelId, apiKey)

        if (response == null || response.items.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(mapOf("error" to "Channel not found or has no videos"))
        }

        val channel = YoutubeChannelEntity(channelId = request.channelId)
        youtubeChannelRepository.save(channel)

        return ResponseEntity.status(HttpStatus.CREATED).body(channel)
    }

    @GetMapping("/channel/{channelId}")
    fun getChannelData(@PathVariable channelId: String): ResponseEntity<ChannelResponse> {
        val videos =
                youtubeRepository
                        .findByChannelId(channelId)
                        .map { video ->
                            YoutubeResponse(
                                    channelId = video.channelId,
                                    title = video.title,
                                    description = video.description,
                                    thumbnailUrl = video.thumbnailUrl,
                                    videoUrl = video.videoUrl,
                                    publishedAt = video.publishedAt.toString(),
                                    viewCount = video.viewCount,
                                    likeCount = video.likeCount,
                                    dislikeCount = video.dislikeCount,
                                    commentCount = video.commentCount,
                                    duration = video.duration
                            )
                        }
                        .sortedByDescending { Instant.parse(it.publishedAt) }

        if (videos.isEmpty()) {
            return ResponseEntity.notFound().build()
        }

        return ResponseEntity.ok(ChannelResponse(channelId = channelId, videos = videos))
    }
}
