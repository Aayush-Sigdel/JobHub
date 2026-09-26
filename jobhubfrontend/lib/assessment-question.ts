import type { JobPostDetailResponse } from "../types/api/jobs";
import type { TaskSubmissionResponse } from "../types/api/tasks";

export type AssessmentQuestions = Pick<
  JobPostDetailResponse,
  "designTask" | "programmingTask" | "sqlTask"
>;

export function assessmentQuestion(
  questions: AssessmentQuestions | undefined,
  submission: Pick<TaskSubmissionResponse, "taskType" | "taskId">,
) {
  const task =
    submission.taskType === "DESIGN"
      ? questions?.designTask
      : submission.taskType === "PROGRAMMING"
        ? questions?.programmingTask
        : submission.taskType === "SQL"
          ? questions?.sqlTask
          : undefined;
  // Jobs can have their assessments replaced after a candidate has applied.
  return task && task.id === submission.taskId ? task : null;
}
