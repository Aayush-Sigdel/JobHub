package com.example.jobhub.service.task.design

import com.microsoft.playwright.Browser
import com.microsoft.playwright.BrowserType
import com.microsoft.playwright.Page
import com.microsoft.playwright.Playwright
import org.springframework.stereotype.Service
import java.io.File

@Service
class RenderingService{

    fun renderAndScreenshot(htmlCode: String, windowWidth: Int, windowHeight: Int, loadWaitMs: Double = 300.00): ByteArray {
        val tempFile = File.createTempFile("submission-", ".html")
        tempFile.writeText(htmlCode)
        Playwright.create().use { playwright ->
            val browser = playwright.chromium().launch(
                BrowserType.LaunchOptions().setHeadless(true)
            )
            val context = browser.newContext(
                Browser.NewContextOptions().setViewportSize(windowWidth, windowHeight)
            )
            val page = context.newPage()
            page.navigate("file://${tempFile.absolutePath}")
            page.waitForTimeout(loadWaitMs)

            val screenshotBytes = page.screenshot(
                Page.ScreenshotOptions().setFullPage(false)
            )
            browser.close()
            tempFile.delete()
            return screenshotBytes
        }
    }
}