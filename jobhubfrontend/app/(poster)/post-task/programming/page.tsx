"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Braces, ChevronLeft, CirclePlus, Code2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createProgrammingTaskAction } from "@/lib/actions/tasks";
import type { CreateProgrammingTask, DataType, Parameter, ProgrammingTestCase, SkillLevel, TaskScope } from "@/types/api/tasks";

type EditableTestCase = { input: string; expectedOutput: string };

const dataTypes: DataType[] = ["INT", "INT_ARRAY", "STRING", "STRING_ARRAY", "DOUBLE", "BOOLEAN"];

function createTestCase(): EditableTestCase {
  return { input: "[]", expectedOutput: "null" };
}

export default function CreateProgrammingTaskPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("INTERMEDIATE");
  const [scope, setScope] = useState<TaskScope>("PRIVATE");
  const [methodName, setMethodName] = useState("solve");
  const [returnType, setReturnType] = useState<DataType>("INT");
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [testCases, setTestCases] = useState<EditableTestCase[]>(Array.from({ length: 5 }, createTestCase));
  const [orderInsensitiveOutput, setOrderInsensitiveOutput] = useState(false);

  const updateParameter = (parameterIndex: number, update: Partial<Parameter>) => {
    setParameters((current) => current.map((parameter, index) => index === parameterIndex ? { ...parameter, ...update } : parameter));
  };

  const updateTestCase = (testCaseIndex: number, update: Partial<EditableTestCase>) => {
    setTestCases((current) => current.map((testCase, index) => index === testCaseIndex ? { ...testCase, ...update } : testCase));
  };

  const publish = () => {
    if (!title.trim() || !instruction.trim()) {
      toast.error("Add a title and candidate instructions.");
      return;
    }
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(methodName.trim())) {
      toast.error("Method name must be a valid identifier.");
      return;
    }
    if (parameters.some((parameter) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(parameter.name.trim()))) {
      toast.error("Every parameter needs a valid identifier.");
      return;
    }
    if (new Set(parameters.map((parameter) => parameter.name.trim())).size !== parameters.length) {
      toast.error("Parameter names must be unique.");
      return;
    }

    let parsedTestCases: ProgrammingTestCase[];
    try {
      parsedTestCases = testCases.map((testCase, testCaseIndex) => {
        const input = JSON.parse(testCase.input) as unknown;
        if (!Array.isArray(input)) throw new Error(`Test case ${testCaseIndex + 1}: inputs must be a JSON array.`);
        if (input.length !== parameters.length) throw new Error(`Test case ${testCaseIndex + 1}: expected ${parameters.length} input value(s).`);
        return { input, expectedOutput: JSON.parse(testCase.expectedOutput) };
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Use valid JSON for test case values.");
      return;
    }

    const payload: CreateProgrammingTask = {
      title: title.trim(),
      instruction: instruction.trim(),
      skillLevel,
      scope,
      methodName: methodName.trim(),
      parameters: parameters.map((parameter) => ({ ...parameter, name: parameter.name.trim() })),
      returnType,
      orderInsensitiveOutput,
      testCases: parsedTestCases,
    };

    startTransition(async () => {
      try {
        await createProgrammingTaskAction(payload);
        toast.success("Programming assessment created. Attach it to a job post next.");
        router.push("/post-job");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to create the programming assessment.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-5xl py-6 md:py-10">
      <Button variant="ghost" onClick={() => router.push("/post-task")}><ChevronLeft />Assessment types</Button>
      <header className="mt-4 border-b pb-6">
        <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Braces className="size-5" /></div><div><p className="text-sm font-medium text-primary">Programming assessment</p><h1 className="text-3xl font-semibold tracking-tight">Create a coding task</h1></div></div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Candidates implement the method in Java or Python. Add at least five typed test cases; all test cases remain private during evaluation.</p>
      </header>

      <div className="mt-8 space-y-6">
        <section className="rounded-xl border bg-card p-5 md:p-6"><h2 className="font-semibold">Task details</h2><div className="mt-5 grid gap-5 md:grid-cols-2"><div className="space-y-2 md:col-span-2"><Label htmlFor="title">Title</Label><Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Pair sum indices" /></div><div className="space-y-2"><Label htmlFor="level">Skill level</Label><select id="level" value={skillLevel} onChange={(event) => setSkillLevel(event.target.value as SkillLevel)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="EXPERT">Expert</option></select></div><div className="space-y-2"><Label htmlFor="scope">Scope</Label><select id="scope" value={scope} onChange={(event) => setScope(event.target.value as TaskScope)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="PRIVATE">Private</option><option value="PUBLIC">Public</option></select></div><div className="space-y-2 md:col-span-2"><Label htmlFor="instruction">Candidate instructions</Label><Textarea id="instruction" value={instruction} onChange={(event) => setInstruction(event.target.value)} className="min-h-32" placeholder="Explain the problem, constraints, and expected behavior." /></div></div></section>

        <section className="rounded-xl border bg-card p-5 md:p-6"><h2 className="font-semibold">Method contract</h2><div className="mt-5 grid gap-5 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="method">Method name</Label><Input id="method" value={methodName} onChange={(event) => setMethodName(event.target.value)} placeholder="solve" /></div><div className="space-y-2"><Label htmlFor="return-type">Return type</Label><select id="return-type" value={returnType} onChange={(event) => setReturnType(event.target.value as DataType)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">{dataTypes.map((dataType) => <option key={dataType} value={dataType}>{dataType}</option>)}</select></div></div><div className="mt-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-medium">Parameters</h3><p className="mt-1 text-xs text-muted-foreground">Use valid identifiers such as <code>numbers</code> or <code>target</code>.</p></div><Button type="button" variant="outline" size="sm" onClick={() => setParameters((current) => [...current, { name: "", type: "INT" }])}><CirclePlus />Add parameter</Button></div><div className="mt-3 space-y-3">{parameters.map((parameter, parameterIndex) => <div key={parameterIndex} className="grid gap-3 sm:grid-cols-[1fr_12rem_auto]"><Input value={parameter.name} onChange={(event) => updateParameter(parameterIndex, { name: event.target.value })} placeholder="parameterName" /><select value={parameter.type} onChange={(event) => updateParameter(parameterIndex, { type: event.target.value as DataType })} className="h-9 rounded-md border bg-background px-3 text-sm">{dataTypes.map((dataType) => <option key={dataType} value={dataType}>{dataType}</option>)}</select><Button type="button" variant="ghost" size="icon" aria-label="Remove parameter" onClick={() => setParameters((current) => current.filter((_, index) => index !== parameterIndex))}><Trash2 /></Button></div>)}{parameters.length === 0 && <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">This task has no method parameters.</p>}</div></div><div className="mt-6 flex items-center justify-between rounded-lg border p-4"><div><h3 className="text-sm font-medium">Order-insensitive array output</h3><p className="mt-1 text-xs text-muted-foreground">Use when array items can be returned in any order.</p></div><Switch checked={orderInsensitiveOutput} onCheckedChange={setOrderInsensitiveOutput} /></div></section>

        <section className="rounded-xl border bg-card p-5 md:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">Private test cases</h2><p className="mt-1 text-sm text-muted-foreground">At least five are required. Enter JSON values: strings need quotes, arrays use brackets.</p></div><Button type="button" variant="outline" size="sm" onClick={() => setTestCases((current) => [...current, createTestCase()])}><CirclePlus />Add case</Button></div><div className="mt-5 space-y-4">{testCases.map((testCase, testCaseIndex) => <div key={testCaseIndex} className="rounded-lg border p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-medium">Test case {testCaseIndex + 1}</h3><Button type="button" variant="ghost" size="icon" aria-label={`Remove test case ${testCaseIndex + 1}`} disabled={testCases.length <= 5} onClick={() => setTestCases((current) => current.filter((_, index) => index !== testCaseIndex))}><Trash2 /></Button></div><div className="mt-3 grid gap-3 md:grid-cols-2"><div className="space-y-2"><Label htmlFor={`input-${testCaseIndex}`}>Inputs as JSON array</Label><Textarea id={`input-${testCaseIndex}`} value={testCase.input} onChange={(event) => updateTestCase(testCaseIndex, { input: event.target.value })} className="min-h-20 font-mono text-xs" placeholder='[1, 2]' /></div><div className="space-y-2"><Label htmlFor={`output-${testCaseIndex}`}>Expected output as JSON</Label><Textarea id={`output-${testCaseIndex}`} value={testCase.expectedOutput} onChange={(event) => updateTestCase(testCaseIndex, { expectedOutput: event.target.value })} className="min-h-20 font-mono text-xs" placeholder="3" /></div></div></div>)}</div></section>

        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.push("/post-task")}>Cancel</Button><Button type="button" size="lg" disabled={isPending} onClick={publish}>{isPending ? <Loader2 className="animate-spin" /> : <Code2 />}Create programming task</Button></div>
      </div>
    </div>
  );
}
