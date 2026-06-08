import Attendance from '../models/Attendance.js';
import mongoose from 'mongoose';

export const logAttendance = async (req, res) => {
    try {
        const { memberId, serviceType, date } = req.body;
        const requestingUser = req.user;
        const requestingUserId = requestingUser.userId;

        if (requestingUser.role === 'member' && requestingUserId !== memberId) {
            return res.status(403).json({ 
                error: "Access denied. Members can only log their own personal attendance." 
            });
        }

        if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({ 
                error: "Malformed Request: The provided Member ID layout is not a valid database identifier." 
            });
        }

        const cleanObjectId = new mongoose.Types.ObjectId(memberId);
        let targetCheckinDate;
        if (date && (requestingUser.role === 'admin' || requestingUser.role === 'pastor')) {
            const [year, month, day] = date.split('-');
            targetCheckinDate = new Date(year, month - 1, day, 12, 0, 0); // Local noon base

            if (targetCheckinDate.getTime() > new Date().getTime()) {
                return res.status(400).json({ error: "Cannot register attendance for a future service date." });
            }
        } else {
            targetCheckinDate = new Date();
        }

        if (requestingUser.role === 'member') {
            const currentDayOfWeek = targetCheckinDate.getDay(); 
            const currentMinutes = (targetCheckinDate.getHours() * 60) + targetCheckinDate.getMinutes();

            // Establish service schedule rules matrix
            let allowedDay = false;
            let openThresholdMinutes = 0;

            if (serviceType === "Sunday Worship Service" && currentDayOfWeek === 0) {
                allowedDay = true;
                openThresholdMinutes = (13 * 60) - 15; // 12:45 PM (765 mins)
            } else if (serviceType === "Sunday Evening Fellowship" && currentDayOfWeek === 0) {
                allowedDay = true;
                openThresholdMinutes = (18 * 60) - 15; // 5:45 PM (1065 mins)
            } else if (serviceType === "Monday Prayer Meeting" && currentDayOfWeek === 1) {
                allowedDay = true;
                openThresholdMinutes = (18 * 60) - 15; // 5:45 PM
            } else if (serviceType === "Tuesday Bible Study" && currentDayOfWeek === 2) {
                allowedDay = true;
                openThresholdMinutes = (18 * 60) - 15; // 5:45 PM
            } else if (serviceType === "Thursday Revival Service" && currentDayOfWeek === 4) {
                allowedDay = true;
                openThresholdMinutes = (18 * 60) - 15; // 5:45 PM
            }

            if (!allowedDay) {
                return res.status(403).json({ error: `This service cannot be checked into on this day of the week.` });
            }

            if (currentMinutes < openThresholdMinutes) {
                return res.status(403).json({ error: `The check-in window for this service has not opened yet.` });
            }
        } 
        
        // Check if an attendance record already exists for this member, service, and calendar date
        const startOfDay = new Date(targetCheckinDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetCheckinDate);
        endOfDay.setHours(23, 59, 59, 999);

        const alreadyCheckedIn = await Attendance.findOne({
            memberId,
            serviceType,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (alreadyCheckedIn) {
            return res.status(400).json({ error: "An attendance log for this member has already been registered for this service date." });
        }

        // Execution: Save to MongoDB Ledger
        const newAttendanceRecord = await Attendance.create({
            memberId: cleanObjectId,
            serviceType,
            date: targetCheckinDate
        });

        res.status(201).json({ 
            message: "Success", 
            record: newAttendanceRecord 
        });

    } catch (error) {
        res.status(500).json({ error: "Server error processing checkin transaction." });
    }
};


export const getMemberAttendanceHistory = async (req, res) => {
    try {
        const { memberId } = req.params;

        // Fetch records and use .populate() to magically stitch the user's name into the response!
        const history = await Attendance.find({ memberId })
            .populate('memberId', 'fullName email') // Drops in the user's info minus the password
            .sort({ date: -1 }); // Newest service records first

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch attendance history." });
    }
};

export const getAttendanceHistory = async (req, res) => {
    try {
        const { timeframe, memberId, date } = req.query;
        const requestingUser = req.user;

        let searchFilter = {};

        // Security Scope Guard: Standard members can only query their own data
        if (requestingUser.role === 'member') {
            searchFilter.memberId = requestingUser.userId;
        } else if (requestingUser.role === 'admin' || requestingUser.role === 'pastor') {
            if (memberId && memberId !== 'all') {
                searchFilter.memberId = memberId;
            }
        }

        // Compute Date Range Thresholds (Week / Month / Year)
        if (date) {
            const [year, month, day] = date.split('-').map(Number);
            const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
            const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

            if (isNaN(startOfDay.getTime()) || isNaN(endOfDay.getTime())) {
                return res.status(400).json({ error: "Malformed Date format string received." });
            }

            searchFilter.date = { $gte: startOfDay, $lte: endOfDay };
        } else {
            // Otherwise, fall back cleanly to your rolling timeframe analytics defaults
            const now = new Date();
            let startDate = new Date();

            if (timeframe === 'week') {
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                startDate = new Date(now.setDate(diff));
                startDate.setHours(0,0,0,0);
            } else if (timeframe === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);
            } else if (timeframe === 'year') {
                startDate = new Date(now.getFullYear(), 0, 1);
                startDate.setHours(0, 0, 0, 0);
            } else {
                startDate.setDate(now.getDate() - 30);
            }
            searchFilter.date = { $gte: startDate };
        }

        // Pull data from MongoDB and join ('populate') the User names
        const logs = await Attendance.find(searchFilter)
            .populate('memberId', 'fullName email role title regTitle gender') // Injects user details into the log
            .sort({ date: -1 }); // Sort newest first

        res.status(200).json(logs);

    } catch (error) {
        res.status(500).json({ error: "Server error compiling history metrics ledger." });
    }
};

export const getMyAttendanceHistory = async (req, res) => {
    try {
        const myUserId = req.user.userId || req.user.id || req.user._id;

        if (!myUserId) {
            return res.status(400).json({ error: "User identity context missing from token session." });
        }

        // Query database for attendance logs belonging exclusively to this member
        const records = await Attendance.find({ memberId: myUserId })
            .sort({ date: -1 }); // Order by newest service days first

        return res.status(200).json({ success: true, history: records });
    } catch (error) {
        console.error("Personal attendance retrieval error:", error);
        return res.status(500).json({ error: "Failed to compile your personal attendance logs." });
    }
};