import 'dotenv/config';
import pg from 'pg';
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL in .env or hosting environment.');
export const pool = new pg.Pool({connectionString:process.env.DATABASE_URL, max:10, connectionTimeoutMillis:10000, ssl:process.env.DB_SSL === 'true' ? {rejectUnauthorized:true} : false});
pool.on('error', err => console.error('Idle database connection error:', err.message));
