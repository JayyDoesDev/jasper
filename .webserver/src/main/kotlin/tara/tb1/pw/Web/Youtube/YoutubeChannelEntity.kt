package tara.tb1.pw.Enitity

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "youtube_channels")
data class YoutubeChannelEntity(
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) val id: Long = 0,
        @Column(unique = true) val channelId: String,
        val addedAt: Instant = Instant.now(),
        var lastUpdated: Instant = Instant.now()
)
