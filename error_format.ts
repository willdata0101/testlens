// Extract error text helper function
export function cleanError(message: string): string {
  return message.replace(/\x1B\[[0-9;]*m/g, "");
}
