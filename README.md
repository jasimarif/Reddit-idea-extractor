# Reddit Idea Extractor

A full-stack web app to extract and display top Reddit posts from any subreddit. Built with Express.js (backend) and React + Vite (frontend).

## Getting Started

### Backend Setup
1. Navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory (optional; defaults are provided for local dev):
   ```env
   # If omitted, server defaults to 3000
   PORT=3000

   # Database (falls back to mongodb://localhost:27017/reddit_idea_extractor if omitted)
   MONGO_URI=mongodb://localhost:27017/reddit_idea_extractor

   # Optional: Redis (falls back to redis://localhost:6379 if omitted)
   # REDIS_URL=redis://localhost:6379

   # Any other required secrets
   OPENAI_API_KEY=your-openai-secret-key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `client` folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory to point to your local API:
   ```env
   VITE_API_URL=http://localhost:3000
   
   # Supabase (if used locally)
   # VITE_SUPABASE_URL=your-local-or-cloud-supabase-url
   # VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

## Project Structure
- `server/` - Express backend (API routes, Reddit logic)
- `client/` - React frontend (UI components)

