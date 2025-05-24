package tara.tb1.pw.Repository

import java.time.Instant
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import tara.tb1.pw.Enitity.YoutubeVideoEntity

@Repository
interface YoutubeRepository : JpaRepository<YoutubeVideoEntity, Long> {
    fun findByChannelId(channelId: String): List<YoutubeVideoEntity>

    fun findFirstByChannelIdOrderByPublishedAtDesc(channelId: String): YoutubeVideoEntity?

    @Query("SELECT DISTINCT y.channelId FROM YoutubeVideoEntity y")
    fun findAllUniqueChannelIds(): List<String>

    fun deleteByChannelIdAndPublishedAtBefore(channelId: String, before: Instant)
}
