import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    memberId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    serviceType: { 
        type: String, 
        enum: [
            "Sunday Worship Service",
            "Sunday Evening Fellowship",
            "Monday Prayer Meeting",
            "Tuesday Bible Study",
            "Thursday Revival Service",
            "Special Service"
        ],
        required: true 
    },
    date: { 
        type: Date, 
        required: true,
        default: Date.now // Defaults to today's date
    }
}, { timestamps: true });

// 🔒 Indexing optimization: Prevents logging a member twice for the exact same service date!
attendanceSchema.index({ memberId: 1, serviceType: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);