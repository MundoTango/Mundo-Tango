import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/breadcrumbs', authenticate, (req: Request, res: Response) => {
  // Only authenticated users can access this endpoint
  try {
    const breadcrumbs = req.body;
    // Process breadcrumbs
    res.status(201).json({ message: 'Breadcrumbs created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

function authenticate(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}