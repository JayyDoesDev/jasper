package tara.tb1.pw.Playwright

import com.fasterxml.jackson.module.kotlin.convertValue
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.microsoft.playwright.*
import com.microsoft.playwright.options.*
import java.util.regex.Pattern
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jsoup.Jsoup
import org.jsoup.safety.Safelist

private const val PAGE_OPERATION_TIMEOUT = 5000
private val VALID_URL_PATTERN =
        Pattern.compile(
                "^https://(?:cdn\\.discordapp\\.com|media\\.discordapp\\.net|i\\.imgur\\.com)/"
        )

data class RenderData(
        val attachments: List<String>? = null,
        val avatar: String,
        val content: String,
        val replyAvatar: String? = null,
        val replyContent: String? = null,
        val replyUsername: String? = null,
        val roleIcon: String? = null,
        val timestamp: String,
        val username: String,
        val usernameColor: String? = null,
        val replyUsernameColor: String? = null,
        val customData: Map<String, Any?> = emptyMap()
)

data class RenderOptions(
        val data: RenderData,
        val deviceScaleFactor: Int = 4,
        val html: String,
        val selector: String? = null,
        val viewport: Viewport = Viewport(150, 480)
)

data class Viewport(val height: Int, val width: Int)

data class TemplateCache(
        var browser: Browser? = null,
        var lastCleanup: Long = System.currentTimeMillis(),
        val maxPages: Int = 3,
        val pages: MutableList<PageInfo> = mutableListOf()
)

data class PageInfo(
        val context: BrowserContext,
        val page: Page,
        var lastUsed: Long = System.currentTimeMillis()
)

object Playwright {
    private val templateCache = TemplateCache()
    private val safeList =
            Safelist.basic()
                    .addAttributes("div", "class", "style")
                    .addAttributes("span", "class", "style")
                    .addAttributes("img", "src", "alt", "title")

    init {
        safeList.addTags("div", "span", "img")
        safeList.removeTags("script", "style", "iframe", "object", "embed", "svg", "math")
    }

    suspend fun cleanupCache() =
            withContext(Dispatchers.IO) {
                try {
                    cleanupOldPages()
                    templateCache.browser?.close()
                    templateCache.browser = null
                } catch (error: Exception) {
                    System.err.println("Error during cleanup: ${error.message}")
                }
            }

    fun command(attribute: String): String = "jsp-$attribute"

