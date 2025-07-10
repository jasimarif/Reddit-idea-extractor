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
3. Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
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
3. Start the frontend:
   ```bash
   npm run dev
   ```

## Project Structure
- `server/` - Express backend (API routes, Reddit logic)
- `client/` - React frontend (UI components)

