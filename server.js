import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js'; 
import taskRoutes from './routes/taskRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import portalRoutes from './routes/portalRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import devotionalRoutes from './routes/devotionalRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
    console.log("🛠️ Local environment variables loaded from .env file");
}

const app = express();
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

mongoose.connect(MONGO_URI)
    .then(() => console.log("🔌 Connected to MongoDB Cloud!"))
    .catch((err) => console.error(err));

// 🚀 Link your route modules!
app.use('/api/auth', authRoutes); 
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/events', eventRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/devotionals', devotionalRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});