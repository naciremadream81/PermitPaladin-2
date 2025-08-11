import { defineConfig } from "drizzle-kit";

// Database configuration with fallbacks for local development
const getDatabaseUrl = () => {
  // For local development/home server
  if (process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL) {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const database = process.env.DB_NAME || 'permitpaladin';
    const username = process.env.DB_USER || 'permitpaladin';
    const password = process.env.DB_PASSWORD || 'permitpaladin123';
    
    return `postgresql://${username}:${password}@${host}:${port}/${database}`;
  }
  
  // For production/cloud databases
  return process.env.DATABASE_URL;
};

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  throw new Error("No database URL configured. Please set DATABASE_URL or use local database settings.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
