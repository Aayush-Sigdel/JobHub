# Task API reference

Frontend integration reference for `TaskController`. Base URL: `/api/task`.

## Authentication and common formats

All endpoints require `Authorization: Bearer <access-token>`. The user is taken
from that token—do not send a user ID. There is currently no role-based task
authorization.

JSON endpoints use `Content-Type: application/json`. All IDs are UUID strings.

| Enum | Valid values |
| --- | --- |
| `skillLevel` | `BEGINNER`, `INTERMEDIATE`, `EXPERT` |
| `scope` | `PUBLIC`, `PRIVATE` |
| `taskType` | `DESIGN`, `SQL`, `PROGRAMMING` |
| `language` | `JAVA`, `PYTHON` |

Enum strings are uppercase and case-sensitive.

Application exceptions have this shape:

```json
{
  "timestamp": "2026-08-14T08:45:12.438Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Task must have at least one assertion"
}
```

Malformed JSON, unknown enum values, missing non-null JSON fields, multipart
binding problems, and security failures are framework-generated; the frontend
should not rely on their body shape. There are no DTO bean-validation rules for
blank strings, lengths, SQL size, upload size, MIME type, or a lower score bound.

## Design tasks

### Create

`POST /design/create` with `multipart/form-data`.

| Form field | Type | Required | Rules |
| --- | --- | --- | --- |
| `title` | text | Yes | Stored as supplied. |
| `image` | file | Yes | Must be readable by Java ImageIO and exactly 400×300 pixels. |
| `minimumMatchingScore` | number | Yes | Percentage; values above `100` are rejected. Negative values are currently accepted. |
| `instructions` | text | Yes | Stored as supplied. |
| `skillLevel` | enum | Yes | Shared values above. |
| `scope` | enum | Yes | Shared values above. |

Use `FormData` and do not manually set its `Content-Type` boundary.

```ts
const form = new FormData();
form.append("title", "Recreate the profile card");
form.append("image", targetImageFile);
form.append("minimumMatchingScore", "92");
form.append("instructions", "Recreate the reference with HTML and CSS.");
form.append("skillLevel", "INTERMEDIATE");
form.append("scope", "PUBLIC");

await fetch("/api/task/design/create", {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
  body: form
});
```

Success: `201 Created`.

```json
{
  "id": "a6db053d-0336-4cc1-8063-2eb2e0889592",
  "title": "Recreate the profile card",
  "imageBytes": "iVBORw0KGgoAAAANSUhEUg...",
  "imageContentType": "image/png",
  "minimumMatchingScore": 92.0,
  "instructions": "Recreate the reference with HTML and CSS.",
  "skillLevel": "INTERMEDIATE",
  "scope": "PUBLIC",
  "createdBy": "c2e14375-e235-4e1d-9a5a-7427202b7de4"
}
```

`imageBytes` is Base64 (the DTO is a Java `ByteArray`). Display it with:

```ts
const imageUrl = `data:${task.imageContentType};base64,${task.imageBytes}`;
```

Expected application errors:

| Status | Message | Condition |
| --- | --- | --- |
| `400` | `Minimum matching score can't be more than 100 percent` | Score is greater than 100. |
| `400` | `Invalid image` | The uploaded file cannot be decoded as an image. |
| `400` | `Image resolution should be 400x300` | Image dimensions differ from 400×300. |
| `404` | `User not found` | The token user no longer exists. |

### Read

`GET /design/get` returns all design tasks created by the current user.

`GET /design/getAll` returns the current user's design tasks plus every public
design task. Other users' private tasks are omitted.

Both return `200 OK` and an array of the design-task response above (or `[]`).
Because each object contains the Base64 image, list responses can be large.

### Submit a design task

`POST /submit`

```json
{
  "taskId": "a6db053d-0336-4cc1-8063-2eb2e0889592",
  "taskType": "DESIGN",
  "code": "<!doctype html><html><body><main>...</main></body></html>"
}
```

`code` must be non-null; `codes` is ignored. The HTML is rendered by headless
Chromium at a 400×300 viewport after a fixed 300 ms wait. Scoring compares the
rendered screenshot with the target: a pixel matches when its total RGB
difference is at most 30. `passed` is true when:

```text
achievedScore >= minimumMatchingScore - 3
```

So a required score of 92 accepts 89 or above. `requiredScore` in the response
is still 92, not the tolerance-adjusted score.

