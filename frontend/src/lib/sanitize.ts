const MAX_FILENAME_LENGTH = 100;

// Strip anything that isn't alphanumeric, space, hyphen, underscore, or dot
const DANGEROUS_CHARS = /[^a-zA-Z0-9 _\-().]/g;
// Collapse multiple spaces/underscores/hyphens
const COLLAPSE = /[\s_-]{2,}/g;
// Path traversal patterns
const PATH_TRAVERSAL = /(\.\.|\/|\\|%2e|%2f|%5c)/gi;

export function sanitizeFileName(raw: string): string {
  let name = raw.trim();

  // Remove path traversal attempts
  name = name.replace(PATH_TRAVERSAL, '');

  // Remove dangerous chars (injection, special chars)
  name = name.replace(DANGEROUS_CHARS, '');

  // Collapse repeated separators
  name = name.replace(COLLAPSE, ' ');

  // Trim leading/trailing dots and spaces
  name = name.replace(/^[\s.]+|[\s.]+$/g, '');

  // Enforce max length
  if (name.length > MAX_FILENAME_LENGTH) {
    name = name.slice(0, MAX_FILENAME_LENGTH);
  }

  return name || 'merged';
}

export function isValidFileName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  if (name.length > MAX_FILENAME_LENGTH) return false;
  if (PATH_TRAVERSAL.test(name)) return false;
  return true;
}
