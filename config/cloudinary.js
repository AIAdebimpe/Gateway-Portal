// 📁 config/cloudinary.js
import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';


// Configure Cloudinary with credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up the storage engine pointing to Cloudinary instead of local disk
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'gateway_portal_uploads', // The folder name inside your Cloudinary Media Library
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        public_id: (req, file) => {
            // Generate a clean filename without extensions (Cloudinary handles extensions automatically)
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `${file.fieldname}-${uniqueSuffix}`;
        }
    }
});

export const uploadCloud = multer({ storage: storage });