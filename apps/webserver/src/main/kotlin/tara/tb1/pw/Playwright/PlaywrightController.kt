package tara.tb1.pw.PlaywrightController

import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import tara.tb1.pw.Playwright.Playwright
import tara.tb1.pw.Playwright.RenderData
import tara.tb1.pw.Playwright.RenderOptions

@RestController
@RequestMapping("/playwright")
class PlaywrightController {
    private val playwright = Playwright

    @GetMapping("/test")
    fun test(): String {
        println("Playwright test")
        return "Playwright is working!"
    }

    @PostMapping("/execute")
    fun executeScript(@RequestBody script: String): String {
        return "Executing script: $script"
    }

    @PostMapping("/render", produces = [MediaType.IMAGE_PNG_VALUE])
    suspend fun render(@RequestBody renderData: RenderData): ResponseEntity<ByteArray> {
        val html = this::class.java.classLoader.getResource("templates/skullboard.html")?.readText()
            ?: throw IllegalStateException("Could not find skullboard.html template")
        val image: ByteArray =
                playwright.generateImage(
                        RenderOptions(
                                data = renderData,
                                html = html,
                                selector = "body"
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
