import Event from '../models/Events.js';
import Sermon from '../models/Sermons.js';
import Devotional from '../models/Devotional.js';

// Helper Utility: Secure Role Validation Guard for structural edits
const verifyLeadershipRole = (user) => {
    return user && (user.role === 'admin' || user.role === 'pastor');
};

// ==========================================
// 📅 EVENTS CONTROLLERS
// ==========================================

// GET: Fetch Featured Flyer + Master List
export const getEventsFeed = async (req, res) => {
    try {
        // Fetch the active featured flyer banner (newest first)
        const featured = await Event.findOne({ isFeaturedBanner: true }).sort({ eventDate: -1 });
        
        // Fetch all upcoming events sorted chronologically
        const allEvents = await Event.find({ eventDate: { $gte: new Date().setHours(0,0,0,0) } }).sort({ eventDate: 1 });

        res.status(200).json({ featured, allEvents });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch event matrix listings." });
    }
};

// POST: Publish a new Church Program (Restricted)
export const createEvent = async (req, res) => {
    try {
        if (!verifyLeadershipRole(req.user)) {
            return res.status(403).json({ error: "Unauthorized: Access restricted to executive church leadership." });
        }

        const { title, description, eventDate, flyerUrl, isFeaturedBanner } = req.body;

        // If this new event is marked as the primary banner, optionally unset prior featured flags
        if (isFeaturedBanner === true) {
            await Event.updateMany({ isFeaturedBanner: true }, { isFeaturedBanner: false });
        }

        const newEvent = await Event.create({
            title, description, eventDate, flyerUrl, isFeaturedBanner,
            createdBy: req.user.userId
        });

        res.status(201).json({ message: "Event published successfully", event: newEvent });
    } catch (error) {
        res.status(500).json({ error: "Server error compiling event document." });
    }
};

// ==========================================
// 🎙️ SERMONS CONTROLLERS
// ==========================================

// GET: Home Page Snippets (Limit to Latest 3 Rows)
export const getLatestSermons = async (req, res) => {
    try {
        const latest = await Sermon.find().sort({ deliveryDate: -1 }).limit(3);
        res.status(200).json(latest);
    } catch (error) {
        res.status(500).json({ error: "Failed to load home sermon components." });
    }
};

// GET: Archive Table Search & Lookup
export const getSermonArchive = async (req, res) => {
    try {
        const { search } = req.query;
        let filterQuery = {};

        if (search) {
            filterQuery = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { preacher: { $regex: search, $options: 'i' } },
                    { scriptureReference: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const archive = await Sermon.find(filterQuery).sort({ deliveryDate: -1 });
        res.status(200).json(archive);
    } catch (error) {
        res.status(500).json({ error: "Failed to filter target sermon log archive." });
    }
};


export const createSermon = async (req, res) => {
    try {
        if (!verifyLeadershipRole(req.user)) {
            return res.status(403).json({ error: "Unauthorized: Leadership clearance required." });
        }

        const { title, preacher, scriptureReference, recapSummary, deliveryDate, audioVideoUrl } = req.body;
        const newSermon = await Sermon.create({ title, preacher, scriptureReference, recapSummary, deliveryDate, audioVideoUrl });
        
        res.status(201).json({ message: "Sermon logged into master archive", sermon: newSermon });
    } catch (error) {
        res.status(500).json({ error: "Server error processing sermon metadata." });
    }
};

export const updateSermon = async (req, res) => {
    try {
        if (!verifyLeadershipRole(req.user)) {
            return res.status(403).json({ error: "Unauthorized: Leadership clearance required." });
        }
        
        const { title, preacher, scriptureReference, recapSummary, deliveryDate, audioVideoUrl } = req.body;
        
        const updatedSermon = await Sermon.findByIdAndUpdate(
            req.params.id,
            { 
                title, 
                preacher, 
                scriptureReference: scriptureReference || "", 
                recapSummary: recapSummary || "", 
                deliveryDate: new Date(deliveryDate), 
                audioVideoUrl 
            },
            { new: true, runValidators: true }
        );

        if (!updatedSermon) return res.status(404).json({ error: "Sermon target not found" });
        res.status(200).json({ message: "Sermon successfully updated", sermon: updatedSermon });
    } catch (error) {
        res.status(500).json({ error: "Server error updating sermon record properties." });
    }
};

export const deleteSermon = async (req, res) => {
    try {
        if (!verifyLeadershipRole(req.user)) {
            return res.status(403).json({ error: "Unauthorized: Leadership clearance required." });
        }

        const deletedSermon = await Sermon.findByIdAndDelete(req.params.id);
        if (!deletedSermon) return res.status(404).json({ error: "Sermon target target not found" });
        
        res.status(200).json({ message: "Sermon dropped from records ledger assembly." });
    } catch (error) {
        res.status(500).json({ error: "Server error executing document removal transaction." });
    }
};

// ==========================================
// 📖 DEVOTIONALS CONTROLLERS
// ==========================================

// GET: Fetch target devotional by date and track type
export const getDailyDevotional = async (req, res) => {
    try {
        const { type, date } = req.query;
        
        if (!type) {
            return res.status(400).json({ error: "Missing required tracking query parameter: type" });
        }

        // Handle structural date parsing. Default to server target day at local midnight
        let searchDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(searchDate); startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(searchDate); endOfDay.setHours(23,59,59,999);

        const entry = await Devotional.findOne({
            type,
            publishDate: { $gte: startOfDay, $lte: endOfDay }
        });

        if (!entry) {
            return res.status(404).json({ message: "No devotional post entry found registered for this specific calendar date." });
        }

        res.status(200).json(entry);
    } catch (error) {
        res.status(500).json({ error: "Server failure fetching matching devotional document." });
    }
};

// POST: Seed a Devotional Day Log (Restricted)
export const createDevotional = async (req, res) => {
    try {
        if (!verifyLeadershipRole(req.user)) {
            return res.status(403).json({ error: "Unauthorized: Core operational clearance required." });
        }

        const { type, title, publishDate, memoryVerse, scriptureReading, commentary } = req.body;

        const newDevotional = await Devotional.create({ type, title, publishDate, memoryVerse, scriptureReading, commentary });
        res.status(201).json({ message: "Daily study successfully published.", devotional: newDevotional });
    } catch (error) {
        res.status(500).json({ error: "Failed to store devotional reading payload database structure." });
    }
};