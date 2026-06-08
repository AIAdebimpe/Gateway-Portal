import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [false, 'Event title is optional'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Event description is required']
    },
    eventDate: {
        type: Date,
        required: [true, 'Event calendar date is required']
    },
    flyerUrl: {
        type: String,
        required: [true, 'Event flyer graphic URL is required']
    },
    isFeaturedBanner: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);