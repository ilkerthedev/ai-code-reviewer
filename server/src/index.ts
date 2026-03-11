import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

import { reviewRouter } from './routes/review';

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration for rate-limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many requests from this IP, please try again in 15 minutes.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter CORS configuration (Allow only specific origins if known, here wildcard for simplicity in dev but can be restricted in prod)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
}));

app.use(express.json());

// Apply rate limiter specifically to the review API
app.use('/api/review', limiter, reviewRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});