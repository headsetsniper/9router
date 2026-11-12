import { describe, expect, it } from "vitest";
import { MAX_RATE_LIMIT_COOLDOWN_MS } from "../../open-sse/config/errorConfig.js";
import { checkFallbackError } from "../../open-sse/services/accountFallback.js";

const notSupported = JSON.stringify({
  error: { message: "The requested model is not supported.", code: "model_not_supported", param: "model", type: "invalid_request_error" },
});

describe("GitHub model_not_supported account fallback", () => {
  it("locks the unentitled GitHub account for that model and rotates", () => {
    expect(checkFallbackError(400, notSupported, 0, "github")).toMatchObject({
      shouldFallback: true,
      cooldownMs: MAX_RATE_LIMIT_COOLDOWN_MS,
    });
  });

  it("keeps other GitHub 400s request-scoped", () => {
    const temp = '{"error":{"message":"Unsupported parameter: \'temperature\' is not supported with this model.","code":"invalid_request_body"}}';
    expect(checkFallbackError(400, temp, 0, "github")).toMatchObject({ shouldFallback: false, requestScoped: true });
  });

  it("does not apply to other providers", () => {
    expect(checkFallbackError(400, notSupported, 0, "openai")).toMatchObject({ shouldFallback: false, requestScoped: true });
  });
});
