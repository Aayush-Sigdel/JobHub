import Link from "next/link";
import { ArrowRight, Braces, Database, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const taskTypes = [
  {
    title: "Design assessment",
    description: "Create an image-matching HTML and CSS challenge from a target image or reference markup.",
    href: "/post-task/css",
    icon: ImageIcon,
    detail: "Pixel accuracy scoring",
  },
  {
    title: "Programming assessment",
    description: "Define a method signature, typed parameters, and private test cases for Java and Python submissions.",
    href: "/post-task/programming",
    icon: Braces,
    detail: "Automated test cases",
  },
  {
    title: "SQL assessment",
    description: "Set up an isolated database and write assertions that evaluate a candidate's SQL solution.",
    href: "/post-task/sql",
    icon: Database,
    detail: "Isolated H2 database",
  },
];

export default function PostTaskPage() {
  return (
    <div className="mx-auto max-w-5xl py-6 md:py-10">
      <header className="border-b pb-6">
        <p className="text-sm font-medium text-primary">Employer workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create an assessment</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Build a reusable task first, then attach it to a job post. Candidates must submit each attached assessment before applying.</p>
      </header>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {taskTypes.map((taskType) => {
          const Icon = taskType.icon;
          return (
            <article key={taskType.href} className="flex flex-col rounded-xl border bg-card p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></div>
              <h2 className="mt-5 text-lg font-semibold">{taskType.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{taskType.description}</p>
              <p className="mt-5 text-xs font-medium text-muted-foreground">{taskType.detail}</p>
              <Button asChild className="mt-4 w-full"><Link href={taskType.href}>Create task <ArrowRight /></Link></Button>
            </article>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        Private tasks remain in your assessment library and can be attached to your job posts. Public tasks can also be discovered in the candidate task library.
      </div>
    </div>
  );
}
