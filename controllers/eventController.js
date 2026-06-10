import Event from '../models/Events.js';

export const createEvent = async (req, res) => {
    try {
        const { title, description, eventDate, location } = req.body;
        const requestingUser = req.user;

        if (!title || !eventDate) {
            return res.status(400).json({ error: "Event Title and Event Date are required." });
        }

        let flyerUrl = "";
        if (req.file) {
            flyerUrl = `/uploads/${req.file.filename}`;
        } else if (req.body.flyerUrl && req.body.flyerUrl.trim() !== "") {
            flyerUrl = req.body.flyerUrl; // Fallback text payload string match
        } else {
            return res.status(400).json({ error: "A program poster image file is required." });
        }

        const creatorId = requestingUser ? (requestingUser.userId || requestingUser._id || requestingUser.id) : null;

        const newEvent = await Event.create({
            title,
            description: description || "",
            eventDate,
            location: location || "Main Sanctuary",
            flyerUrl: flyerUrl,
            createdBy: creatorId
        });

        return res.status(201).json({ message: "Event published successfully!", event: newEvent });

    } catch (error) {
        console.error("Event Creation Error:", error);
        return res.status(500).json({ error: "Server error occurred while creating event." });
    }
};

// Optional: Public route to pull upcoming events
export const getUpcomingEvents = async (req, res) => {
    try {
        const events = await Event.find({ eventDate: { $gte: new Date() } })
            .populate('createdBy', 'fullName role')
            .sort({ eventDate: 1 });
        return res.status(200).json(events);
    } catch (error) {
        return res.status(500).json({ error: "Failed to pull upcoming events." });
    }
};