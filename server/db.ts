import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { log } from "./vite";

// Database connection configuration
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

// Create postgres client
const client = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create drizzle instance
export const db = drizzle(client);

// Test database connection
export const testConnection = async () => {
  try {
    await client`SELECT 1`;
    log('✅ Database connection successful');
    return true;
  } catch (error) {
    log('❌ Database connection failed:', error);
    return false;
  }
};

// Close database connection
export const closeConnection = async () => {
  try {
    await client.end();
    log('Database connection closed');
  } catch (error) {
    log('Error closing database connection:', error);
  }
};