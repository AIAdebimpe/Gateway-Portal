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
import fs from 'fs';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
    console.log("🛠️ Local environment variables loaded from .env file");
}

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
    console.log('📁 Created physical missing uploads directory in cloud root container');
}

const ROOT_DIR = process.cwd();
const app = express();

const uploadsPath = path.join(ROOT_DIR, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log("📁 Created missing 'uploads' directory container on server host.");
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(ROOT_DIR, 'public')));

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

if (!MONGODB_URI) {
    console.error("❌ CRITICAL BOOT ERROR: MONGODB_URI environment variable is completely undefined!");
    process.exit(1);
}

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 
})
    .then(() => console.log("🔌 Connected to MongoDB Cloud!"))
    .catch((err) => console.error("❌ Mongoose Connection Crash:", err));

// 🚀 Link your route modules!
app.use('/api/auth', authRoutes); 
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/events', eventRoutes);
app.use('/uploads', express.static(path.join(ROOT_DIR, 'uploads')));
app.use('/api/devotionals', devotionalRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});