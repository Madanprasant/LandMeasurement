import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import landRoutes from './routes/landRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',           // Vite Dev
    'http://localhost:3000',           // Alternative Local
    /\.vercel\.app$/                   // All Vercel deployments
  ],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/lands', landRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Land Measurement API is running optimally.' });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/landMeasurementDB')
  .then(() => {
    console.log("Connected to MongoDB successfully");
    // Start Server
    app.listen(PORT, () => {
      console.log(`Backend Server successfully running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
