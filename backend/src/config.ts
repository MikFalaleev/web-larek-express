import path from 'path';
import { config } from 'dotenv';

config();

export const PORT = Number(process.env.PORT) || 3000;
export const DB_ADDRESS = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek';
export const ORIGIN_ALLOW = process.env.ORIGIN_ALLOW || 'http://localhost:5173';
export const UPLOAD_PATH = process.env.UPLOAD_PATH || 'images';
export const UPLOAD_PATH_TEMP = process.env.UPLOAD_PATH_TEMP || 'temp';
export const AUTH_ACCESS_TOKEN_EXPIRY = process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m';
export const AUTH_REFRESH_TOKEN_EXPIRY = process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d';
export const AUTH_ACCESS_TOKEN_SECRET = process.env.AUTH_ACCESS_TOKEN_SECRET || 'dev-access-secret';
export const AUTH_REFRESH_TOKEN_SECRET = process.env.AUTH_REFRESH_TOKEN_SECRET || 'dev-refresh-secret';
export const PUBLIC_DIR = path.join(__dirname, 'public');
export const UPLOAD_DIR = path.join(PUBLIC_DIR, UPLOAD_PATH);
export const TEMP_DIR = path.join(__dirname, '..', UPLOAD_PATH_TEMP);
