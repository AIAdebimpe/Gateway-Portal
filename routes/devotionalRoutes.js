import express from 'express';
import { createDevotional, getDevotionalsFeed } from '../controllers/devotionalController.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'devotional-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const router = express.Router();

router.get('/', getDevotionalsFeed);
router.post('/create', requireAuth, requireStaff, upload.single('image'), createDevotional);

export default router;