import Devotional from '../models/Devotional.js';

export const createDevotional = async (req, res) => {
    try {
        const { title, date, type } = req.body;
        const requestingUser = req.user;

        if (!title || !date || !type) {
            return res.status(400).json({ error: "Devotional Title and Target Date are required." });
        }

        if (!req.file) {
            return res.status(400).json({ error: "A daily devotional poster image is required." });
        }

        // 📅 CALCULATE THE START AND END OF THE CHOSEN DAY (UTC or Local depending on your setup)
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        // 🛑 UNIQUE DAILY ENFORCEMENT CHECK
        const existingDevotional = await Devotional.findOne({
            type: type,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (existingDevotional) {
            return res.status(400).json({ 
                error: `A devotional poster has already been published for ${new Date(date).toLocaleDateString()}. Only one post is allowed per day.` 
            });
        }

        // File path allocation
        const flyerUrl = req.file.path;
        const newDevotional = await Devotional.create({
            title,
            date: startOfDay, // Normalize to start of day
            type,
            flyerUrl,
            createdBy: requestingUser.userId || requestingUser._id || requestingUser.id
        });

        return res.status(201).json({ message: "Daily Devotional published successfully!", devotional: newDevotional });

    } catch (error) {
        console.error("Devotional Creation Error:", error);
        return res.status(500).json({ error: "Server error occurred while creating devotional." });
    }
};

// Public Feed Router: Returns devotionals sorted newest to oldest
export const getDevotionalsFeed = async (req, res) => {
    try {
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const devotionals = await Devotional.find({ date: { $lte: todayEnd } })
            .populate('createdBy', 'fullName role')
            .sort({ date: -1 }); // Newest daily graphics appear first
            
        return res.status(200).json({ allDevotionals: devotionals });
    } catch (error) {
        return res.status(500).json({ error: "Failed to pull daily devotionals." });
    }
};

