import mongoose from 'mongoose';

const devotionalSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    type: { 
        type: String, 
        required: true, 
        enum: ['Daily Manna', 'Higher Everyday', 'Sincere Milk'] 
    },
    flyerUrl: { type: String, required: true }, // The daily poster image path
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

devotionalSchema.index({ date: 1 });

const Devotional = mongoose.model('Devotional', devotionalSchema);
export default Devotional;