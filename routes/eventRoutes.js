import express from 'express';
import { createEvent, getUpcomingEvents } from '../controllers/eventController.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', getUpcomingEvents);
router.post('/create', requireAuth, requireStaff, upload.single('image'), createEvent);

export default router;