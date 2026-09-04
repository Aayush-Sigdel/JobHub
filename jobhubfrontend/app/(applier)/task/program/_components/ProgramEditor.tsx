"use client";

import { useEffect } from "react";
import { CodeEditor } from "@/components/task/CodeEditor";
import type { DataType, ProgrammingTaskDto } from "../page";

const JAVA_TYPES: Record<DataType, string> = {
  INT: "int",
  INT_ARRAY: "int[]",
  STRING: "String",
  STRING_ARRAY: "String[]",
  DOUBLE: "double",
  BOOLEAN: "boolean",
};

const PYTHON_TYPES: Record<DataType, string> = {
  INT: "int",
  INT_ARRAY: "List[int]",
  STRING: "str",
  STRING_ARRAY: "List[str]",
  DOUBLE: "float",
  BOOLEAN: "bool",
};

function createStarterCode(
  task: ProgrammingTaskDto,
  language: "JAVA" | "PYTHON",
) {
  if (language === "JAVA") {
    const parameters = task.parameters
      .map((parameter) => `${JAVA_TYPES[parameter.type]} ${parameter.name}`)
      .join(", ");
    return `class Solution {\n    public ${JAVA_TYPES[task.returnType]} ${task.methodName}(${parameters}) {\n        // Write your solution here\n    }\n}`;
  }

  const parameters = task.parameters
    .map((parameter) => `${parameter.name}: ${PYTHON_TYPES[parameter.type]}`)
    .join(", ");
  const signatureParameters = parameters ? `, ${parameters}` : "";
  return `from typing import List\n\nclass Solution:\n    def ${task.methodName}(self${signatureParameters}) -> ${PYTHON_TYPES[task.returnType]}:\n        # Write your solution here\n        pass`;
}

export default function ProgramEditor({
  task,
  language,
  setCode,
}: {
  task: ProgrammingTaskDto;
  language: "JAVA" | "PYTHON";
  setCode: (code: string) => void;
}) {
  const starterCode = createStarterCode(task, language);

  useEffect(() => {
    setCode(starterCode);
  }, [starterCode, setCode]);

  return (
    <CodeEditor
      key={`${task.id}-${language}`}
      initialCode={starterCode}
      onChange={setCode}
      fileName={language === "JAVA" ? "Solution.java" : "Solution.py"}
      editorLabel={`Code Editor (${language === "JAVA" ? "Java 17" : "Python 3"})`}
      language={language}
      showActionBar={false}
    />
  );
}
