import express from 'express';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { combineRouters } from './routes';
import { ResponseGenerator } from './utils/response-generator';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
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