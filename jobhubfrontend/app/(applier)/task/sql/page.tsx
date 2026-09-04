import React from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/service-api";
import { getJobApplicationAvailability } from "@/lib/job-application-availability";
import SQLArenaClient from "./_components/SQLArenaClient";
import type { JobPostDetailResponse } from "@/types/api/jobs";
import type { TaskType } from "@/types/api/tasks";

export interface SQLTaskDto {
  id: string;
  title: string;
  instructions: string;
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
  scope: "PUBLIC" | "PRIVATE";
  createdBy?: string;
}

export default async function SQLArenaPage({
  searchParams,
}: {
  searchParams: Promise<{ taskId?: string; jobId?: string }>;
}) {
  const { taskId, jobId } = (await searchParams) || {};
  let jobTask: SQLTaskDto | null = null;
  let tabLock = false;
  let tabLockWarningLimit = 0;
  let requiredTaskTypes: TaskType[] = [];
  let applicationClosedReason: string | undefined;

  // 1. Fetch exact job attached SQL task if jobId is provided
  if (jobId) {
    try {
      const detail = await fetchWithAuth<JobPostDetailResponse>(`/jobs/${jobId}`, {
        cache: "no-store",
      });
      const availability = getJobApplicationAvailability(detail.job);
      applicationClosedReason = availability.reason;
      if (detail?.sqlTask) {
        jobTask = detail.sqlTask;
        tabLock = detail.job.tabLock;
        tabLockWarningLimit = detail.job.tabLockWarningLimit;
        requiredTaskTypes = [
          detail.job.hasDesignTask && "DESIGN",
          detail.job.hasProgrammingTask && "PROGRAMMING",
          detail.job.hasSqlTask && "SQL",
        ].filter((taskType): taskType is TaskType => Boolean(taskType));
      }
    } catch (e) {
      console.error("Failed to load job details for SQL task:", e);
    }
  }

  // 2. Fetch all public/user SQL tasks
  let tasks: SQLTaskDto[] = [];
  try {
    tasks = await fetchWithAuth<SQLTaskDto[]>("/task/sql/getAll");
  } catch (e) {
    console.error("Failed to load SQL tasks:", e);
  }

  // 3. A job-scoped arena must only submit its assigned task.
  if (jobTask) {
    tasks = [jobTask];
  }

  const selectedTaskId = jobTask?.id || taskId;

  if (jobId && applicationClosedReason) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-lg border bg-card p-6 text-center">
        <h1 className="text-lg font-semibold">Assessment unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{applicationClosedReason}</p>
        <Link href={`/find-job/${jobId}`} className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Return to job
        </Link>
      </div>
    );
  }

  return (
    <SQLArenaClient
      tasks={tasks}
      initialTaskId={selectedTaskId}
      jobId={jobId}
      jobTask={jobTask}
      tabLock={tabLock}
      tabLockWarningLimit={tabLockWarningLimit}
      requiredTaskTypes={requiredTaskTypes}
    />
  );
}
