import mongoose from 'mongoose';

const sermonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Sermon title is required'],
        trim: true
    },
    preacher: {
        type: String,
        required: [true, 'Preacher name is required'],
        trim: true
    },
    scriptureReference: {
        type: String,
        required: [false, 'Scripture reference is not required'],
        trim: true
    },
    recapSummary: {
        type: String,
        required: [false, 'Sermon summary/notes text is not required']
    },
    deliveryDate: {
        type: Date,
        required: [true, 'Delivery date is required']
    },
    audioVideoUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

export default mongoose.model('Sermon', sermonSchema);