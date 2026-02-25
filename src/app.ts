import express from 'express';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { combineRouters } from './routes';
import { ResponseGenerator } from './utils/response-generator';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie parser middleware

// CORS: allow multiple origins (normalize: no trailing slash for consistent matching)
const corsOriginList: string[] = process.env.CORS_ORIGINS?.trim()
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean)
  : [(process.env.FRONTEND_URL || 'http://localhost:7002').replace(/\/$/, '')];

function normalizeOrigin(origin: string): string {
  return origin ? origin.replace(/\/$/, '') : '';
}

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (e.g. same-origin, Postman, server-to-server)
    if (!origin) return callback(null, true);
    const normalized = normalizeOrigin(origin);
    const allowed = corsOriginList.some((o) => normalizeOrigin(o) === normalized);
    if (allowed) return callback(null, true);
    callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true,
  optionsSuccessStatus: 204,
}));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Setup routes
combineRouters(app);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  ResponseGenerator.send(res,
    ResponseGenerator.error('Internal server error', 500)
  );
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;