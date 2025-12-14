import { z } from "zod";

/**
 * Convert a Zod error to a simple field -> messages map.
 *
 * Zod reports a list of issues; this helper extracts the first path
 * segment for each issue (typically the field name) and groups the
 * human-readable messages under that key.
 *
 * This format is convenient to return to clients and to assert in
 * tests (e.g., `expect(res.body.errors.email).toContain('...')`).
 *
 * @example
 * // returns { email: ['Invalid email'], password: ['Too short'] }
 * formatZodErrors(zodError)
 */
export function formatZodErrors(err: z.ZodError): Record<string, string[]> {

  // Output object where keys are field names and values are arrays of messages
  const out: Record<string, string[]> = {};

  // Iterate all reported issues and group messages by the first path segment
  for (const issue of err.issues) {
    
    // `issue.path` is an array describing where the issue occurred
    // Use the first path element as the key (fallback to '_' when absent)
    const key = (issue.path[0] as string) || "_";

    // Ensure we have an array for this key then append the message
    out[key] = out[key] ?? [];
    out[key].push(issue.message);
  }

  return out;
}