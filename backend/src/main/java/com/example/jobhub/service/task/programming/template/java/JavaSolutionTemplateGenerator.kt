package com.example.jobhub.service.task.programming.template.java

import com.example.jobhub.model.task.DataType
import com.example.jobhub.model.task.Language
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.service.task.programming.template.SolutionTemplateGenerator
import org.springframework.stereotype.Component

@Component
class JavaSolutionTemplateGenerator : SolutionTemplateGenerator {

    override val language = Language.JAVA

    override val className = "Solution"
    override val fileName = "Solution.java"

    override fun generate(task: ProgrammingTask): String {
        val signature = task.parameters.joinToString(", ") { "${javaType(it.type)} ${it.name}" }

        return buildString {
            appendLine("public class $className {")
            appendLine()
            appendLine("    /**")
            docLines(task).forEach { line ->
                appendLine(if (line.isEmpty()) "     *" else "     * $line")
            }
            appendLine("     */")
            appendLine("    public ${javaType(task.returnType)} ${task.methodName}($signature) {")
            appendLine("        // TODO: write your implementation here")
            appendLine("        return ${javaDefaultValue(task.returnType)};")
            appendLine("    }")
            append("}")
        }
    }

    private fun docLines(task: ProgrammingTask): List<String> = buildList {
        add(commentSafe(task.title))
        add("")
        task.parameters.forEach { add("@param ${it.name} ${it.type}") }
        add("@return ${task.returnType}")
    }

    private fun commentSafe(text: String): String =
        text.lineSequence().first().replace("*/", "*\\/")

    private fun javaType(type: DataType): String = when (type) {
        DataType.INT -> "int"
        DataType.DOUBLE -> "double"
        DataType.BOOLEAN -> "boolean"
        DataType.STRING -> "String"
        DataType.INT_ARRAY -> "int[]"
        DataType.STRING_ARRAY -> "String[]"
    }

    private fun javaDefaultValue(type: DataType): String = when (type) {
        DataType.INT -> "0"
        DataType.DOUBLE -> "0.0"
        DataType.BOOLEAN -> "false"
        DataType.STRING -> "\"\""
        DataType.INT_ARRAY -> "new int[0]"
        DataType.STRING_ARRAY -> "new String[0]"
    }
}
