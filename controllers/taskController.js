import Task from '../models/Task.js';

// 1. CREATE TASK
export const createTask = async (req, res) => {
    try {
        console.log(`User ${req.user.email} is creating a task.`);
        const newTask = await Task.create({ text: req.body.text });
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ error: "Failed to create task" });
    }
};

// 2a. GET ALL TASKS
export const getAllTasks = async (req, res) => {
    try {
        const allTasks = await Task.find();
        res.status(200).json(allTasks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
};

// 2b. GET A SPECIFIC TASK
export const getSingleTask = async (req, res) => {
    try {
        // Grab the ID parameter straight from the URL path (:id)
        const task = await Task.findById(req.params.id);
        
        // 🛡️ Error Handling: If MongoDB returns null, the task doesn't exist
        if (!task) {
            return res.status(404).json({ error: "Task not found." });
        }

        // Send the single task back to the View/Client
        res.status(200).json(task);
    } catch (error) {
        // Catches situations where the ID format is invalid (e.g., malformed string)
        res.status(400).json({ error: "Invalid task ID format." });
    }
};

// 3. UPDATE TASK
export const updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { completed: true },
            { new: true }
        );
        if (!updatedTask) return res.status(404).json({ error: "Task not found" });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: "Update failed" });
    }
};

// 4. DELETE TASK
export const deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ error: "Task not found" });
        res.status(200).json({ message: "Task successfully deleted!" });
    } catch (error) {
        res.status(400).json({ error: "Delete failed" });
    }
};