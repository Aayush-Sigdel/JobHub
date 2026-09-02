'use server';

import { fetchWithAuth } from "@/lib/service-api";
import { revalidatePath } from "next/cache";
import type {
  CreateProgrammingTask,
  CreateSQLTask,
  DesignTaskDto,
  ProgrammingTaskDto,
  SQLTaskDto,
  SubmitTaskRequest,
  TaskSubmissionResponse,
} from "@/types/api/tasks";

export async function submitTaskAction(payload: SubmitTaskRequest): Promise<TaskSubmissionResponse> {
  const result = await fetchWithAuth<TaskSubmissionResponse>("/task/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result;
}

export async function createProgrammingTaskAction(payload: CreateProgrammingTask): Promise<ProgrammingTaskDto> {
  const result = await fetchWithAuth<ProgrammingTaskDto>("/task/programming/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  revalidatePath('/post-job');
  return result;
}

export async function createSQLTaskAction(payload: CreateSQLTask): Promise<SQLTaskDto> {
  const result = await fetchWithAuth<SQLTaskDto>("/task/sql/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  revalidatePath('/post-job');
  return result;
}

export async function createDesignTaskAction(payload: FormData): Promise<DesignTaskDto> {
  const result = await fetchWithAuth<DesignTaskDto>("/task/design/create", {
    method: "POST",
    body: payload,
  });
  revalidatePath('/post-job');
  return result;
}
