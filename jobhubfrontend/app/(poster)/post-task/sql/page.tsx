"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CirclePlus, Database, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSQLTaskAction } from "@/lib/actions/tasks";
import type { CreateSQLTask, SkillLevel, TaskScope } from "@/types/api/tasks";

export default function CreateSqlTaskPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("INTERMEDIATE");
  const [scope, setScope] = useState<TaskScope>("PRIVATE");
  const [setupQueries, setSetupQueries] = useState<string[]>(["CREATE TABLE employees (id INT PRIMARY KEY, name VARCHAR(100), department VARCHAR(100));"]);
  const [assertions, setAssertions] = useState<string[]>(["(SELECT COUNT(*) FROM candidate_result) > 0"]);

  const updateQuery = (setter: React.Dispatch<React.SetStateAction<string[]>>, queryIndex: number, value: string) => {
    setter((current) => current.map((query, index) => index === queryIndex ? value : query));
  };

  const publish = () => {
    const validSetupQueries = setupQueries.map((query) => query.trim()).filter(Boolean);
    const validAssertions = assertions.map((assertion) => assertion.trim()).filter(Boolean);
    if (!title.trim() || !instructions.trim()) {
      toast.error("Add a title and candidate instructions.");
      return;
    }
    if (validAssertions.length === 0) {
      toast.error("Add at least one SQL assertion.");
      return;
    }

    const payload: CreateSQLTask = { title: title.trim(), instructions: instructions.trim(), skillLevel, scope, setupQueries: validSetupQueries, assertions: validAssertions };
    startTransition(async () => {
      try {
        await createSQLTaskAction(payload);
        toast.success("SQL assessment created. Attach it to a job post next.");
        router.push("/post-job");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to create the SQL assessment.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-5xl py-6 md:py-10">
      <Button variant="ghost" onClick={() => router.push("/post-task")}><ChevronLeft />Assessment types</Button>
      <header className="mt-4 border-b pb-6"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Database className="size-5" /></div><div><p className="text-sm font-medium text-primary">SQL assessment</p><h1 className="text-3xl font-semibold tracking-tight">Create a SQL task</h1></div></div><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">The evaluator runs setup statements in an isolated H2 database, executes the candidate query, and evaluates each assertion as a boolean SQL expression.</p></header>

      <div className="mt-8 space-y-6">
        <section className="rounded-xl border bg-card p-5 md:p-6"><h2 className="font-semibold">Task details</h2><div className="mt-5 grid gap-5 md:grid-cols-2"><div className="space-y-2 md:col-span-2"><Label htmlFor="title">Title</Label><Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Department headcount report" /></div><div className="space-y-2"><Label htmlFor="level">Skill level</Label><select id="level" value={skillLevel} onChange={(event) => setSkillLevel(event.target.value as SkillLevel)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="EXPERT">Expert</option></select></div><div className="space-y-2"><Label htmlFor="scope">Scope</Label><select id="scope" value={scope} onChange={(event) => setScope(event.target.value as TaskScope)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="PRIVATE">Private</option><option value="PUBLIC">Public</option></select></div><div className="space-y-2 md:col-span-2"><Label htmlFor="instructions">Candidate instructions</Label><Textarea id="instructions" value={instructions} onChange={(event) => setInstructions(event.target.value)} className="min-h-32" placeholder="Describe the result the candidate must produce and any constraints." /></div></div></section>

        <section className="rounded-xl border bg-card p-5 md:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">Database setup</h2><p className="mt-1 text-sm text-muted-foreground">Each statement runs before the candidate solution. Include table creation and seed data.</p></div><Button type="button" variant="outline" size="sm" onClick={() => setSetupQueries((current) => [...current, ""])}><CirclePlus />Add statement</Button></div><div className="mt-5 space-y-4">{setupQueries.map((query, queryIndex) => <div key={queryIndex} className="rounded-lg border p-4"><div className="flex items-center justify-between"><Label htmlFor={`setup-${queryIndex}`}>Setup statement {queryIndex + 1}</Label><Button type="button" variant="ghost" size="icon" aria-label={`Remove setup statement ${queryIndex + 1}`} onClick={() => setSetupQueries((current) => current.filter((_, index) => index !== queryIndex))}><Trash2 /></Button></div><Textarea id={`setup-${queryIndex}`} value={query} onChange={(event) => updateQuery(setSetupQueries, queryIndex, event.target.value)} className="mt-3 min-h-24 font-mono text-xs" placeholder="CREATE TABLE ..." /></div>)}</div></section>

        <section className="rounded-xl border bg-card p-5 md:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">Evaluation assertions</h2><p className="mt-1 text-sm text-muted-foreground">Each value is wrapped in <code>SELECT (&lt;assertion&gt;) AS result</code>. Candidate SELECT output is available as <code>candidate_result</code>.</p></div><Button type="button" variant="outline" size="sm" onClick={() => setAssertions((current) => [...current, ""])}><CirclePlus />Add assertion</Button></div><div className="mt-5 space-y-4">{assertions.map((assertion, assertionIndex) => <div key={assertionIndex} className="rounded-lg border p-4"><div className="flex items-center justify-between"><Label htmlFor={`assertion-${assertionIndex}`}>Assertion {assertionIndex + 1}</Label><Button type="button" variant="ghost" size="icon" aria-label={`Remove assertion ${assertionIndex + 1}`} disabled={assertions.length <= 1} onClick={() => setAssertions((current) => current.filter((_, index) => index !== assertionIndex))}><Trash2 /></Button></div><Textarea id={`assertion-${assertionIndex}`} value={assertion} onChange={(event) => updateQuery(setAssertions, assertionIndex, event.target.value)} className="mt-3 min-h-24 font-mono text-xs" placeholder="(SELECT COUNT(*) FROM candidate_result) = 3" /></div>)}</div></section>

        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.push("/post-task")}>Cancel</Button><Button type="button" size="lg" disabled={isPending} onClick={publish}>{isPending ? <Loader2 className="animate-spin" /> : <Database />}Create SQL task</Button></div>
      </div>
    </div>
  );
}
