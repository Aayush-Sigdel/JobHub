package com.example.jobhub.service.task.design

import org.springframework.stereotype.Service
import java.awt.Color
import java.io.ByteArrayInputStream
import javax.imageio.ImageIO
import kotlin.math.abs

@Service
class ScoringService {

    fun compareImages(targetBytes: ByteArray, submissionBytes: ByteArray, threshold: Int = 30): Double {
        val target = ImageIO.read(ByteArrayInputStream(targetBytes))
        val submission = ImageIO.read(ByteArrayInputStream(submissionBytes))

        require(target.width == submission.width && target.height == submission.height) {
            "Dimension mismatch — viewport size doesn't match target image"
        }
        var matchingPixels = 0
        val totalPixels = target.width * target.height

        for (x in 0 until target.width) {
            for (y in 0 until target.height) {
                val p1 = Color(target.getRGB(x, y))
                val p2 = Color(submission.getRGB(x, y))

                val diff = abs(p1.red - p2.red) +
                        abs(p1.green - p2.green) +
                        abs(p1.blue - p2.blue)

                if (diff <= threshold) {
                    matchingPixels++
                }
            }
        }
        return (matchingPixels.toDouble() / totalPixels) * 100
    }
}