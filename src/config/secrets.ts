import dotenv from 'dotenv';

//Get configuration variables
dotenv.config();
export const PORT = process.env.SERVER_PORT;
export const TOKEN_KEY = process.env.TOKEN_KEY;
export const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT;
export const DB_USER = 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;