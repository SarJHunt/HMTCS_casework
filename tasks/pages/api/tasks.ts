
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD, // Fallback to an empty string
    max: 10,
    idleTimeoutMillis: 30000,
  });

  console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
  
  if (!process.env.POSTGRES_PASSWORD) {
    console.error('POSTGRES_PASSWORD is not set in the environment variables.');
  }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await pool.connect();
  try {
    // Your database interaction logic here using 'client.query()'
    const result = await client.query('SELECT NOW()');
    res.status(200).json({ message: 'Connected to PostgreSQL!', time: result.rows[0].now });
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
    res.status(500).json({ message: 'Failed to connect to PostgreSQL', error: (error as Error).message });
  }
   finally {
    client.release(); // Release the client back to the pool
  }
}