## SQL tasks

### Create

`POST /sql/create`

```json
{
  "title": "Find High Earning Employees",
  "setupQueries": [
    "CREATE TABLE employees (id INT PRIMARY KEY, name VARCHAR(100), department VARCHAR(50), salary DECIMAL(10,2));",
    "INSERT INTO employees VALUES (1, 'Alice Johnson', 'Sales', 50000.00);",
    "INSERT INTO employees VALUES (2, 'Bob Smith', 'Sales', 55000.00);",
    "INSERT INTO employees VALUES (3, 'Carol White', 'Engineering', 70000.00);",
    "INSERT INTO employees VALUES (4, 'David Lee', 'Engineering', 72000.00);",
    "INSERT INTO employees VALUES (5, 'Eve Davis', 'Marketing', 48000.00);",
    "INSERT INTO employees VALUES (6, 'Frank Miller', 'Engineering', 65000.00);"
  ],
  "assertions": [
    "(SELECT COUNT(*) FROM candidate_result) = 3;",
    "(SELECT COUNT(*) FROM candidate_result WHERE salary <= 60000.00) = 0;",
    "(SELECT COUNT(*) FROM candidate_result WHERE name='Carol White' AND salary=70000.00) = 1;",
    "(SELECT COUNT(*) FROM candidate_result WHERE name='David Lee' AND salary=72000.00) = 1;",
    "(SELECT COUNT(*) FROM candidate_result WHERE name='Frank Miller' AND salary=65000.00) = 1;"
  ],
  "instructions": "Write a SQL query to find all employees whose salary is greater than 60000. Return their name and salary.\n\nTable: employees\n- id (INT, primary key)\n- name (VARCHAR)\n- department (VARCHAR)\n- salary (DECIMAL)",
  "skillLevel": "BEGINNER",
  "scope": "PUBLIC"
}
```

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `title` | string | Yes | Stored as supplied. |
| `setupQueries` | string array | Yes | Executes in order before grading; an empty array is accepted. |
| `assertions` | string array | Yes | Must contain at least one item. Each is evaluated as `SELECT (<assertion>) AS result`. |
| `instructions` | string | Yes | Returned to solver clients. |
| `skillLevel`, `scope` | enum | Yes | Shared values above. |

Success: `201 Created`.

```json
{
    "id": "44b80e2f-2f6e-4909-8bcf-2010d4d01cc7",
    "title": "Find High Earning Employees",
    "instructions": "Write a SQL query to find all employees whose salary is greater than 60000. Return their name and salary.\n\nTable: employees\n- id (INT, primary key)\n- name (VARCHAR)\n- department (VARCHAR)\n- salary (DECIMAL)",
    "skillLevel": "BEGINNER",
    "scope": "PUBLIC",
    "createdBy": "c3de09b5-a653-47f2-904b-e8624c064899"
}
```

Expected errors: `400 Task must have at least one assertion` for an empty
`assertions` array, or `404 User not found` when the token user no longer exists.

### Read

`GET /sql/get` returns all SQL tasks created by the current user.

`GET /sql/getAll` returns the current user's SQL tasks plus all public SQL
tasks. Both return `200 OK` and an array of the SQL response above (or `[]`).

`setupQueries` and `assertions` are deliberately absent from creation and read
responses. The UI must use `instructions`; it cannot reconstruct the private
setup/tests from this API.

### Test or submit an SQL task

Use `POST /evaluate` for a test run and `POST /submit` for the final recorded
submission. Both endpoints accept the same payload:

```json
{
  "taskId": "44b80e2f-2f6e-4909-8bcf-2010d4d01cc7",
  "taskType": "SQL",
  "codes": [
    "SELECT name, salary FROM employees WHERE salary > 60000;"
  ]
}
```

`codes` must be a nonempty, ordered string array; `code` is ignored. A new H2
in-memory database runs each attempt. The setup executes first, then candidate
statements execute in order.

`POST /evaluate` returns the score without creating a `task_submissions` row;
its response has a null `id`. `POST /submit` evaluates again and saves the
result, including failed and errored attempts.

- Candidate statements beginning with `SELECT` or `WITH` become tables: first
  `candidate_result`, then `candidate_result_2`, etc. A final semicolon is
  ignored for this detection.
