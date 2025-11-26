import rateLimit, { Request } from 'express-rate-limit';

const isDevelopment = process.env.NODE_ENV !== 'production';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 100000 : 200, // Effectively disabled in dev, strict in production
  message: 'Too many requests from this IP, please try again after 1 minute',
  skip: () => {
    // Completely skip rate limiting in development/test environments
    return isDevelopment;
  }
});

export default limiter;
