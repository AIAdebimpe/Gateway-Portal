import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const JWT_SECRET = process.env.JWT_SECRET;


export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, title } = req.body;
        
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: "All fields (fullName, email, password) are required." });
        }

        // Standardize email casing to prevent duplicate accounts with different capitalization
        const cleanEmail = email.toLowerCase();

        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) return res.status(400).json({ error: "Email already registered." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ 
            fullName, 
            email: cleanEmail, 
            password: hashedPassword,
            role: 'member',
            title: title || 'Brother'
        });

        // 📌 FIX: Generate the token right away upon successful registration
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email, role: newUser.role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // 📌 FIX: Return a structural data payload matching your frontend expectations!
        res.status(201).json({ 
            message: "Registered successfully!", 
            token: token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                role: newUser.role,
                title: newUser.title
            }
        });
    } catch (error) {
        console.error("❌ REGISTRATION FAILURE ROOT CAUSE:", error);
        // 📌 FIX: Return the real error message so we can diagnose it if it still breaks
        res.status(500).json({ error: `Registration failed internally: ${error.message}` });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch data from Model
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        // Run the encryption match check
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        // Sign the token pass
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // Send data back to the View/Client
        res.status(200).json({ 
            message: "Logged in successfully!", 
            token:token, 
            user: {
                id: user._id,
                fullName: user.fullName,
                role: user.role,
                title: user.title || "Brother"
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Login failed." });
    }
};