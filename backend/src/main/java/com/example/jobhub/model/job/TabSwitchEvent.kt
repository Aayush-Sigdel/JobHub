package com.example.jobhub.model.job

import java.time.Instant

data class TabSwitchEvent(
    val timestamp: Instant = Instant.now(),
    val eventType: String = "TAB_BLUR",
    val durationSeconds: Long? = null,
    val details: String? = null
)
