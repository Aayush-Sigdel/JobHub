"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CirclePlus,
  Info,
  RotateCcw,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import ChallengeInfoForm from "@/components/task/post/ChallengeInfoForm";
import PostTaskHeader from "@/components/task/post/PostTaskHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createProgrammingTaskAction } from "@/lib/actions/tasks";
import type {
  CreateProgrammingTask,
  DataType,
  Parameter,
  ProgrammingTestCase,
  SkillLevel,
  TaskScope,
} from "@/types/api/tasks";

type EditableTestCase = {
  inputs: string[];
  expectedOutput: string;
};

type ProgrammingTaskPreset = Omit<CreateProgrammingTask, "testCases"> & {
  description: string;
  testCases: ProgrammingTestCase[];
};

type ParsedValue =
  | { valid: true; value: unknown }
  | { valid: false; message: string };

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const MINIMUM_TEST_CASES = 5;

const DATA_TYPES: ReadonlyArray<{
  value: DataType;
  label: string;
  hint: string;
  placeholder: string;
}> = [
  { value: "INT", label: "Integer", hint: "Whole number", placeholder: "42" },
  {
    value: "DOUBLE",
    label: "Decimal",
    hint: "Any number",
    placeholder: "3.14",
  },
  {
    value: "BOOLEAN",
    label: "Boolean",
    hint: "true or false",
    placeholder: "true",
  },
  {
    value: "STRING",
    label: "String",
    hint: "JSON text",
    placeholder: '"hello"',
  },
  {
    value: "INT_ARRAY",
    label: "Integer array",
    hint: "Whole-number list",
    placeholder: "[1, 2, 3]",
  },
  {
    value: "STRING_ARRAY",
    label: "String array",
    hint: "Text list",
    placeholder: '["red", "blue"]',
  },
];

const PROGRAMMING_TASK_PRESETS: ProgrammingTaskPreset[] = [
  {
    title: "Two Sum",
    description:
      "Array lookup with two inputs and an order-insensitive result.",
    instruction:
      "Given an array of integers and a target sum, return the indices of two numbers that add up to the target. Each input has exactly one solution, and the same element cannot be used twice.",
    skillLevel: "INTERMEDIATE",
    scope: "PUBLIC",
    methodName: "twoSum",
    parameters: [
      { name: "nums", type: "INT_ARRAY" },
      { name: "target", type: "INT" },
    ],
    returnType: "INT_ARRAY",
    orderInsensitiveOutput: true,
    testCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
      { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
      { input: [[3, 3], 6], expectedOutput: [0, 1] },
      { input: [[-1, -2, -3, -4, -5], -8], expectedOutput: [2, 4] },
      { input: [[0, 4, 3, 0], 0], expectedOutput: [0, 3] },
    ],
  },
  {
    title: "Square a Number",
    description: "A beginner-friendly integer input and output task.",
    instruction:
      "Return the square of the integer n. The result must equal n multiplied by itself.",
    skillLevel: "BEGINNER",
    scope: "PUBLIC",
    methodName: "square",
    parameters: [{ name: "n", type: "INT" }],
    returnType: "INT",
    orderInsensitiveOutput: false,
    testCases: [
      { input: [4], expectedOutput: 16 },
      { input: [7], expectedOutput: 49 },
      { input: [0], expectedOutput: 0 },
      { input: [-5], expectedOutput: 25 },
      { input: [12], expectedOutput: 144 },
    ],
  },
  {
    title: "Contains Keyword",
    description: "String-array and string inputs with a boolean result.",
    instruction:
      "Return true when the exact keyword appears in the list of tags. The comparison is case-sensitive.",
    skillLevel: "BEGINNER",
    scope: "PUBLIC",
    methodName: "containsKeyword",
    parameters: [
      { name: "tags", type: "STRING_ARRAY" },
      { name: "keyword", type: "STRING" },
    ],
    returnType: "BOOLEAN",
    orderInsensitiveOutput: false,
    testCases: [
      { input: [["java", "spring", "api"], "spring"], expectedOutput: true },
      { input: [["react", "nextjs"], "vue"], expectedOutput: false },
      { input: [[], "python"], expectedOutput: false },
      { input: [["SQL", "Docker"], "sql"], expectedOutput: false },
      {
        input: [["remote", "backend", "remote"], "remote"],
        expectedOutput: true,
      },
    ],
  },
];

