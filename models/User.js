import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['member', 'pastor', 'admin'], 
        default: 'member' 
    },
    title: {
        type: String,
        enum: ['Brother', 'Sister'], 
        default: 'Brother'
    },
    avatar: { 
        type: String, 
        default: '/uploads/profiles/default-avatar.png'
    },
    joinedAt: { type: Date, default: Date.now }

});

// Default export so other files can import it
export default mongoose.model('User', userSchema);