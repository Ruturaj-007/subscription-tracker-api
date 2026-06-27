import { config } from 'dotenv';

config({
    path: `.env.${process.env.NODE_ENV || 'development'}.local`
});

export const {
    PORT,
    DB_URI,
    JWT_SECRET, JWT_EXPIRES_IN,
    NODE_ENV,
    ARCJET_KEY, ARCJET_ENV,
    QSTASH_TOKEN, QSTASH_URL,
    SERVER_URL, EMAIL_PASSWORD,
    UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN,
    GROQ_API_KEY,
} = process.env;