package com.example.jobhub.service.task.programming.template

import com.example.jobhub.model.task.Language
import com.example.jobhub.model.task.ProgrammingTask

// Produces the boilerplate a candidate starts from. Whatever is generated here has to line up
// with the driver of the same language (see the driver package) and with the file name the
// executor writes the submission to, otherwise the submitted code will not be picked up.
interface SolutionTemplateGenerator {

    val language: Language
    val className: String
    fun generate(task: ProgrammingTask): String
}
