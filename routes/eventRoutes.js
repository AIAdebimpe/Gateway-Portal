import express from 'express';
import { createEvent, getUpcomingEvents } from '../controllers/eventController.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';
import { uploadCloud } from '../config/cloudinary.js';

// import multer from 'multer';
// import path from 'path';

const router = express.Router();

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/'); // Saves files into your root uploads directory
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });

router.get('/', getUpcomingEvents);
router.post('/create', requireAuth, requireStaff, uploadCloud.single('image'), createEvent);

export default router;