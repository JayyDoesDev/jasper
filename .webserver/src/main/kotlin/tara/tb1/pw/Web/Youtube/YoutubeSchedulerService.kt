package tara.tb1.pw.Web.Youtube

import java.time.Instant
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import tara.tb1.pw.Enitity.YoutubeVideoEntity
import tara.tb1.pw.Repository.YoutubeChannelRepository
import tara.tb1.pw.Repository.YoutubeRepository

@EnableScheduling
@Service
class YoutubeSchedulerService(
        private val youtubeService: tara.tb1.pw.Web.Youtube.YoutubeService,
        private val youtubeRepository: YoutubeRepository,
        private val youtubeChannelRepository: YoutubeChannelRepository
) {
    private val logger = LoggerFactory.getLogger(YoutubeSchedulerService::class.java)

    @Scheduled(fixedRate = 3600000)
    fun updateChannelData() {
        logger.info("Starting scheduled YouTube channel update")

        try {
            val channels = youtubeChannelRepository.findAll()
            logger.info("Found ${channels.size} channels to update")

            channels.forEach { channel ->
                try {
                    updateChannel(channel.channelId)
                    Thread.sleep(1000)
                } catch (e: Exception) {
                    logger.error("Error updating channel ${channel.channelId}: ${e.message}")
                }
            }
        } catch (e: Exception) {
            logger.error("Error in YouTube channel update scheduler: ${e.message}")
        }
    }

    private fun updateChannel(channelId: String) {
        val apiKey = youtubeService.getRandomYoutubeApiKey()
        val response = youtubeService.getLatestYoutubeVideo(channelId, apiKey)

        response?.items?.firstOrNull()?.let { videoItem ->
            youtubeChannelRepository.findByChannelId(channelId)?.let { channel ->
                channel.lastUpdated = Instant.now()
                youtubeChannelRepository.save(channel)
            }

            val video =
                    YoutubeVideoEntity(
                            channelId = videoItem.snippet.channelId,
                            title = videoItem.snippet.title,
                            description = videoItem.snippet.description,
                            thumbnailUrl = videoItem.snippet.thumbnails.high.url,
                            videoUrl = "https://www.youtube.com/watch?v=${videoItem.id.videoId}",
                            publishedAt = Instant.parse(videoItem.snippet.publishedAt),
                            viewCount = 0,
                            likeCount = 0,
                            dislikeCount = 0,
                            commentCount = 0,
                            duration = ""
                    )

            youtubeRepository.save(video)

            val oldVideos = youtubeRepository.findByChannelId(channelId)
            if (oldVideos.size > 10) {
                val cutoffDate = oldVideos.sortedByDescending { it.publishedAt }[9].publishedAt
                youtubeRepository.deleteByChannelIdAndPublishedAtBefore(channelId, cutoffDate)
            }

            logger.info("Updated data for channel: $channelId")
        }
    }
}
