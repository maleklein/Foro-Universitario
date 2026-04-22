// src/lib/auth/mock-token.ts

// Extrae el userId del token mock (formato: mock-session-{userId}-{timestamp})
export function extractUserIdFromToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const match = token.match(/^mock-session-(.+)-\d+$/);
  return match ? match[1] : null;
}
