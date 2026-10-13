import {pool} from './db.js';
import {readFile} from 'node:fs/promises';
try { await pool.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8')); console.log('Schema ready.'); }
catch(e) {console.error('Schema setup failed:',e.message); process.exitCode=1;}
finally {await pool.end();}
