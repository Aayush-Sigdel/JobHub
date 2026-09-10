package com.example.jobhub.service.task.programming.template.python

import com.example.jobhub.model.task.DataType
import com.example.jobhub.model.task.Language
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.service.task.programming.template.SolutionTemplateGenerator
import org.springframework.stereotype.Component

@Component
class PythonSolutionTemplateGenerator : SolutionTemplateGenerator {

    override val language = Language.PYTHON

    override val className = "Solution"

    override fun generate(task: ProgrammingTask): String {
        val signature = task.parameters.joinToString("") { ", ${it.name}: ${pythonType(it.type)}" }
        val needsTypingImport = (task.parameters.map { it.type } + task.returnType).any { isArray(it) }

        return buildString {
            if (needsTypingImport) {
                appendLine("from typing import List")
                appendLine()
                appendLine()
            }
            appendLine("class $className:")
            appendLine()
            appendLine("    def ${task.methodName}(self$signature) -> ${pythonType(task.returnType)}:")
            appendLine("        \"\"\"")
            docLines(task).forEach { line ->
                appendLine(if (line.isEmpty()) "" else "        $line")
            }
            appendLine("        \"\"\"")
            append("        # TODO: write your implementation here")
        }
    }

    private fun docLines(task: ProgrammingTask): List<String> = buildList {
        add(docSafe(task.title))
        add("")
        task.parameters.forEach { add(":param ${it.name}: ${it.type}") }
        add(":return: ${task.returnType}")
    }

    private fun docSafe(text: String): String =
        text.lineSequence().first().replace("\"\"\"", "'''")

    private fun isArray(type: DataType) = type == DataType.INT_ARRAY || type == DataType.STRING_ARRAY

    private fun pythonType(type: DataType): String = when (type) {
        DataType.INT -> "int"
        DataType.DOUBLE -> "float"
        DataType.BOOLEAN -> "bool"
        DataType.STRING -> "str"
        DataType.INT_ARRAY -> "List[int]"
        DataType.STRING_ARRAY -> "List[str]"
    }
}
