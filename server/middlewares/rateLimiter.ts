import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'test' ? 500 : 200, // Higher limit for testing/dev
  message: 'Too many requests from this IP, please try again after 1 minute'
});

export default limiter;