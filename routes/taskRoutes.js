import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { 
    createTask, 
    getAllTasks, 
    getSingleTask,
    updateTask, 
    deleteTask 
} from '../controllers/taskController.js';

const router = express.Router();

router.post('/', requireAuth, createTask);
router.get('/', requireAuth, getAllTasks);
router.get('/:id', requireAuth, getSingleTask); 

router.put('/:id', requireAuth, updateTask);
router.delete('/:id', requireAuth, deleteTask);

export default router;