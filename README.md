# SnippetShare - MERN Code Snippet Sharing App

A premium, full-stack code snippet sharing platform built with the MERN stack (MongoDB, Express, React, Node.js).

## Features
- **User Authentication:** Secure signup/login with JWT.
- **Personal Dashboard:** Manage and view all your saved snippets.
- **Syntax Highlighting:** Beautiful code display for multiple languages.
- **Password Protection:** Secure your sensitive snippets.
- **Snippet Expiry:** Automatic deletion after a set time via MongoDB TTL indexing.
- **Premium UI:** Dark mode with Framer Motion animations.

---

## How to Run the Application

### 1. Prerequisites
- **Node.js** installed on your system.
- **MongoDB** running locally (usually at `mongodb://localhost:27017`).

### 2. Backend Setup
1. Open a new terminal.
2. Navigate to the server directory:
   ```bash
   cd "c:/Users/Shubham/Code Snippet Sharing/server"
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
   *You should see "🚀 Server running on http://localhost:5000" and "✅ Connected to MongoDB".*

### 3. Frontend Setup
1. Open another terminal.
2. Navigate to the client directory:
   ```bash
   cd "c:/Users/Shubham/Code Snippet Sharing/client"
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

---

## Technical Stack
- **Frontend:** React, Vite, Framer Motion, Lucide-React, Axios.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Bcryptjs.
- **Styling:** Vanilla CSS with a focus on premium aesthetics.
