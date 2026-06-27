import redis from '../config/redis.js';

const cache = (ttl = 300) => async (req, res, next) => {
    const key = `cache:${req.user._id}:${req.originalUrl}`;

    try {
        const cached = await redis.get(key);
        if (cached) {
            return res.status(200).json({ ...cached, fromCache: true });
        }

        // Sync override — Express expects res.json to be sync
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode === 200) {
                // Fire and forget — don't await, keeps res.json sync
                redis.set(key, body, { ex: ttl }).catch(err =>
                    console.warn('Redis set error:', err.message)
                );
            }
            return originalJson(body);
        };

        next();
    } catch (error) {
        console.warn('Redis cache error, falling through to DB:', error.message);
        next();
    }
};

export default cache;