    suspend fun generateImage(options: RenderOptions): ByteArray =
            withContext(Dispatchers.IO) {
                var context: BrowserContext? = null
                var page: Page? = null

                try {
                    ensureBrowserHealth()
                    requireNotNull(templateCache.browser) { "Browser not initialized" }

                    val contextOptions =
                            Browser.NewContextOptions()
                                    .setViewportSize(
                                            options.viewport.width,
                                            options.viewport.height
                                    )
                                    .setDeviceScaleFactor(options.deviceScaleFactor.toDouble())

                    context = templateCache.browser?.newContext(contextOptions)
                    page = context?.newPage()

                    page?.onConsoleMessage { msg -> println("Page log: ${msg.text()}") }
                    page?.onPageError { err -> System.err.println(err) }

                    page?.addInitScript(
                            """
            document.documentElement.style.backgroundColor = 'transparent';
            document.body.style.backgroundColor = 'transparent';
        """.trimIndent()
                    )

                    val setContentOptions =
                            Page.SetContentOptions()
                                    .setTimeout(PAGE_OPERATION_TIMEOUT.toDouble())
                                    .setWaitUntil(WaitUntilState.NETWORKIDLE)
                    page?.setContent(options.html, setContentOptions)

                    page?.evaluate("() => document.fonts?.ready")

                    val element =
                            page?.querySelector(options.selector ?: "body")
                                    ?: throw IllegalStateException("Could not find target element")

                    val boundingBox =
                            element.boundingBox()
                                    ?: throw IllegalStateException(
                                            "Could not get element dimensions"
                                    )

                    page.setViewportSize(
                            maxOf(520, boundingBox.width.toInt()),
                            boundingBox.height.toInt()
                    )

                    val bindDataFunction =
                            """
            async function(data) {
                const processElements = (entryKey, entryValue) => {
                    document.querySelectorAll(`[data-exists-then-display="${'$'}{entryKey}"]`).forEach(element => {
                        const toggleClass = element.getAttribute('data-toggle-class')
                        if (!toggleClass) return
                        
                        const isEmpty = !entryValue || (typeof entryValue === 'string' && !entryValue.trim())
                        element.classList.toggle(toggleClass, isEmpty)
                    })
                    document.querySelectorAll(`[data-bind-class="${'$'}{entryKey}"]`).forEach(element => {
                        if (element instanceof HTMLElement) {
                            element.className += ` ${'$'}{entryValue}`;
                        }
                    });

                    document.querySelectorAll(`[data-bind="${'$'}{entryKey}"]`).forEach(element => {
                        const value = String(entryValue || '')
                        if (element instanceof HTMLImageElement) {
                            element.src = value
                        } else if (element instanceof HTMLElement) {
                            element.innerHTML = value.startsWith('<') && value.endsWith('>') ? value : value
                        }
                    })
                    
                    document.querySelectorAll(`[data-bind-style="${'$'}{entryKey}"]`).forEach(element => {
                        if (element instanceof HTMLElement) {
                            const styleValue = String(entryValue || '')
                            element.style.cssText += styleValue
                        }
                    })

                    if (entryKey === 'usernameColor' || entryKey === 'replyUsernameColor') {
                        document.querySelectorAll(`[data-color="${'$'}{entryKey}"]`).forEach(element => {
                            if (element instanceof HTMLElement) {
                                element.style.color = String(entryValue || '#FFFFFF')
                            }
                        })
                    }
                }

                for (let [entryKey, entryValue] of Object.entries(data)) {
                    if (entryKey === 'customData') continue;
                    processElements(entryKey, entryValue)
                }

                if (data.customData) {
                    for (let [entryKey, entryValue] of Object.entries(data.customData)) {
                        processElements(entryKey, entryValue)
                    }
                }

                await Promise.all(Array.from(document.images).map(img =>
                    img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
                ))
            }
        """.trimIndent()

                    val objectMapper = jacksonObjectMapper()
                    val dataMap: Map<String, Any?> = objectMapper.convertValue(options.data)
                    page.evaluate(bindDataFunction, dataMap)

                    page.evaluate("() => document.fonts?.ready")

                    val screenshotOptions =
                            ElementHandle.ScreenshotOptions()
                                    .setOmitBackground(false)
                                    .setType(ScreenshotType.PNG)

                    return@withContext element.screenshot(screenshotOptions)
                } catch (error: Exception) {
                    throw IllegalStateException("Image generation failed: ${error.message}")
                } finally {
                    try {
                        page?.close()
                        context?.close()
                    } catch (error: Exception) {
                        System.err.println("Error during cleanup: ${error.message}")
                    }
                }
            }

    fun isValidUrl(url: String): Boolean = VALID_URL_PATTERN.matcher(url).matches()

    fun sanitize(text: String): String = Jsoup.clean(text, "", safeList)

    private suspend fun cleanupOldPages() =
            withContext(Dispatchers.IO) {
                val now = System.currentTimeMillis()
                templateCache.lastCleanup = now
                try {
                    templateCache.pages.forEach { it.context.close() }
                    templateCache.pages.clear()
                } catch (error: Exception) {
                    System.err.println("Error during page cleanup: ${error.message}")
                }
            }

    private suspend fun ensureBrowserHealth() =
            withContext(Dispatchers.IO) {
                if (templateCache.browser == null) {
                    initializeBrowser()
                    return@withContext
                }
                try {
                    templateCache.browser?.newContext()?.use { testContext -> testContext.close() }
                } catch (error: Exception) {
                    System.err.println("Browser health check failed: ${error.message}")
                    initializeBrowser()
                }
            }

    private suspend fun initializeBrowser(retryCount: Int = 0): Browser =
            withContext(Dispatchers.IO) {
                try {
                    templateCache.browser?.close()

                    val playwright = com.microsoft.playwright.Playwright.create()
                    val launchOptions =
                            BrowserType.LaunchOptions()
                                    .setArgs(
                                            listOf(
                                                    "--disable-gpu",
                                                    "--disable-dev-shm-usage",
                                                    "--js-flags=--noexpose_wasm",
                                                    "--disable-background-networking",
                                                    "--disable-default-apps",
                                                    "--disable-extensions",
                                                    "--disable-sync",
                                                    "--disable-translate",
                                                    "--hide-scrollbars",
                                                    "--metrics-recording-only",
                                                    "--mute-audio",
                                                    "--no-first-run",
                                                    "--safebrowsing-disable-auto-update"
                                            )
                                    )

                    val browser = playwright.chromium().launch(launchOptions)
                    templateCache.browser = browser
                    browser
                } catch (error: Exception) {
                    System.err.println(
                            "Failed to initialize browser (attempt ${retryCount + 1}): ${error.message}"
                    )
                    if (retryCount < 2) {
                        kotlinx.coroutines.delay((retryCount + 1) * 1000L)
                        initializeBrowser(retryCount + 1)
                    } else {
                        throw error
                    }
                }
            }
}
