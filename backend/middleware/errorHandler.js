/**
 * Centralized API Error Handling Middleware
 */

const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Resource not found: ${req.method} ${req.originalUrl}`
    });
};

const errorHandler = (err, req, res, next) => {
    console.error(`[API Error] ${req.method} ${req.url}:`, err);

    const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
    
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error occurred processing request',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};

