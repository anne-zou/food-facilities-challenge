import type { Database } from 'sql.js';

declare global {
  interface Window {
    db: Database | null;
  }
}

export {};
