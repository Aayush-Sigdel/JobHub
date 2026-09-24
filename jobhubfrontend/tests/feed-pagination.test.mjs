import test from "node:test";
import assert from "node:assert/strict";
import { paginateFeed } from "../lib/feed-pagination.ts";

test("feed pages cover every job once, including a partial final page", () => {
  const jobs = Array.from({ length: 23 }, (_, id) => ({ id }));
  const pages = [1, 2, 3, 4].map((page) => paginateFeed(jobs, page));
  assert.deepEqual(pages.map((page) => page.items.length), [6, 6, 6, 5]);
  assert.deepEqual(pages.flatMap((page) => page.items), jobs);
  assert.equal(pages[3].start, 18);
  assert.equal(pages[3].end, 23);
});

test("removing the last saved job on a page returns to a populated page", () => {
  const jobs = Array.from({ length: 7 }, (_, id) => id);
  assert.deepEqual(paginateFeed(jobs, 2).items, [6]);
  const updated = paginateFeed(jobs.slice(0, 6), 2);
  assert.equal(updated.page, 1);
  assert.equal(updated.items.length, 6);
});

test("empty feeds and invalid page requests remain in bounds", () => {
  assert.deepEqual(paginateFeed([], 99).items, []);
  for (const page of [0, -1, NaN, Infinity]) {
    assert.equal(paginateFeed([1, 2], page).page, 1);
  }
  assert.equal(paginateFeed([], 99).end, 0);
});

test("large feeds keep numbered controls bounded and include the current page", () => {
  const jobs = Array.from({ length: 120 }, (_, id) => id);
  for (let page = 1; page <= 20; page++) {
    const result = paginateFeed(jobs, page);
    assert.equal(result.pages.length, 5);
    assert.ok(result.pages.includes(page));
    assert.ok(result.pages.every((number) => number >= 1 && number <= 20));
  }
});
