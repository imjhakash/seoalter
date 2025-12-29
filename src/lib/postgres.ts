import { Pool } from 'pg';

// Using the provided credentials. 
// Note: In a production environment, this should be in environment variables.
// The password "20001118@Leads1" contains a special character '@' which must be URL encoded as %40 in the connection string.
const connectionString = 'postgresql://postgres:20001118%40Leads1@db.qrbttrqhdxmakiwebnpd.supabase.co:5432/postgres';

const pool = new Pool({
    connectionString,
});

export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        // console.log('executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error: any) {
        if (error.code === 'ENOTFOUND') {
            console.error('❌ Database Connection Failed: Hostname not found. Check the connection string in src/lib/postgres.ts');
        }
        throw error;
    }
};

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;
