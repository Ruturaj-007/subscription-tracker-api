import { Router } from 'express';
import mongoose from 'mongoose';
import redis from '../config/redis.js';

const healthRouter = Router();

// GET /health
healthRouter.get('/', async (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[dbState];

    let redisStatus = 'disconnected';
    try {
        await redis.ping();
        redisStatus = 'connected';
    } catch {
        redisStatus = 'disconnected';
    }

    const healthy = dbStatus === 'connected' && redisStatus === 'connected';

    res.status(healthy ? 200 : 503).json({
        status: healthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        services: {
            database: dbStatus,
            redis: redisStatus,
        },
        uptime: `${Math.floor(process.uptime())}s`,
    });
});

export default healthRouter;