export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERT";
export type TaskType = "DESIGN" | "SQL" | "PROGRAMMING";
export type Language = "JAVA" | "PYTHON";
export type TaskScope = "PUBLIC" | "PRIVATE";
export type DataType = "INT" | "INT_ARRAY" | "STRING" | "STRING_ARRAY" | "DOUBLE" | "BOOLEAN";

export interface Parameter {
  name: string;
  type: DataType;
}

export interface ProgrammingTestCase {
  input: unknown[];
  expectedOutput: unknown;
}

export interface DesignTaskDto {
  id: string;
  title: string;
  imageBytes: number[];
  imageContentType: string;
  minimumMatchingScore: number;
  instructions: string;
  skillLevel: SkillLevel;
  scope: TaskScope;
  createdBy: string;
}

export interface ProgrammingTaskDto {
  id: string;
  title: string;
  instructions: string;
  skillLevel: SkillLevel;
  scope: TaskScope;
  methodName: string;
  parameters: Parameter[];
  returnType: DataType;
  exampleTestCases: ProgrammingTestCase[];
  orderInsensitiveOutput: boolean;
}

export interface SQLTaskDto {
  id: string;
  title: string;
  instructions: string;
  skillLevel: SkillLevel;
  scope: TaskScope;
  createdBy: string;
}

export interface SubmitTaskRequest {
  taskId: string;
  code?: string;
  codes?: string[];
  taskType: TaskType;
  language?: Language;
}

export interface TaskSubmissionResponse {
  taskId: string;
  taskType: TaskType;
  passed: boolean;
  achievedScore: number;
  requiredScore: number;
  message?: string;
}

export interface CreateDesignTask {
  title: string;
  instructions: string;
  skillLevel: SkillLevel;
  scope: TaskScope;
  minimumMatchingScore: number;
  imageBytes: number[];
  imageContentType: string;
}

export interface CreateProgrammingTask {
  title: string;
  instruction: string;
  skillLevel: SkillLevel;
  scope: TaskScope;
  methodName: string;
  parameters: Parameter[];
  returnType: DataType;
  orderInsensitiveOutput: boolean;
  testCases: ProgrammingTestCase[];
}

export interface CreateSQLTask {
  title: string;
  setupQueries: string[];
  assertions: string[];
  instructions: string;
  skillLevel: SkillLevel;
  scope: TaskScope;
}
