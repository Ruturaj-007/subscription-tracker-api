import { config } from 'dotenv';
config({path : `.env.${process.env.NODE_ENV || 'development'}.local`});
export const PORT = process.env.PORT || 5500;
export const NODE_ENV = process.env.NODE_ENV || 'development';