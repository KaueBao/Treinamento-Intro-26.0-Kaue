export function toErrorMessage(
  message: string,
  _details?: unknown
) {
  return {
    success: false,
    message,
  };
}