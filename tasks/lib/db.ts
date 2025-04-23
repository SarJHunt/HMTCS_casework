import { Pool } from 'pg';

//Establish database connection and export pool object for use elsewhere

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export default async function DatabaseConnect() {
  try {
    await pool.connect(); // Ensure the pool is connected
    console.log('Connected to the database');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('Database connection failed');
  }
}

export { pool }; 