import { JobPostForm } from "@/components/post-job/JobPostForm";
import { fetchWithAuth } from "@/lib/service-api";
import type { DesignTaskDto, ProgrammingTaskDto, SQLTaskDto } from "@/types/api/tasks";

async function loadTasks<T>(endpoint: string): Promise<T[]> {
  try {
    return await fetchWithAuth<T[]>(endpoint, { cache: "no-store" });
  } catch {
    return [];
  }
}

export default async function PostJobPage() {
  const [designTasks, programmingTasks, sqlTasks] = await Promise.all([
    loadTasks<DesignTaskDto>("/task/design/get"),
    loadTasks<ProgrammingTaskDto>("/task/programming/get"),
    loadTasks<SQLTaskDto>("/task/sql/get"),
  ]);

  return (
    <JobPostForm
      designTasks={designTasks.map(({ id, title }) => ({ id, title }))}
      programmingTasks={programmingTasks.map(({ id, title }) => ({ id, title }))}
      sqlTasks={sqlTasks.map(({ id, title }) => ({ id, title }))}
    />
  );
}
