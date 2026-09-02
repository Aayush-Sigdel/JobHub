import React from "react";
import { fetchWithAuth } from "@/lib/service-api";
import ProgramArenaClient from "./_components/ProgramArenaClient";

export type DataType = "INT" | "INT_ARRAY" | "STRING" | "STRING_ARRAY" | "DOUBLE" | "BOOLEAN";

export interface Parameter {
  name: string;
  type: DataType;
}

export interface TestCase {
  input: any[];
  expectedOutput: any;
}

export interface ProgrammingTaskDto {
  id: string;
  title: string;
  instructions: string;
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
  scope: "PUBLIC" | "PRIVATE";
  methodName: string;
  parameters: Parameter[];
  returnType: DataType;
  exampleTestCases: TestCase[];
  orderInsensitiveOutput: boolean;
}

export default async function ProgramArenaPage() {
  const tasks = await fetchWithAuth<ProgrammingTaskDto[]>("/task/programming/getAll");
  return <ProgramArenaClient tasks={tasks} />;
}
