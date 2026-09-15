import test from "node:test";
import assert from "node:assert/strict";
import { createBackendTokenRefresher } from "../lib/backend-token-refresh.ts";
import { applicationLoadError } from "../lib/application-load-error.ts";
import { accessTokenExpiry } from "../lib/access-token-expiry.ts";

const token = {
  accessToken: "expired-access",
  refreshToken: "refresh-one",
  user: { id: "candidate-one" },
};
const success = () =>
  Response.json({ accessToken: "fresh-access", refreshToken: "refresh-two" });

test("backend JWT expiry controls refresh timing", () => {
  const expiresAt = 2_000_000_000;
  const jwt = `header.${Buffer.from(JSON.stringify({ exp: expiresAt })).toString("base64url")}.signature`;
  assert.equal(accessTokenExpiry(jwt, 1000), expiresAt * 1000 - 60_000);
  assert.equal(accessTokenExpiry("not-a-jwt", 1000), 1000);
});

test("concurrent refreshes share one rotation and preserve each caller's metadata", async () => {
  let requests = 0;
  const refresh = createBackendTokenRefresher(
    "https://example.test/api",
    async () => {
      requests++;
      return success();
    },
  );
  const results = await Promise.all([
    refresh(token),
    refresh({ ...token, user: { id: "candidate-one", name: "Updated name" } }),
    refresh(token),
  ]);
  assert.equal(requests, 1);
  assert.ok(
    results.every(
      (result) =>
        result.accessToken === "fresh-access" &&
        result.refreshToken === "refresh-two",
    ),
  );
  assert.equal(results[1].user.name, "Updated name");
  assert.equal((await refresh(token)).accessToken, "fresh-access");
  assert.equal(requests, 1);
});

test("different refresh credentials never share a cached response", async () => {
  let requests = 0;
  const refresh = createBackendTokenRefresher(
    "https://example.test/api",
    async () => {
      requests++;
      return Response.json({
        accessToken: `access-${requests}`,
        refreshToken: `refresh-${requests}`,
      });
    },
  );
  const first = await refresh(token);
  const second = await refresh({
    ...token,
    refreshToken: "different-credential",
  });
  assert.notEqual(first.accessToken, second.accessToken);
  assert.equal(requests, 2);
});

test("expired refresh credentials do not keep an expired access token alive", async () => {
  const refresh = createBackendTokenRefresher(
    "https://example.test/api",
    async () => new Response(null, { status: 401 }),
  );
  const result = await refresh(token);
  assert.equal(result.accessToken, undefined);
  assert.equal(result.refreshToken, undefined);
  assert.equal(result.accessTokenExpires, 0);
  assert.equal(result.error, "RefreshAccessTokenError");
});

test("temporary failures preserve the refresh token and can recover on retry", async () => {
  let clock = 1000;
  let requests = 0;
  const refresh = createBackendTokenRefresher(
    "https://example.test/api",
    async () =>
      ++requests === 1 ? new Response(null, { status: 503 }) : success(),
    () => clock,
  );
  const result = await refresh(token);
  assert.equal(result.accessToken, undefined);
  assert.equal(result.refreshToken, token.refreshToken);
  assert.equal(result.error, "RefreshAccessTokenTemporaryError");
  clock += 6000;
  const recovered = await refresh(result);
  assert.equal(recovered.accessToken, "fresh-access");
  assert.equal(recovered.error, undefined);
});

test("network and malformed responses remain retryable", async () => {
  for (const request of [
    async () => {
      throw new Error("offline");
    },
    async () => Response.json({}),
    async () => new Response("not json"),
  ]) {
    const result = await createBackendTokenRefresher(
      "https://example.test/api",
      request,
    )(token);
    assert.equal(result.error, "RefreshAccessTokenTemporaryError");
    assert.equal(result.refreshToken, token.refreshToken);
  }
});

test("application loading separates sign-in failures from retryable server failures", () => {
  assert.equal(applicationLoadError({ status: 401 }).signIn, true);
  assert.equal(applicationLoadError({ status: 403 }).signIn, true);
  assert.equal(applicationLoadError({ status: 500 }).signIn, false);
  assert.equal(applicationLoadError(new Error("offline")).signIn, false);
  assert.ok(
    !applicationLoadError({
      status: 500,
      detail: "private stack trace",
    }).message.includes("private"),
  );
});
