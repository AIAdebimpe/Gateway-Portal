import express from 'express';
import { requireAuth } from '../middleware/auth.js';
//import { updateUserRole } from '../controllers/userController.js';
import User from '../models/User.js';

const router = express.Router();



router.get('/', requireAuth, async (req, res) => {
    try {
        if (req.user.role === 'member') {
            return res.status(403).json({ error: "Access denied. Administrative authority required." });
        }

        const directory = await User.find({}).select('_id fullName email role');
        res.status(200).json(directory);
    } catch (error) {
        res.status(500).json({ error: "Failed to pull church member directory." });
    }
});

export default router;