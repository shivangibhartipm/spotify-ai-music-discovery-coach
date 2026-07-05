import { ZodError } from "zod";

function getErrorCauseMessage(error: Error) {
  if (error.cause instanceof Error) {
    return error.cause.message;
  }

  if (typeof error.cause === "string") {
    return error.cause;
  }

  return undefined;
}

export function formatConfigError(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join("; ");
  }

  if (error instanceof Error) {
    const causeMessage = getErrorCauseMessage(error);

    if (causeMessage && !error.message.includes(causeMessage)) {
      return `${error.message}: ${causeMessage}`;
    }

    return error.message;
  }

  return "Unknown configuration error";
}
