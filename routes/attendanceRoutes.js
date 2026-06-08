import express from 'express';
import { requireAuth, requireStaff } from '../middleware/auth.js';
import { logAttendance, getAttendanceHistory, getMyAttendanceHistory } from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/checkin', requireAuth, logAttendance);

router.get('/history', requireAuth, getAttendanceHistory);
router.get('/my-history', requireAuth, getMyAttendanceHistory);

export default router;