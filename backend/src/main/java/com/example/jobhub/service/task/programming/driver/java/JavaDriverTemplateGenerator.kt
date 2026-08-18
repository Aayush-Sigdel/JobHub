package com.example.jobhub.service.task.programming.driver.java

import com.example.jobhub.model.task.DataType
import com.example.jobhub.model.task.Language
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.service.task.programming.driver.DriverTemplateGenerator
import org.springframework.stereotype.Component

@Component
class JavaDriverTemplateGenerator : DriverTemplateGenerator {

    override val language = Language.JAVA

    override fun generate(task: ProgrammingTask): String {
        val paramParsing = task.parameters.mapIndexed { i, p ->
            "${javaType(p.type)} p$i = mapper.treeToValue(testCase.get($i), ${javaTypeClassRef(p.type)});"
        }.joinToString("\n            ")

        val callArgs = task.parameters.indices.joinToString(", ") { "p$it" }

        return """
            import com.fasterxml.jackson.databind.*;
            import java.nio.file.*;

            public class Driver {
                public static void main(String[] args) throws Exception {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode testCases = mapper.readTree(Files.readString(Paths.get(args[0])));
                    Solution solution = new Solution();

                    for (JsonNode testCase : testCases) {
                        $paramParsing
                        ${javaType(task.returnType)} result = solution.${task.methodName}($callArgs);
                        System.out.println(mapper.writeValueAsString(result));
                    }
                }
            }
        """.trimIndent()
    }

    private fun javaType(type: DataType): String = when (type) {
        DataType.INT -> "Integer"
        DataType.DOUBLE -> "Double"
        DataType.BOOLEAN -> "Boolean"
        DataType.STRING -> "String"
        DataType.INT_ARRAY -> "int[]"
        DataType.STRING_ARRAY -> "String[]"
    }

    private fun javaTypeClassRef(type: DataType): String = when (type) {
        DataType.INT -> "Integer.class"
        DataType.DOUBLE -> "Double.class"
        DataType.BOOLEAN -> "Boolean.class"
        DataType.STRING -> "String.class"
        DataType.INT_ARRAY -> "int[].class"
        DataType.STRING_ARRAY -> "String[].class"
    }
}