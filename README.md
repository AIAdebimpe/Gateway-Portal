# Gateway Portal

A Node.js / Express church administration portal for managing users, events, devotionals, sermons, attendance, and tasks.

## Features

- User authentication and role-based access
- Event creation, listing, and management
- Devotional content management
- Sermon management and display
- Attendance tracking for church activities
- Task assignment and coordination
- File upload support via `/uploads`
- Static front-end served from the `public/` folder

## Tech Stack

- Node.js
- Express
- MongoDB / Mongoose
- JSON Web Tokens (JWT)
- Multer for file uploads
- dotenv for environment configuration
- node-cron for scheduled tasks

## Project Structure

- `server.js` - Main Express server entry point
- `routes/` - API routing modules
- `controllers/` - Request handlers and business logic
- `models/` - Mongoose schemas
- `middleware/` - Authentication middleware
- `public/` - Front-end HTML pages
- `uploads/` - Uploaded files and assets
- `config/` - Database and environment configuration

## Getting Started

### Prerequisites

- Node.js v18+ (or compatible)
- MongoDB instance or Atlas URI

### Install dependencies

```bash
npm install
```

### Create environment file

Create a `.env` file in the project root with:

```env
PORT=3000
MONGO_URI=<your-mongodb-connection-string>
```

### Run the app

```bash
npm start
```

Then open `http://localhost:3000` in your browser.

## API Endpoints

- `POST /api/auth` - Authentication routes
- `GET/POST /api/tasks` - Task management
- `GET/POST /api/attendance` - Attendance tracking
- `GET/POST /api/users` - User operations
- `GET/POST /api/portal` - Portal content
- `GET/POST /api/events` - Event management
- `GET/POST /api/devotionals` - Devotional content
- `GET /uploads/...` - Static uploaded files

## Notes

- The app serves static HTML pages from `public/`.
- Uploaded assets are stored in the `uploads/` directory.
- MongoDB must be reachable with a valid `MONGO_URI`.

## License

This repository does not include a license file by default. Add one if you want to share or publish this project.
