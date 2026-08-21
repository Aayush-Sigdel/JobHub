package com.example.jobhub.service.task.programming.driver.python

import com.example.jobhub.model.task.DataType
import com.example.jobhub.model.task.Language
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.service.task.programming.driver.DriverTemplateGenerator
import org.springframework.stereotype.Component

@Component
class PythonDriverTemplateGenerator : DriverTemplateGenerator {

    override val language = Language.PYTHON

    override fun generate(task: ProgrammingTask): String {
        val paramTypeTags = task.parameters.joinToString(", ") { "'${pythonTypeTag(it.type)}'" }
        val callArgs = task.parameters.indices.joinToString(", ") { "p$it" }
        val paramAssignments = task.parameters.indices.joinToString("\n        ") {
            "p$it = cast_value(test_case[$it], param_types[$it])"
        }

        return """
            import json
            import sys
            
            from Solution import Solution
            
            PARAM_TYPES = [$paramTypeTags]
            
            def cast_value(value, type_tag):
                if type_tag == "INT":
                    return int(value)
                if type_tag == "DOUBLE":
                    return float(value)
                if type_tag == "BOOLEAN":
                    return bool(value)
                if type_tag == "STRING":
                    return str(value)
                if type_tag == "INT_ARRAY":
                    return [int(item) for item in value]
                if type_tag == "STRING_ARRAY":
                    return [str(item) for item in value]
                raise ValueError(f"Unsupported type tag: {type_tag}")
            
            def main():
                with open(sys.argv[1], "r", encoding="utf-8") as f:
                    test_cases = json.load(f)
            
                solution = Solution()
            
                for test_case in test_cases:
                    param_types = PARAM_TYPES
                    $paramAssignments
                    result = solution.${task.methodName}($callArgs)
                    print(json.dumps(result))
            
            if __name__ == "__main__":
                main()
        """.trimIndent()
    }

    private fun pythonTypeTag(type: DataType): String = when (type) {
        DataType.INT -> "INT"
        DataType.DOUBLE -> "DOUBLE"
        DataType.BOOLEAN -> "BOOLEAN"
        DataType.STRING -> "STRING"
        DataType.INT_ARRAY -> "INT_ARRAY"
        DataType.STRING_ARRAY -> "STRING_ARRAY"
    }
}
