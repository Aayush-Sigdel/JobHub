package com.example.jobhub.util

object FormatUtil {

    private val CODE_BLOCK_REGEX = Regex("```[\\s\\S]*?```")
    private val IMAGE_REGEX = Regex("!\\[.*?]\\(.*?\\)")
    private val LINK_REGEX = Regex("\\[([^]]*)]\\([^)]*\\)")
    private val HTML_TAG_REGEX = Regex("<[^>]+>")
    private val HEADER_REGEX = Regex("^#+\\s*", RegexOption.MULTILINE)
    private val TABLE_BORDER_REGEX = Regex("[|\\-:]{3,}")
    private val URL_REGEX = Regex("https?://\\S+")
    private val MULTI_SPACE_REGEX = Regex(" {2,}")

    fun cleanText(raw: String): String {
        val stripped = raw
            .replace(CODE_BLOCK_REGEX, " ")
            .replace(IMAGE_REGEX, " ")
            .replace(LINK_REGEX, "$1")
            .replace(HTML_TAG_REGEX, " ")
            .replace(HEADER_REGEX, "")
            .replace(TABLE_BORDER_REGEX, " ")

        return stripped
            .lineSequence()
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .joinToString("\n")
            .replace(URL_REGEX, " ")
            .replace(MULTI_SPACE_REGEX, " ")
            .trim()
    }

    fun truncate(text: String, maxChars: Int): String {
        if (text.length <= maxChars) return text
        val cut = text.substring(0, maxChars)
        val lastSpace = cut.lastIndexOf(' ')
        return (if (lastSpace > 0) cut.substring(0, lastSpace) else cut) + "..."
    }
}