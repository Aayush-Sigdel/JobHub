import { notFound } from "next/navigation";
import { JobPostForm } from "@/components/post-job/JobPostForm";
import { fetchWithAuth } from "@/lib/service-api";
import { getRecruiterJobAction } from "@/lib/actions/recruiter";
import type { JobPostResponse } from "@/types/api/jobs";
import type { DesignTaskDto, ProgrammingTaskDto, SQLTaskDto } from "@/types/api/tasks";

async function loadTasks<T>(endpoint: string): Promise<T[]> {
  try {
    return await fetchWithAuth<T[]>(endpoint, { cache: "no-store" });
  } catch {
    return [];
  }
}

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let job: JobPostResponse;
  let designTasks: DesignTaskDto[];
  let programmingTasks: ProgrammingTaskDto[];
  let sqlTasks: SQLTaskDto[];

  try {
    [job, designTasks, programmingTasks, sqlTasks] = await Promise.all([
      getRecruiterJobAction(id),
      loadTasks<DesignTaskDto>("/task/design/get"),
      loadTasks<ProgrammingTaskDto>("/task/programming/get"),
      loadTasks<SQLTaskDto>("/task/sql/get"),
    ]);

  } catch (error) {
    console.error(`Failed to load job ${id} for editing:`, error);
    notFound();
  }

  return (
    <JobPostForm
      initialJob={job}
      designTasks={designTasks.map(({ id: taskId, title }) => ({ id: taskId, title }))}
      programmingTasks={programmingTasks.map(({ id: taskId, title }) => ({ id: taskId, title }))}
      sqlTasks={sqlTasks.map(({ id: taskId, title }) => ({ id: taskId, title }))}
    />
  );
}
