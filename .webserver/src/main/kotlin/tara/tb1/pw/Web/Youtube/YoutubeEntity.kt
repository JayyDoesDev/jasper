package tara.tb1.pw.Enitity

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "youtube_videos")
data class YoutubeVideoEntity(
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) val id: Long = 0,
        val channelId: String,
        val title: String,
        val description: String,
        val thumbnailUrl: String,
        val videoUrl: String,
        val publishedAt: Instant,
        val viewCount: Long,
        val likeCount: Long,
        val dislikeCount: Long,
        val commentCount: Long,
        val duration: String,
)
