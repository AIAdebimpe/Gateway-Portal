import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js'; 

const router = express.Router();

// Route mappings: Match the path to the Controller brain
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;