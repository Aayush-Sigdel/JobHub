import JobMarkdown from "@/components/jobs/JobMarkdown";
import type {
  DesignTaskDto,
  ProgrammingTaskDto,
  SQLTaskDto,
} from "@/types/api/tasks";

export default function CandidateAssessmentQuestion({
  question,
  showHeading = true,
}: {
  question: DesignTaskDto | ProgrammingTaskDto | SQLTaskDto;
  showHeading?: boolean;
}) {
  return (
    <section aria-label="Assessment question" className="space-y-4">
      <div>
        {showHeading && (
          <h5 className="mb-2 text-base font-semibold">Question</h5>
        )}
        <p className="text-sm font-semibold leading-6">{question.title}</p>
      </div>
      {question.instructions?.trim() ? (
        <JobMarkdown className="text-foreground/85 [&_pre]:rounded-sm [&_pre]:border-0">
          {question.instructions}
        </JobMarkdown>
      ) : (
        <p className="text-sm text-muted-foreground">
          No instructions were included for this assessment.
        </p>
      )}
      {"methodName" in question && (
        <div className="space-y-3 text-sm">
          <p className="break-words font-mono text-xs">
            {question.methodName}(
            {question.parameters
              ?.map((parameter) => `${parameter.name}: ${parameter.type}`)
              .join(", ")}
            ) → {question.returnType}
          </p>
          {question.exampleTestCases?.length > 0 && (
            <div>
              <h6 className="font-medium">Examples</h6>
              <ol className="mt-3 space-y-4">
                {question.exampleTestCases.map((example, index) => (
                  <li key={index} className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Example {index + 1}
                    </p>
                    <pre
                      tabIndex={0}
                      role="region"
                      aria-label={`Example ${index + 1} input and expected output`}
                      className="overflow-x-auto bg-muted/40 p-3 text-xs leading-6"
                    >
                      <code>{`Input: ${JSON.stringify(example.input)}\nExpected output: ${JSON.stringify(example.expectedOutput)}`}</code>
                    </pre>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
      {"imageBytes" in question &&
        question.imageBytes &&
        /^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(
          question.imageContentType,
        ) && (
          <figure className="max-w-md">
            {/* A private API image is already supplied as base64. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:${question.imageContentType};base64,${question.imageBytes}`}
              alt={`Reference design for ${question.title}`}
              className="h-auto max-w-full"
            />
            <figcaption className="mt-2 text-xs text-muted-foreground">
              Reference design
            </figcaption>
          </figure>
        )}
    </section>
  );
}
