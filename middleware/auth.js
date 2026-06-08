import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. Please log in first." });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token access pass." });
        }

        console.log("🕵️‍♂️ DECODED JWT PAYLOAD IS:", decodedPayload);
        req.user = decodedPayload;

        next();
    });
};


const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Administrative privileges required." });
    }

    next();
};


const requireStaff = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    const userRole = (req.user.role || req.user.Role || '').toString().toLowerCase().trim();
    const allowedRoles = ['pastor', 'admin'];
    
    if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: "Access denied. Only church staff or leaders can log attendance." });
    }

    next();
};


export { requireAuth, requireAdmin, requireStaff };