- Other statements run directly, so DDL/DML solutions are supported.
- Candidate statements and assertions each have a 5-second JDBC timeout.
- All assertions must evaluate to boolean `true` to pass.
- `achievedScore` is the count of passed assertions and `requiredScore` is the
  assertion count. These are numeric counts (for example `1.0` / `2.0`), not
  percentages.

## Evaluation and submission responses

Evaluation and submission return `200 OK` when grading is reached:

```json
{
  "id": "d7239f60-b248-4d66-8d3d-57de388cf169",
  "taskId": "44b80e2f-2f6e-4909-8bcf-2010d4d01cc7",
  "taskType": "SQL",
  "passed": true,
  "achievedScore": 5.0,
  "requiredScore": 5.0,
  "message": null
}
```

For `POST /evaluate`, `id` is null because the result is not recorded. For
`POST /submit`, `id` identifies the saved submission. Neither response includes
individual assertion/test results or a submission-history endpoint.

SQL setup/candidate-query execution errors are converted to a failed `200`
result with `achievedScore: 0.0` and the database error text in `message`.
Evaluation errors are not saved. Final submissions are saved. Display `message`
as plain text. Assertion errors only count as failures; their individual
messages are not returned.

Programming compile/runtime/judge errors are also returned as `200` with
`passed: false`, `achievedScore: 0.0`, and `message` populated. They are not
saved by `/evaluate`, and are saved only when sent through `/submit`.

| Status | Message/body | Condition |
| --- | --- | --- |
| `400` | `The 'code' field should be present while submitting this task` | `DESIGN` submission has null or omitted `code`. Empty string is accepted. |
| `400` | `The 'codes' must not be null or empty and must contain at least one item` | SQL omits `codes`, sends null, or sends `[]`. |
| `400` | `The 'language' field should be present while submitting this task` | `PROGRAMMING` submission omits or nulls `language`. |
| `404` | `Task not found` | ID does not exist for the selected task type. |
| `404` | `User not found` | Token user no longer exists after task lookup. |

## Important current limitations

- Submission lookup checks only task ID and type, not scope or ownership. An
  authenticated user who knows a private task ID can currently submit it.
- There are no update/delete APIs, pagination, sorting, filters, task detail
  endpoint, submission history endpoint, or per-test feedback endpoint.
- A frontend should treat a failed SQL query as a successful HTTP grading
  response (`200`, `passed: false`), not necessarily as a network/API failure.

## Programming tasks

### Create

`POST /programming/create`

```json
{
  "title": "Square a Number",
  "instruction": "Write a method that takes an integer n and returns its square (n * n).",
  "skillLevel": "BEGINNER",
  "scope": "PUBLIC",
  "methodName": "square",
  "parameters": [
    { "name": "n", "type": "INT" }
  ],
  "returnType": "INT",
  "orderInsensitiveOutput": false,
  "testCases": [
    { "input": [4], "expectedOutput": 16 },
    { "input": [7], "expectedOutput": 49 },
    { "input": [0], "expectedOutput": 0 },
    { "input": [-5], "expectedOutput": 25 },
    { "input": [12], "expectedOutput": 144 }
  ]
}
```

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `title` | string | Yes | Stored as supplied. |
| `instruction` | string | Yes | Stored as `instructions` in response payloads. |
| `skillLevel`, `scope` | enum | Yes | Shared enum values above. |
| `methodName` | string | Yes | Must match `^[A-Za-z_][A-Za-z0-9_]*$`. |
| `parameters` | array | Yes | Each `name` must match identifier regex; duplicate parameter names are rejected. |
| `parameters[].type` | enum | Yes | `INT`, `INT_ARRAY`, `STRING`, `STRING_ARRAY`, `DOUBLE`, `BOOLEAN`. |
| `returnType` | enum | Yes | Same enum as parameter type. |
| `orderInsensitiveOutput` | boolean | Yes | If `true`, array outputs are compared ignoring order. |
| `testCases` | array | Yes | Minimum 5 required. Each test case input count must equal parameter count and JSON types must match declared parameter/return types. |

Success: `201 Created`.

