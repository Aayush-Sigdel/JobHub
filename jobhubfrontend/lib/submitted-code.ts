import type { TaskType } from "@/types/api/tasks";
import type { CodeEditorProps } from "@/components/task/CodeEditor";

export function submittedCodePresentation(taskType: TaskType, storedCode: string): {
  code: string;
  language: NonNullable<CodeEditorProps["language"]>;
  fileName: string;
} {
  if (taskType === "DESIGN") {
    return { code: storedCode, language: "HTML_CSS", fileName: "index.html" };
  }
  if (taskType === "SQL") {
    const queries = [...storedCode.matchAll(/<query>([\s\S]*?)<\/query>/g)];
    const wrappedCode = queries.map((match) => match[0]).join("");
    return {
      code: queries.length && wrappedCode === storedCode
        ? queries.map((match) => match[1]).join("\n\n")
        : storedCode,
      language: "SQL",
      fileName: "solution.sql",
    };
  }
  const javaSource = /\bimport\s+java\.|\bclass\s+\w+\s*\{|\bpublic\s+(?:static\s+)?(?:\w+|\w+\[\])\s+\w+\s*\(/.test(storedCode);
  return javaSource
    ? { code: storedCode, language: "JAVA", fileName: "Solution.java" }
    : { code: storedCode, language: "PYTHON", fileName: "Solution.py" };
}
