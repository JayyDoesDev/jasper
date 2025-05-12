package tara.tb1.pw.Worker.Commands.Fun.FunController

import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import tara.tb1.pw.Playwright.Playwright
import tara.tb1.pw.Playwright.RenderData
import tara.tb1.pw.Playwright.RenderOptions

@RestController
@RequestMapping("/fun")
class FunController {
    private val playwright = Playwright

    data class MemeData(
            val image: String,
            val topText: String? = null,
            val bottomText: String? = null,
            val fontSize: Int? = null,
            val textColor: String? = null,
            val strokeColor: String? = null
    )

    private fun sanitizeMemeData(data: MemeData): Map<String, Any> {
        val styleString = buildString {
            if (data.fontSize != null) {
                append("font-size: ${data.fontSize}px !important;")
            }
            if (data.textColor != null) {
                append("color: ${data.textColor} !important;")
            }
            if (data.strokeColor != null) {
                val stroke = data.strokeColor
                append(
                        """
                    text-shadow: 
                        3px 3px 0 $stroke,
                        -3px -3px 0 $stroke,
                        3px -3px 0 $stroke,
                        -3px 3px 0 $stroke,
                        0 3px 0 $stroke,
                        3px 0 0 $stroke,
                        0 -3px 0 $stroke,
                        -3px 0 0 $stroke !important;
                """.trimIndent()
                )
            }
        }

        return mapOf(
                        "image" to data.image,
                        "topText" to (data.topText ?: ""),
                        "bottomText" to (data.bottomText ?: ""),
                        "memestyle" to styleString
                )
                .filterValues { it.toString().isNotEmpty() }
    }

    @PostMapping("/meme", produces = [MediaType.IMAGE_PNG_VALUE])
    suspend fun meme(@RequestBody data: MemeData): ResponseEntity<ByteArray> {
        require(data.image.isNotBlank()) { "Image URL is required" }

        val renderData =
                RenderData(
                        avatar = "",
                        content = "",
                        timestamp = "",
                        username = "",
                        customData = sanitizeMemeData(data)
                )

        val image =
                playwright.generateImage(
                        RenderOptions(
                                data = renderData,
                                html =
                                        this::class
                                                .java
                                                .classLoader
                                                .getResource("templates/meme.html")
                                                ?.readText()
                                                ?: throw IllegalStateException(
                                                        "Could not find meme.html template"
                                                ),
                                selector = ".meme-container",
                                deviceScaleFactor = 2,
                                viewport = tara.tb1.pw.Playwright.Viewport(800, 800)
                        )
                )

        val headers =
                HttpHeaders().apply {
                    contentType = MediaType.IMAGE_PNG
                    contentLength = image.size.toLong()
                }

        return ResponseEntity(image, headers, HttpStatus.OK)
    }
}
