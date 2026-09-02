"use client";
import React, { useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import type { ProgrammingTaskDto, DataType } from "../page";

const mapJavaType = (type: DataType) => ({ INT: "int", INT_ARRAY: "int[]", STRING: "String", STRING_ARRAY: "String[]", DOUBLE: "double", BOOLEAN: "boolean" }[type] || "void");
const mapPythonType = (type: DataType) => ({ INT: "int", INT_ARRAY: "List[int]", STRING: "str", STRING_ARRAY: "List[str]", DOUBLE: "float", BOOLEAN: "bool" }[type] || "None");

export default function ProgramEditor({ task, language, code, setCode }: { task: ProgrammingTaskDto; language: "JAVA" | "PYTHON"; code: string; setCode: (c: string) => void }) {
  useEffect(() => {
    let template = "";
    if (language === "JAVA") {
      const params = task.parameters.map(p => `${mapJavaType(p.type)} ${p.name}`).join(", ");
      template = `class Solution {\n    public ${mapJavaType(task.returnType)} ${task.methodName}(${params}) {\n        // your code here\n    }\n}`;
    } else {
      const params = task.parameters.map(p => `${p.name}: ${mapPythonType(p.type)}`).join(", ");
      const p = params ? `, ${params}` : "";
      template = `from typing import List\n\nclass Solution:\n    def ${task.methodName}(self${p}) -> ${mapPythonType(task.returnType)}:\n        # your code here\n        pass`;
    }
    setCode(template);
  }, [task, language, setCode]);

  return (
    <div className="h-full flex flex-col border rounded overflow-hidden">
      <div className="bg-gray-100 p-2 text-sm font-semibold border-b">Code Editor ({language})</div>
      <div className="flex-1 overflow-auto bg-white">
        <CodeMirror value={code} height="100%" extensions={[language === "JAVA" ? java() : python()]} onChange={(val) => setCode(val)} className="h-full" />
      </div>
    </div>
  );
}
