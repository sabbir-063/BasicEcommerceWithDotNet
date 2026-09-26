import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./api.types";
import { api } from "./client";

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("api client", () => {
  it("returns undefined for a successful 204 response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    await expect(
      api<void>("/cart", { method: "DELETE" }),
    ).resolves.toBeUndefined();
  });

  it("normalizes Problem Details including field errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 400,
          code: "VALIDATION_ERROR",
          title: "Validation failed",
          detail: "Correct the highlighted fields.",
          traceId: "trace-1",
          errors: { name: ["Name is required."] },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/problem+json" },
        },
      ),
    );

    const error = await api("/profile").catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      title: "Validation failed",
      traceId: "trace-1",
      fieldErrors: { name: ["Name is required."] },
    });
  });

  it("handles non-JSON server errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Gateway unavailable", { status: 502 }),
    );

    await expect(api("/products")).rejects.toMatchObject({
      status: 502,
      detail: "Gateway unavailable",
    });
  });

  it("clears stale authentication and announces a 401", async () => {
    sessionStorage.setItem("token", "expired-token");
    const listener = vi.fn();
    window.addEventListener("auth:unauthorized", listener);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ title: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/problem+json" },
      }),
    );

    await expect(api("/auth/me")).rejects.toBeInstanceOf(ApiError);

    expect(sessionStorage.getItem("token")).toBeNull();
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener("auth:unauthorized", listener);
  });

  it("does not force a multipart content type", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ url: "https://example.test/image" })),
      );
    const data = new FormData();
    data.append("file", new Blob(["image"]), "image.png");

    await api("/admin/media/images", { method: "POST", body: data });

    const request = fetchMock.mock.calls[0][1];
    expect(new Headers(request?.headers).has("Content-Type")).toBe(false);
  });
});