```json
{
  "id": "27a2c4d7-913a-4656-8a95-fd2bd836e489",
  "title": "Square a Number",
  "instructions": "Write a method that takes an integer n and returns its square (n * n).",
  "skillLevel": "BEGINNER",
  "scope": "PUBLIC",
  "methodName": "square",
  "parameters": [
    { "name": "n", "type": "INT" }
  ],
  "returnType": "INT",
  "exampleTestCases": [
    { "input": [4], "expectedOutput": 16 },
    { "input": [7], "expectedOutput": 49 },
    { "input": [0], "expectedOutput": 0 }
  ],
  "orderInsensitiveOutput": false
}
```

Only `exampleTestCases` are returned (currently capped at 3). Full hidden test
cases are stored server-side.

Expected application errors:

| Status | Message | Condition |
| --- | --- | --- |
| `400` | `methodName '<value>' is not a valid identifier` | `methodName` fails identifier regex. |
| `400` | `parameter name '<value>' is not a valid identifier` | A parameter name fails identifier regex. |
| `400` | `Duplicate parameter names: [<name>]` | Duplicate parameter names in request. |
| `400` | `Task must have minimum 5 test cases` | Fewer than 5 test cases supplied. |
| `400` | `Test case <i> has <x> input values but method expects <y>` | Test-case arity mismatch. |
| `400` | `Test case <i>, input[<j>] does not match declared type <TYPE>` | Input type does not match parameter type. |
| `400` | `Test case <i>, expectedOutput does not match declared type <TYPE>` | Expected-output type does not match `returnType`. |
| `404` | `User not found` | Token user no longer exists. |

### Read

`GET /programming/get` returns all programming tasks created by the current user.

`GET /programming/getAll` returns the current user's programming tasks plus all
public programming tasks.

Both return `200 OK` and an array of `ProgrammingTaskDto` (or `[]`). As with
create response, only `exampleTestCases` are exposed (max 3), not the full test
set used for judging.

### Test or submit a programming task

Use `POST /evaluate` to run the hidden cases without recording the result. Use
`POST /submit` only after the candidate confirms the final submission. Both
accept the same payload:

```json
{
  "taskId": "27a2c4d7-913a-4656-8a95-fd2bd836e489",
  "taskType": "PROGRAMMING",
  "language": "JAVA",
  "code": "class Solution {\n    public int square(int n) {\n        return n * n;\n    }\n}"
}
```

`code` and `language` are required for `PROGRAMMING`. `codes` is ignored.
The evaluation response has a null `id`; the final submission response contains
the saved submission ID. Final submission evaluates the code again before
saving it.

### Supported languages and how judging works

- Declared language enum values are `JAVA` and `PYTHON`.
- Current executable support is **JAVA only**. `PYTHON` currently has no
  executor implementation.
- Judge flow (JAVA):
  - Writes `Solution.java` (candidate), generated `Driver.java`, and
    `testcases.json` into a temp folder.
  - Runs compile and execution inside Docker image `coderunner-java`.
  - Runtime sandbox settings: memory `256m`, CPU `0.5`, PID limit `128`,
    no network, read-only FS, tmpfs `/tmp`.
  - Compile timeout: 10 seconds. Run timeout: 10 seconds.
  - Driver prints one JSON output line per test case; backend parses each line
    and compares with expected output.
  - Numeric compare uses epsilon (`1e-6`); array compare respects
    `orderInsensitiveOutput`.

Success example:

```json
{
  "id": "d7239f60-b248-4d66-8d3d-57de388cf169",
  "taskId": "27a2c4d7-913a-4656-8a95-fd2bd836e489",
  "taskType": "PROGRAMMING",
  "passed": true,
  "achievedScore": 5.0,
  "requiredScore": 5.0,
  "message": null
}
```

Scoring:

- `requiredScore` = total hidden test-case count for the task.
- `achievedScore` = number of passed test cases.
- `passed` is true only when all test cases pass.

Programming failure behavior:

- Compile errors, runtime errors, timeouts, unsupported language, or output
  cardinality mismatches are returned as `200` with `passed: false`,
  `achievedScore: 0.0`, and an error `message`.
- If output lines are present but one line is not valid JSON, only that case is
  marked failed (not a hard failure for all cases).

Programming-specific HTTP errors:

| Status | Message | Condition |
| --- | --- | --- |
| `400` | `The 'code' field should be present while submitting this task` | `code` omitted or null. |
| `400` | `The 'language' field should be present while submitting this task` | `language` omitted or null. |
| `404` | `Task not found` | Task ID not found under `PROGRAMMING`. |
| `404` | `User not found` | Solver user missing when persisting a successful judged submission. |
