/**
 * Regression test for #1062:
 * GitHub Copilot's /responses endpoint only serves OpenAI (gpt/codex) models.
 * Gemini/Claude models must never be routed/escalated there, otherwise they
 * fail with a misleading 400 "does not support Responses API".
 */

import { afterEach, describe, it, expect, vi } from "vitest";
import { GithubExecutor } from "../../open-sse/executors/github.js";
import { proxyAwareFetch } from "../../open-sse/utils/proxyFetch.js";

vi.mock("../../open-sse/utils/proxyFetch.js", () => ({
  proxyAwareFetch: vi.fn(),
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(proxyAwareFetch).mockReset();
});

describe("GithubExecutor.supportsResponsesEndpoint", () => {
  const exec = new GithubExecutor();

  it("excludes Gemini models from the /responses endpoint", () => {
    expect(exec.supportsResponsesEndpoint("gemini-3.1-pro-preview")).toBe(false);
    expect(exec.supportsResponsesEndpoint("gemini-3.1-pro-low")).toBe(false);
  });

  it("excludes Claude models from the /responses endpoint", () => {
    expect(exec.supportsResponsesEndpoint("claude-sonnet-4.6")).toBe(false);
    expect(exec.supportsResponsesEndpoint("claude-opus-4.7")).toBe(false);
  });

  it("allows OpenAI/codex models on the /responses endpoint", () => {
    expect(exec.supportsResponsesEndpoint("gpt-5.5-codex")).toBe(true);
    expect(exec.supportsResponsesEndpoint("o4-mini")).toBe(true);
    expect(exec.supportsResponsesEndpoint("gpt-4.1")).toBe(true);
  });

  it("is null-safe", () => {
    expect(exec.supportsResponsesEndpoint(undefined)).toBe(true);
    expect(exec.supportsResponsesEndpoint("")).toBe(true);
  });
});

describe("GithubExecutor.transformRequest", () => {
  it.each(["gpt-5.6-terra", "gpt-6-sol", "gpt-6-luna", "gpt-6-astra", "gpt-6.1-sol"])("normalizes parameters for %s", (model) => {
    const exec = new GithubExecutor();
    const body = {
      temperature: 0,
      max_tokens: 512,
      messages: [{ role: "user", content: "hi" }],
    };
    const result = exec.transformRequest(model, body);

    expect(result.temperature).toBeUndefined();
    expect(result.max_tokens).toBeUndefined();
    expect(result.max_completion_tokens).toBe(512);
    expect(body).toHaveProperty("temperature", 0);
    expect(body.max_tokens).toBe(512);
  });

  it.each(["gpt-5.6-terra", "gpt-6-sol", "gpt-6.1-sol"])("removes temperature from translated %s /responses requests", async (model) => {
    vi.mocked(proxyAwareFetch).mockResolvedValueOnce(new Response("{}", { status: 400 }));
    const exec = new GithubExecutor();

    await exec.executeWithResponsesEndpoint({
      model,
      body: {
        temperature: 0.7,
        messages: [{ role: "user", content: "hi" }],
      },
      stream: true,
      credentials: { accessToken: "test-token" },
    });

    const request = JSON.parse(vi.mocked(proxyAwareFetch).mock.calls[0][1].body);
    expect(request.temperature).toBeUndefined();
  });
});

describe("GithubExecutor.execute cached-route guard (#1062)", () => {
  it.each([200, 400, 429, 500])("only caches a verified /responses route (status %s)", async (status) => {
    const exec = new GithubExecutor();
    const model = "gpt-6.1-sol";
    const baseSpy = vi
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(exec)), "execute")
      .mockImplementation(async () => ({
        response: new Response(JSON.stringify({ error: { message: "The requested model is not supported." } }), { status: 400 }),
      }));
    const responsesSpy = vi.spyOn(exec, "executeWithResponsesEndpoint")
      .mockImplementation(async () => ({ response: new Response("{}", { status }) }));

    const result = await exec.execute({ model, body: { messages: [] } });
    expect(result.response.status).toBe(status);
    expect(exec.knownCodexModels.has(model)).toBe(status === 200);

    await exec.execute({ model, body: { messages: [] } });
    expect(baseSpy).toHaveBeenCalledTimes(status === 200 ? 1 : 2);
    expect(responsesSpy).toHaveBeenCalledTimes(2);
  });

  it("does NOT use /responses for a Gemini model even if it was wrongly cached as codex", async () => {
    const exec = new GithubExecutor();
    // Simulate a prior misclassification that cached the Gemini model.
    exec.knownCodexModels.add("gemini-3.1-pro-preview");

    const respSpy = vi
      .spyOn(exec, "executeWithResponsesEndpoint")
      .mockResolvedValue({ via: "responses" });
    // Short-circuit the /chat/completions path (BaseExecutor.execute).
    const baseSpy = vi
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(exec)), "execute")
      .mockResolvedValue({ response: { status: 200 }, via: "chat" });

    const result = await exec.execute({ model: "gemini-3.1-pro-preview", body: { messages: [] }, log: null });

    expect(respSpy).not.toHaveBeenCalled();
    expect(baseSpy).toHaveBeenCalled();
    expect(result.via).toBe("chat");
  });
});
