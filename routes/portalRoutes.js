import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
    getEventsFeed, createEvent,
    getLatestSermons, getSermonArchive, createSermon,
    getDailyDevotional, createDevotional, 
    updateSermon, deleteSermon
} from '../controllers/portalController.js';

const router = express.Router();

// 🔓 PUBLIC DISCOVERY ENDPOINTS (No Token Needed)
router.get('/events', getEventsFeed);
router.get('/sermons/latest', getLatestSermons);
router.get('/sermons/archive', getSermonArchive);
router.get('/devotional/today', getDailyDevotional);

// 🔒 SECURED ADMINISTRATIVE WRITE ACTIONS (Requires Login + Pastor/Admin Check)
router.post('/events', requireAuth, createEvent);
router.post('/sermons', requireAuth, createSermon);
router.put('/sermons/:id', requireAuth, updateSermon);
router.delete('/sermons/:id', requireAuth, deleteSermon);
router.post('/devotional', requireAuth, createDevotional);

export default router;