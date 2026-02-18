import { initializeDatabase } from '../server/db/database.js';
import app from '../server/index.js';

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
}

export default async function handler(req: any, res: any) {
  await ensureInitialized();
  return app(req, res);
}
