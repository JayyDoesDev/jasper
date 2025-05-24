package tara.tb1.pw.Repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import tara.tb1.pw.Enitity.YoutubeChannelEntity

@Repository
interface YoutubeChannelRepository : JpaRepository<YoutubeChannelEntity, Long> {
    fun findByChannelId(channelId: String): YoutubeChannelEntity?
    fun existsByChannelId(channelId: String): Boolean
}
