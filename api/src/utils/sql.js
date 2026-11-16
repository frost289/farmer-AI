/**
 * Builds a parameterized UPDATE. Column names come from zod-validated objects
 * (unknown keys are stripped), never directly from user input.
 */
export function buildUpdate(table, id, fields, returning = '*') {
  const keys = Object.keys(fields).filter((k) => fields[k] !== undefined);
  if (keys.length === 0) return null;
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  return {
    text: `UPDATE ${table} SET ${sets.join(', ')}, updated_at = now() WHERE id = $${keys.length + 1} RETURNING ${returning}`,
    values: [...keys.map((k) => fields[k]), id],
  };
}
