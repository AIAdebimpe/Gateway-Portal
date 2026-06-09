import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const JWT_SECRET = process.env.JWT_SECRET;


export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, title } = req.body;
        
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: "All fields (fullName, email, password) are required." });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: "Email exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ 
            fullName, 
            email, 
            password: hashedPassword,
            role: 'member',
            title: title || 'Brother'
        });

        res.status(201).json({ message: "Registered successfully!", userId: newUser._id });
    } catch (error) {
        res.status(500).json({ error: "Registration failed." });
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