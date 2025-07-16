import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { connectDB, initDB } from './database.mjs';
import authRoutes from './routes/auth.mjs';
import mealRoutes from './routes/meal.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', mealRoutes);

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ status: 'OK', message: 'Calorie Tracker API is running' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await connectDB();
    await initDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
