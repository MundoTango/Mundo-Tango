import express from 'express';
import limiter from './middlewares/rateLimiter';

const app = express();

app.use(limiter);
// existing code...