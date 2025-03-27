import * as path from 'path';
import dotenv from 'dotenv';

// Does custom logic to link correct env file
export default function loadEnv(){
    const env = process.env.NODE_ENV || "development";
    const envFile = `.env.${env}`;
    dotenv.config({ path: path.resolve(process.cwd(), envFile) });
}