# FishCare Backend

## Setup

1. Install dependencies:
   ```
   npm install express mongoose cors bcryptjs
   ```
2. Copy `.env.example` to `.env` and update as needed.
3. Start MongoDB locally (default URI: `mongodb://localhost:27017/fishcare`).
4. Run the server:
   ```
   npm start
   ```

## API Endpoints

### User
- `POST /api/users/signup` — Sign up (name, email, password)
- `POST /api/users/signin` — Sign in (email, password)

### Scan
- `POST /api/scans/add` — Add scan (userId, imageUrl, result)
- `GET /api/scans/history/:userId` — Get scan history