const DEFAULT_PRESET = PROGRAMMING_TASK_PRESETS[0];

function serializeValue(value: unknown): string {
  return JSON.stringify(value);
}

function toEditableTestCases(
  testCases: ProgrammingTestCase[],
): EditableTestCase[] {
  return testCases.map((testCase) => ({
    inputs: testCase.input.map(serializeValue),
    expectedOutput: serializeValue(testCase.expectedOutput),
  }));
}

function createEmptyTestCase(parameterCount: number): EditableTestCase {
  return {
    inputs: Array.from({ length: parameterCount }, () => ""),
    expectedOutput: "",
  };
}

function dataTypeDetails(type: DataType) {
  return (
    DATA_TYPES.find((dataType) => dataType.value === type) ?? DATA_TYPES[0]
  );
}

function parseTypedValue(source: string, type: DataType): ParsedValue {
  if (!source.trim()) return { valid: false, message: "Enter a value." };

  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    return {
      valid: false,
      message: `Enter valid JSON, for example ${dataTypeDetails(type).placeholder}.`,
    };
  }

  const valid = (() => {
    switch (type) {
      case "INT":
        return typeof value === "number" && Number.isInteger(value);
      case "DOUBLE":
        return typeof value === "number" && Number.isFinite(value);
      case "BOOLEAN":
        return typeof value === "boolean";
      case "STRING":
        return typeof value === "string";
      case "INT_ARRAY":
        return (
          Array.isArray(value) &&
          value.every(
            (item) => typeof item === "number" && Number.isInteger(item),
          )
        );
      case "STRING_ARRAY":
        return (
          Array.isArray(value) &&
          value.every((item) => typeof item === "string")
        );
    }
  })();

  return valid
    ? { valid: true, value }
    : {
        valid: false,
        message: `Value must be ${dataTypeDetails(type).hint.toLowerCase()}.`,
      };
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-xs font-medium text-destructive">{message}</p>
  ) : null;
}

