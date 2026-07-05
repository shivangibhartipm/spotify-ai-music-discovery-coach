import "server-only";

function getErrorCauseMessage(error: unknown) {
  if (error instanceof Error && error.cause instanceof Error) {
    return error.cause.message;
  }

  if (error instanceof Error && typeof error.cause === "string") {
    return error.cause;
  }

  return undefined;
}

export async function serverFetch(input: string | URL, init?: RequestInit) {
  const url = input.toString();

  try {
    return await fetch(input, {
      ...init,
      cache: "no-store",
    });
  } catch (error) {
    const causeMessage = getErrorCauseMessage(error);
    const baseMessage = error instanceof Error ? error.message : "Unknown network error";

    throw new Error(
      causeMessage
        ? `Network request failed for ${url}: ${causeMessage}`
        : `Network request failed for ${url}: ${baseMessage}`,
    );
  }
}
