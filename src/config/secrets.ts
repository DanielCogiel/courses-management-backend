import dotenv from 'dotenv';

//Get configuration variables
dotenv.config();
export const PORT = process.env.PORT;
export const TOKEN_KEY = process.env.TOKEN_KEY