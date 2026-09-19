import test from "node:test";
import assert from "node:assert/strict";
import {
  clampPage,
  pageCount,
  paginateCandidates,
} from "../lib/candidate-pagination.ts";

test("candidate pagination returns the requested page", () => {
  const result = paginateCandidates(
    Array.from({ length: 23 }, (_, index) => index + 1),
    2,
    10,
  );

  assert.deepEqual(result.items, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  assert.equal(result.page, 2);
  assert.equal(result.pageCount, 3);
  assert.equal(result.start, 10);
  assert.equal(result.end, 20);
});

test("candidate pagination clamps empty and out-of-range pages", () => {
  assert.equal(pageCount(0, 10), 1);
  assert.equal(clampPage(99, 23, 10), 3);
  assert.equal(clampPage(0, 23, 10), 1);
  assert.deepEqual(paginateCandidates([], 4, 10).items, []);
});
