/**
 * Lightweight, zero-dependency in-memory Sliding Window Rate Limiter
 * Protects authentication and sensitive API endpoints against brute force attacks.
 */

const createRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 10, message = 'Too many requests. Please try again later.' }) => {
    const hits = new Map();

    // Periodic cleanup of expired records every 5 minutes
    setInterval(() => {
        const now = Date.now();
        for (const [key, timestamps] of hits.entries()) {
            const valid = timestamps.filter(t => now - t < windowMs);
            if (valid.length === 0) {
                hits.delete(key);
            } else {
                hits.set(key, valid);
            }
        }
    }, 5 * 60 * 1000).unref();

    return (req, res, next) => {
        // Skip rate limiting in test environments
        if (process.env.NODE_ENV === 'test') {
            return next();
        }

        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
        const now = Date.now();
        const timestamps = hits.get(ip) || [];

        // Filter timestamps within the current window
        const recentTimestamps = timestamps.filter(t => now - t < windowMs);

        if (recentTimestamps.length >= max) {
            const retryAfter = Math.ceil((recentTimestamps[0] + windowMs - now) / 1000);
            res.setHeader('Retry-After', retryAfter);
            return res.status(429).json({
                success: false,
                message,
                retryAfterSeconds: retryAfter
            });
        }

        recentTimestamps.push(now);
        hits.set(ip, recentTimestamps);
        next();
    };
};

// Auth endpoint rate limiter: 15 login attempts per 15 minutes
const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: 'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.'
});

// General API rate limiter: 300 requests per minute
const apiLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 300,
    message: 'API rate limit exceeded. Please throttle your requests.'
});

module.exports = {
    loginLimiter,
    apiLimiter,
    createRateLimiter
};

