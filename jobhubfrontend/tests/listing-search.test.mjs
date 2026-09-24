import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../lib/actions/search.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  },
).outputText;
function search(fetchWithAuth) {
  const exports = {};
  new Function("require", "exports", source)((id) => {
    assert.equal(id, "@/lib/service-api");
    return { fetchWithAuth };
  }, exports);
  return exports.searchApplicantListings;
}

test("opening or clearing search requests the latest listings without a query filter", async () => {
  for (const term of ["", "  "]) {
    const paths = [];
    const run = search(async (path) => {
      paths.push(new URL(path, "http://localhost"));
      return [
        { id: "newest", title: "Newest listing", workplaceType: "REMOTE" },
        { id: "older", title: "Older listing", workplaceType: "REMOTE" },
      ];
    });
    const result = await run(term);
    assert.equal(paths.length, 2);
    assert.equal(paths[0].searchParams.get("sortBy"), "date");
    assert.equal(paths[1].searchParams.get("status"), "RECRUITING");
    for (const path of paths)
      assert.equal(path.searchParams.has("query"), false);
    for (const group of Object.values(result))
      assert.deepEqual(
        group.items.map((item) => item.id),
        ["newest", "older"],
      );
  }
});
test("search uses both supported endpoints, encodes keywords, and returns listing links", async () => {
  const paths = [];
  const run = search(async (path, options) => {
    paths.push(path);
    assert.equal(options.cache, "no-store");
    if (path.startsWith("/jobs?"))
      return [
        {
          id: "job-1",
          title: "C++ developer",
          companyName: "Studio",
          location: "Kathmandu",
        },
      ];
    return [
      {
        id: "project-1",
        title: "C++ study group",
        ownerName: "Owner",
        workplaceType: "REMOTE",
      },
    ];
  });
  const result = await run("  C++ & design  ");
  assert.equal(paths.length, 2);
  for (const path of paths)
    assert.equal(
      new URL(path, "http://localhost").searchParams.get("query"),
      "C++ & design",
    );
  assert.equal(
    new URL(paths[1], "http://localhost").searchParams.get("status"),
    "RECRUITING",
  );
  assert.equal(result.jobs.items[0].href, "/find-job/job-1");
  assert.equal(result.jobs.items[0].subtitle, "Studio · Kathmandu");
  assert.equal(
    result.projects.items[0].href,
    "/collaborators/projects/project-1",
  );
});
test("one unavailable endpoint keeps the other results and does not leak API errors", async () => {
  for (const failed of ["/jobs?", "/collab/projects?"]) {
    const run = search(async (path) => {
      if (path.startsWith(failed))
        throw new Error("private upstream stack trace");
      return [
        {
          id: "available",
          title: "Available listing",
          companyName: "Company",
          workplaceType: "REMOTE",
        },
      ];
    });
    const result = await run("developer");
    const failure = failed.startsWith("/jobs") ? result.jobs : result.projects;
    const success = failed.startsWith("/jobs") ? result.projects : result.jobs;
    assert.equal(success.items.length, 1);
    assert.match(failure.error, /couldn’t be loaded/);
    assert.doesNotMatch(JSON.stringify(result), /private upstream/);
  }
});
test("search caps preview rows while retaining the total for View all", async () => {
  const run = search(async () =>
    Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      title: `Listing ${i}`,
      workplaceType: "REMOTE",
    })),
  );
  const result = await run("listing");
  for (const group of Object.values(result)) {
    assert.equal(group.items.length, 5);
    assert.equal(group.total, 12);
  }
});
