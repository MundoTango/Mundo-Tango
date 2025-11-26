import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // High limit for dev/test - production uses nginx/cloudflare rate limiting
  message: 'Too many requests from this IP, please try again after 1 minute'
});

export default limiter;