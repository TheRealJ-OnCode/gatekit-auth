class ResponseHandler {
    static success(res, message, data = null, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }
    static error(res, message, error = null, statusCode = 500) {
        return res.status(statusCode).json({
            success: false,
            message,
            error,
        });
    }
    static unauthorized(res, message = "Unauthorized") {
        return this.error(res, message, null, 401);
    }
    static forbidden(res, message = "Forbidden") {
        return this.error(res, message, null, 403);
    }
    static notFound(res, message = "Not Found") {
        return this.error(res, message, null, 404);
    }
    static validationError(res, message = "Validation Error", error = null) {
        return this.error(res, message, error, 400);
    }
    static badRequest(res, message = "Bad Request") {
        return this.error(res, message, null, 400);
    }
    static conflict(res, message = "Conflict") {
        return this.error(res, message, null, 409);
    }
    static custom(res, code = 300, success = false, message = 'Custom response', data = {}) {
        return res.status(code).json({
            success,
            message,
            data,
        })
    }
    static serverError(res, message = "Internal Server Error") {
        return this.error(res, message, null, 500);
    }
}

module.exports = ResponseHandler;
