import "server-only";

import { serverFetch } from "./server-fetch";

type HttpClientOptions = {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
};

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const defaultOptions: Required<HttpClientOptions> = {
  timeoutMs: 10_000,
  retries: 2,
  retryDelayMs: 500,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelay(response: Response, attempt: number, baseDelayMs: number) {
  const retryAfter = response.headers.get("retry-after");

  if (retryAfter) {
    const retryAfterSeconds = Number(retryAfter);

    if (!Number.isNaN(retryAfterSeconds)) {
      return retryAfterSeconds * 1000;
    }

    const retryDate = new Date(retryAfter).getTime();

    if (!Number.isNaN(retryDate)) {
      return Math.max(retryDate - Date.now(), 0);
    }
  }

  const jitter = Math.floor(Math.random() * 150);

  return baseDelayMs * 2 ** attempt + jitter;
}

function shouldRetry(status: number) {
  return status === 429 || status === 408 || status >= 500;
}

function getRequestLogContext(input: string | URL, init: RequestInit) {
  const url = new URL(input.toString());

  return {
    method: init.method ?? "GET",
    target: `${url.origin}${url.pathname}`,
  };
}

function logExternalRequest(
  level: "info" | "warn",
  input: string | URL,
  init: RequestInit,
  details: Record<string, string | number | boolean | undefined>,
) {
  const context = getRequestLogContext(input, init);

  console[level](
    JSON.stringify({
      event: "external_http_request",
      ...context,
      ...details,
    }),
  );
}

async function fetchWithTimeout(input: string | URL, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await serverFetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function httpRequest(
  input: string | URL,
  init: RequestInit = {},
  options: HttpClientOptions = {},
) {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  for (let attempt = 0; attempt <= mergedOptions.retries; attempt += 1) {
    const startedAt = Date.now();
    let response: Response;

    try {
      response = await fetchWithTimeout(input, init, mergedOptions.timeoutMs);
    } catch (error) {
      logExternalRequest("warn", input, init, {
        attempt: attempt + 1,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : "Unknown request error",
      });

      throw error;
    }

    const durationMs = Date.now() - startedAt;

    logExternalRequest(response.ok ? "info" : "warn", input, init, {
      attempt: attempt + 1,
      durationMs,
      status: response.status,
      retrying:
        !response.ok && shouldRetry(response.status) && attempt !== mergedOptions.retries,
    });

    if (response.ok || !shouldRetry(response.status) || attempt === mergedOptions.retries) {
      if (!response.ok) {
        const retryAfter = response.headers.get("retry-after");

        throw new HttpError(
          `Request to ${input.toString()} failed with status ${response.status}`,
          response.status,
          retryAfter ? Number(retryAfter) : undefined,
        );
      }

      return response;
    }

    await sleep(getRetryDelay(response, attempt, mergedOptions.retryDelayMs));
  }

  throw new Error(`Request to ${input.toString()} failed after retries`);
}

export async function requestJson<T>(
  input: string | URL,
  init?: RequestInit,
  options?: HttpClientOptions,
) {
  const response = await httpRequest(input, init, options);

  return (await response.json()) as T;
}
