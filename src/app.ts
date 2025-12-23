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

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Important for cookies
}));
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