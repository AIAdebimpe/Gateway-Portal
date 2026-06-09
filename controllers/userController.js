import User from '../models/User.js';

export const updateUserRole = async (req, res) => {
    try {
        const { targetUserId, newRole } = req.body;

        if (!targetUserId || !newRole) {
            return res.status(400).json({ error: "Target User ID and new role are required." });
        }

        const validRoles = ['member', 'pastor', 'admin'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ error: "Invalid role specified." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            targetUserId, 
            { role: newRole }, 
            { new: true }
        ).select('-password'); // Hide the scrambled password string from the response output

        if (!updatedUser) {
            return res.status(404).json({ error: "Member not found." });
        }

        res.status(200).json({ 
            message: `Successfully promoted ${updatedUser.fullName} to ${newRole}!`, 
            user: updatedUser 
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to update member role." });
    }
};

export const getAllMembers = async (req, res) => {
    try {
        // Fetch users, but only grab their id, fullName, and email to save bandwidth
        const members = await User.find({}).select('_id fullName email');
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ error: "Failed to load church directory." });
    }
};


export const updateProfileAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Please provide an image file resource." });
        }

        // Multer puts the local file route path here. Normalize slashes for web access.
        const avatarUrl = `/${req.file.path.replace(/\\/g, '/')}`;

        // Save path string to the logged-in user profile inside MongoDB
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId, 
            { avatar: avatarUrl }, 
            { new: true }
        ).select('-password');

        res.status(200).json({ 
            message: "Profile image updated successfully!", 
            user: updatedUser 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};