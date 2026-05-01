export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Sunucu tarafında bir hata oluştu.';
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
