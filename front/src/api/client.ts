import { ApiError, type ProblemDetails } from "./api.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5284/api";
const TOKEN_KEY = "token";

function readAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function asProblemDetails(value: unknown): ProblemDetails | undefined {
  return typeof value === "object" && value !== null
    ? (value as ProblemDetails)
    : undefined;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = readAccessToken();

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      0,
      undefined,
      "Network error",
      "Unable to reach the server. Please try again.",
    );
  }

  const body = await readBody(response);
  if (!response.ok) {
    const problem = asProblemDetails(body);
    if (response.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    throw new ApiError(
      response.status,
      problem?.code,
      problem?.title ?? `Request failed (${response.status})`,
      problem?.detail ?? (typeof body === "string" ? body : undefined),
      problem?.errors,
      problem?.traceId,
    );
  }

  return body as T;
}
