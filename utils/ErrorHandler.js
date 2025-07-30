class GatekitError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'GatekitError';
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorMiddleware = (err, req, res, next) => {
    console.error(`[GatekitError] ${err.message}`);
    if (err instanceof GatekitError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    }
    return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
    });
};

module.exports = { GatekitError, errorMiddleware };
