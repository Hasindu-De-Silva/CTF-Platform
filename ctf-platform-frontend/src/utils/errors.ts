/** The message of a thrown `Error`, or `fallback` for anything else that was thrown. */
export const getErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;