export default function CreateProgrammingTaskPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(DEFAULT_PRESET.title);
  const [instruction, setInstruction] = useState(DEFAULT_PRESET.instruction);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(
    DEFAULT_PRESET.skillLevel,
  );
  const [scope, setScope] = useState<TaskScope>(DEFAULT_PRESET.scope);
  const [methodName, setMethodName] = useState(DEFAULT_PRESET.methodName);
  const [returnType, setReturnType] = useState<DataType>(
    DEFAULT_PRESET.returnType,
  );
  const [parameters, setParameters] = useState<Parameter[]>(
    DEFAULT_PRESET.parameters,
  );
  const [testCases, setTestCases] = useState<EditableTestCase[]>(() =>
    toEditableTestCases(DEFAULT_PRESET.testCases),
  );
  const [orderInsensitiveOutput, setOrderInsensitiveOutput] = useState(
    DEFAULT_PRESET.orderInsensitiveOutput,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (key: string) => {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const clearTestErrors = (suffix: string) => {
    setErrors((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([key]) => !key.endsWith(suffix)),
      ),
    );
  };

  const applyPreset = (preset: ProgrammingTaskPreset) => {
    setTitle(preset.title);
    setInstruction(preset.instruction);
    setSkillLevel(preset.skillLevel);
    setScope(preset.scope);
    setMethodName(preset.methodName);
    setReturnType(preset.returnType);
    setParameters(preset.parameters.map((parameter) => ({ ...parameter })));
    setTestCases(toEditableTestCases(preset.testCases));
    setOrderInsensitiveOutput(preset.orderInsensitiveOutput);
    setErrors({});
    toast.success(`${preset.title} example loaded.`);
  };

  const resetToBlank = () => {
    setTitle("");
    setInstruction("");
    setSkillLevel("INTERMEDIATE");
    setScope("PRIVATE");
    setMethodName("solve");
    setReturnType("INT");
    setParameters([]);
    setTestCases(
      Array.from({ length: MINIMUM_TEST_CASES }, () => createEmptyTestCase(0)),
    );
    setOrderInsensitiveOutput(false);
    setErrors({});
  };

  const addParameter = () => {
    setParameters((current) => [...current, { name: "", type: "INT" }]);
    setTestCases((current) =>
      current.map((testCase) => ({
        ...testCase,
        inputs: [...testCase.inputs, ""],
      })),
    );
  };

  const updateParameter = (
    parameterIndex: number,
    update: Partial<Parameter>,
  ) => {
    setParameters((current) =>
      current.map((parameter, index) =>
        index === parameterIndex ? { ...parameter, ...update } : parameter,
      ),
    );
    clearError(`parameter-${parameterIndex}`);
    clearTestErrors(`-input-${parameterIndex}`);
  };

  const removeParameter = (parameterIndex: number) => {
    setParameters((current) =>
      current.filter((_, index) => index !== parameterIndex),
    );
    setTestCases((current) =>
      current.map((testCase) => ({
        ...testCase,
        inputs: testCase.inputs.filter((_, index) => index !== parameterIndex),
      })),
    );
    setErrors({});
  };

  const updateTestCaseInput = (
    testCaseIndex: number,
    parameterIndex: number,
    value: string,
  ) => {
    setTestCases((current) =>
      current.map((testCase, index) =>
        index === testCaseIndex
          ? {
              ...testCase,
              inputs: testCase.inputs.map((input, inputIndex) =>
                inputIndex === parameterIndex ? value : input,
              ),
            }
          : testCase,
      ),
    );
    clearError(`test-${testCaseIndex}-input-${parameterIndex}`);
  };

  const updateExpectedOutput = (testCaseIndex: number, value: string) => {
    setTestCases((current) =>
      current.map((testCase, index) =>
        index === testCaseIndex
          ? { ...testCase, expectedOutput: value }
          : testCase,
      ),
    );
    clearError(`test-${testCaseIndex}-output`);
  };

  const handleReturnTypeChange = (type: DataType) => {
    setReturnType(type);
    if (type !== "INT_ARRAY" && type !== "STRING_ARRAY")
      setOrderInsensitiveOutput(false);
    clearTestErrors("-output");
  };

  const validateAndBuildPayload = (): CreateProgrammingTask | null => {
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) nextErrors.title = "Enter a task title.";
    if (!instruction.trim())
      nextErrors.instruction = "Add instructions for the candidate.";
    if (!IDENTIFIER_PATTERN.test(methodName.trim())) {
      nextErrors.methodName =
        "Start with a letter or underscore, then use only letters, numbers, and underscores.";
    }

    const names = parameters.map((parameter) => parameter.name.trim());
    names.forEach((name, parameterIndex) => {
      if (!IDENTIFIER_PATTERN.test(name)) {
        nextErrors[`parameter-${parameterIndex}`] =
          "Enter a valid code identifier.";
      } else if (names.filter((candidate) => candidate === name).length > 1) {
        nextErrors[`parameter-${parameterIndex}`] =
          "Parameter names must be unique.";
      }
    });

    if (testCases.length < MINIMUM_TEST_CASES) {
      nextErrors.testCases = `Add at least ${MINIMUM_TEST_CASES} test cases.`;
    }

    const parsedTestCases = testCases.map(
      (testCase, testCaseIndex): ProgrammingTestCase => {
        const parsedInputs = parameters.map((parameter, parameterIndex) => {
          const result = parseTypedValue(
            testCase.inputs[parameterIndex] ?? "",
            parameter.type,
          );
          if (!result.valid) {
            nextErrors[`test-${testCaseIndex}-input-${parameterIndex}`] =
              result.message;
            return null;
          }
          return result.value;
        });
        const parsedOutput = parseTypedValue(
          testCase.expectedOutput,
          returnType,
        );
        if (!parsedOutput.valid)
          nextErrors[`test-${testCaseIndex}-output`] = parsedOutput.message;
        return {
          input: parsedInputs,
          expectedOutput: parsedOutput.valid ? parsedOutput.value : null,
        };
      },
    );

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;

    return {
      title: title.trim(),
      instruction: instruction.trim(),
      skillLevel,
      scope,
      methodName: methodName.trim(),
      parameters: parameters.map((parameter) => ({
        ...parameter,
        name: parameter.name.trim(),
      })),
      returnType,
      orderInsensitiveOutput,
      testCases: parsedTestCases,
    };
  };

  const publish = () => {
    const payload = validateAndBuildPayload();
    if (!payload) {
      toast.error("Review the highlighted fields before creating the task.");
      return;
    }

    startTransition(async () => {
      try {
        await createProgrammingTaskAction(payload);
        toast.success(
          "Programming assessment created. Attach it to a job post next.",
        );
        router.push("/post-job");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to create the programming assessment.",
        );
      }
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    publish();
  };

  const outputIsArray =
    returnType === "INT_ARRAY" || returnType === "STRING_ARRAY";
  const signature = `${methodName.trim() || "methodName"}(${parameters
    .map(
      (parameter) =>
        `${parameter.name.trim() || "parameter"}: ${parameter.type}`,
    )
    .join(", ")}) -> ${returnType}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16" noValidate>
      <PostTaskHeader
        onPublish={publish}
        isSubmitting={isPending}
        assessmentType="programming"
      />

      <section
        className="bg-card border border-border rounded-2xl p-5 shadow-2xs space-y-3"
        aria-labelledby="presets-heading"
      >
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Wand2 className="w-4 h-4 text-tomato-500" />
            <span id="presets-heading">Quick Starter Presets</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetToBlank}
          >
            <RotateCcw />
            Start blank
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PROGRAMMING_TASK_PRESETS.map((preset) => (
            <button
              key={preset.methodName}
              type="button"
              onClick={() => applyPreset(preset)}
              className="p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted active:scale-[0.98] transition-all text-left flex flex-col justify-between gap-1.5 cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-foreground group-hover:text-tomato-500 transition-colors">
                  {preset.title}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-card border border-border">
                  {preset.skillLevel}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground line-clamp-1">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <ChallengeInfoForm
            title={title}
            onTitleChange={(value) => {
              setTitle(value);
              clearError("title");
            }}
            skillLevel={skillLevel}
            onSkillLevelChange={setSkillLevel}
            scope={scope}
            onScopeChange={setScope}
            assessmentType="programming"
            titleError={errors.title}
          />

          <section
            className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5"
            aria-labelledby="instructions-heading"
          >
            <div className="border-b border-border pb-3">
              <h2
                id="instructions-heading"
                className="text-xs font-mono font-bold text-foreground uppercase tracking-wider"
              >
                2. Candidate Instructions
              </h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instruction">Problem statement</Label>
              <Textarea
                id="instruction"
                value={instruction}
                onChange={(event) => {
                  setInstruction(event.target.value);
                  clearError("instruction");
                }}
                className="min-h-36 rounded-xl"
                placeholder="Explain the problem, constraints, and expected behavior."
                aria-invalid={Boolean(errors.instruction)}
              />
              <p className="text-xs text-muted-foreground">
                Include edge cases and constraints without revealing private
                test data.
              </p>
              <FieldError message={errors.instruction} />
            </div>
          </section>

          <section
            className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5"
            aria-labelledby="contract-heading"
          >
            <div className="border-b border-border pb-3">
              <h2
                id="contract-heading"
                className="text-xs font-mono font-bold text-foreground uppercase tracking-wider"
              >
                3. Method Contract
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="method">Method name</Label>
                <Input
                  id="method"
                  value={methodName}
                  onChange={(event) => {
                    setMethodName(event.target.value);
                    clearError("methodName");
                  }}
                  placeholder="twoSum"
                  className="rounded-xl font-mono"
                  aria-invalid={Boolean(errors.methodName)}
                />
                <FieldError message={errors.methodName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="return-type">Return type</Label>
                <select
                  id="return-type"
                  value={returnType}
                  onChange={(event) =>
                    handleReturnTypeChange(event.target.value as DataType)
                  }
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-tomato-500 focus:ring-2 focus:ring-tomato-500/20"
                >
                  {DATA_TYPES.map((dataType) => (
                    <option key={dataType.value} value={dataType.value}>
                      {dataType.label} ({dataType.value})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-xs font-semibold">Parameters</h3>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Parameter order defines every test case input.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={addParameter}
                >
                  <CirclePlus />
                  Add parameter
                </Button>
              </div>

              {parameters.map((parameter, parameterIndex) => (
                <div
                  key={parameterIndex}
                  className="grid items-start gap-3 rounded-xl border border-border bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_13rem_auto]"
                >
                  <div className="space-y-2">
                    <Label htmlFor={`parameter-${parameterIndex}`}>
                      Parameter {parameterIndex + 1} name
                    </Label>
                    <Input
                      id={`parameter-${parameterIndex}`}
                      value={parameter.name}
                      onChange={(event) =>
                        updateParameter(parameterIndex, {
                          name: event.target.value,
                        })
                      }
                      placeholder="nums"
                      className="rounded-xl font-mono"
                      aria-invalid={Boolean(
                        errors[`parameter-${parameterIndex}`],
                      )}
                    />
                    <FieldError
                      message={errors[`parameter-${parameterIndex}`]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`parameter-type-${parameterIndex}`}>
                      Type
                    </Label>
                    <select
                      id={`parameter-type-${parameterIndex}`}
                      value={parameter.type}
                      onChange={(event) =>
                        updateParameter(parameterIndex, {
                          type: event.target.value as DataType,
                        })
                      }
                      className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-tomato-500 focus:ring-2 focus:ring-tomato-500/20"
                    >
                      {DATA_TYPES.map((dataType) => (
                        <option key={dataType.value} value={dataType.value}>
                          {dataType.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6 rounded-xl"
                    aria-label={`Remove parameter ${parameterIndex + 1}`}
                    onClick={() => removeParameter(parameterIndex)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}

              {parameters.length === 0 && (
                <p className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                  This method has no parameters. Test cases will only need
                  expected outputs.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-5 rounded-xl border border-border bg-muted/20 p-4">
              <div>
                <Label htmlFor="order-insensitive">
                  Ignore array item order
                </Label>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {outputIsArray
                    ? "Use when any ordering of the expected items is correct."
                    : "Available only for array return types."}
                </p>
              </div>
              <Switch
                id="order-insensitive"
                checked={orderInsensitiveOutput}
                onCheckedChange={setOrderInsensitiveOutput}
                disabled={!outputIsArray}
              />
            </div>
          </section>

          <section
            className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5"
            aria-labelledby="tests-heading"
          >
            <div className="flex flex-col justify-between gap-3 border-b border-border pb-3 sm:flex-row sm:items-center">
              <div>
                <h2
                  id="tests-heading"
                  className="text-xs font-mono font-bold text-foreground uppercase tracking-wider"
                >
                  4. Private Test Cases
                </h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  At least five cases are required. The first three are shown as
                  examples.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() =>
                  setTestCases((current) => [
                    ...current,
                    createEmptyTestCase(parameters.length),
                  ])
                }
              >
                <CirclePlus />
                Add case
              </Button>
            </div>

            <Alert className="bg-muted/30">
              <Info />
              <AlertTitle>Use JSON values</AlertTitle>
              <AlertDescription>
                Quote strings like <code>&quot;hello&quot;</code>. Enter arrays
                like <code>[1, 2]</code> or{" "}
                <code>[&quot;a&quot;, &quot;b&quot;]</code>.
              </AlertDescription>
            </Alert>
            <FieldError message={errors.testCases} />

            <div className="space-y-4">
              {testCases.map((testCase, testCaseIndex) => (
                <article
                  key={testCaseIndex}
                  className="rounded-xl border border-border bg-muted/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold">
                        Test case {testCaseIndex + 1}
                      </h3>
                      {testCaseIndex < 3 && (
                        <span className="rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Example
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-xl"
                      aria-label={`Remove test case ${testCaseIndex + 1}`}
                      disabled={testCases.length <= MINIMUM_TEST_CASES}
                      onClick={() => {
                        setTestCases((current) =>
                          current.filter((_, index) => index !== testCaseIndex),
                        );
                        setErrors({});
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>

                  {parameters.length > 0 ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {parameters.map((parameter, parameterIndex) => {
                        const key = `test-${testCaseIndex}-input-${parameterIndex}`;
                        return (
                          <div key={parameterIndex} className="space-y-2">
                            <Label
                              htmlFor={key}
                              className="flex items-center justify-between gap-2"
                            >
                              <span>
                                {parameter.name ||
                                  `Parameter ${parameterIndex + 1}`}
                              </span>
                              <code className="text-[10px] font-normal text-muted-foreground">
                                {parameter.type}
                              </code>
                            </Label>
                            <Input
                              id={key}
                              value={testCase.inputs[parameterIndex] ?? ""}
                              onChange={(event) =>
                                updateTestCaseInput(
                                  testCaseIndex,
                                  parameterIndex,
                                  event.target.value,
                                )
                              }
                              placeholder={
                                dataTypeDetails(parameter.type).placeholder
                              }
                              className="rounded-xl font-mono text-xs"
                              spellCheck={false}
                              aria-invalid={Boolean(errors[key])}
                            />
                            <FieldError message={errors[key]} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-[11px] text-muted-foreground">
                      No input values for this method.
                    </p>
                  )}

                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    <Label
                      htmlFor={`test-${testCaseIndex}-output`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span>Expected output</span>
                      <code className="text-[10px] font-normal text-muted-foreground">
                        {returnType}
                      </code>
                    </Label>
                    <Input
                      id={`test-${testCaseIndex}-output`}
                      value={testCase.expectedOutput}
                      onChange={(event) =>
                        updateExpectedOutput(testCaseIndex, event.target.value)
                      }
                      placeholder={dataTypeDetails(returnType).placeholder}
                      className="rounded-xl font-mono text-xs"
                      spellCheck={false}
                      aria-invalid={Boolean(
                        errors[`test-${testCaseIndex}-output`],
                      )}
                    />
                    <FieldError
                      message={errors[`test-${testCaseIndex}-output`]}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => router.push("/post-task")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-tomato-500 text-white hover:bg-tomato-600"
              disabled={isPending}
            >
              {isPending ? "Creating task..." : "Create task"}
            </Button>
          </div>
        </div>

        <aside
          className="space-y-6 lg:col-span-5"
          aria-label="Programming task preview"
        >
          <section className="sticky top-6 overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="flex size-6 items-center justify-center rounded-lg bg-tomato-500 text-white">
                  {"{}"}
                </span>
                Candidate preview
              </div>
              <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[10px] font-bold">
                {skillLevel}
              </span>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {title.trim() || "Untitled programming task"}
                </h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {scope === "PUBLIC"
                    ? "Public challenge"
                    : "Private assessment"}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground">
                  Problem
                </h3>
                <p className="mt-2 whitespace-pre-wrap rounded-xl border border-border bg-muted/20 p-4 text-xs leading-5 text-foreground/90">
                  {instruction.trim() ||
                    "Candidate instructions will appear here."}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground">
                  Method signature
                </h3>
                <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-muted/30 p-3">
                  <code className="text-xs text-foreground">{signature}</code>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-muted-foreground">
                    Example cases
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    3 visible
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                  {testCases.slice(0, 3).map((testCase, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-border bg-muted/20 p-3 font-mono text-[11px]"
                    >
                      <p className="truncate">
                        <strong className="text-muted-foreground">
                          Input:{" "}
                        </strong>
                        {testCase.inputs.length
                          ? `[${testCase.inputs.join(", ")}]`
                          : "[]"}
                      </p>
                      <p className="mt-1 truncate">
                        <strong className="text-muted-foreground">
                          Expected:{" "}
                        </strong>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {testCase.expectedOutput || "Not set"}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
            <h2 className="text-xs font-bold text-foreground">
              Backend-supported value types
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {DATA_TYPES.map((dataType) => (
                <div key={dataType.value} className="flex items-center gap-3">
                  <Check className="size-3.5 shrink-0 text-tomato-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{dataType.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {dataType.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
