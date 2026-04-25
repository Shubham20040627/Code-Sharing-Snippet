import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import Snippet from './models/Snippet.js';

import authRoutes from './routes/authRoutes.js';
import { auth } from './middleware/auth.js';
import pkg from 'jsonwebtoken';
const { verify } = pkg;

dotenv.config();

const app = express();

// Production CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ FATAL: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// MongoDB Connection with improved stability and logging
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // On Render, we want to know if it's a timeout or auth error
    if (err.message.includes('timeout')) {
      console.log('TIP: Check your MongoDB Atlas Network Access (IP Whitelist).');
    }
  }
};

connectDB();

// Create a snippet
app.post('/api/create', async (req, res) => {
  try {
    const { code, language } = req.body;
    
    // Optional user authentication
    let userId = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        userId = decoded._id;
      } catch (e) {
        // Token is invalid, but we'll still allow anonymous creation
      }
    }

    if (!code) {
      return res.status(400).json({ error: 'Code content is required' });
    }

    const shortId = nanoid(10);


    const newSnippet = new Snippet({
      shortId,
      user: userId,
      code,
      language: language || 'javascript',

    });

    await newSnippet.save();

    res.status(201).json({ 
      shortId,
      message: 'Snippet created successfully'
    });
  } catch (error) {
    console.error('Error creating snippet:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a snippet by ID
app.get('/api/snippet/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findOne({ shortId: req.params.id });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    // Optional user authentication to check if user is the owner
    let isOwner = false;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        if (snippet.user && snippet.user.toString() === decoded._id) {
          isOwner = true;
        }
      } catch (e) {
        // Token is invalid, treat as anonymous
      }
    }

    res.status(200).json({
      code: snippet.code,
      language: snippet.language,
      isProtected: false,
      createdAt: snippet.createdAt
    });
  } catch (error) {
    console.error('Error fetching snippet:', error);
    res.status(500).json({ error: 'Server error' });
  }
});




app.delete("/api/snippet/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by _id first, then by shortId if cast fails
    let snippet = null;
    try {
      snippet = await Snippet.findOne({ _id: id, user: req.user._id });
    } catch (e) {
      // If it's not a valid ObjectId, try finding by shortId
      snippet = await Snippet.findOne({ shortId: id, user: req.user._id });
    }

    if (!snippet) {
      console.log(`Deletion failed: Snippet ${id} not found for user ${req.user.email}`);
      return res.status(404).json({ error: "Snippet not found or unauthorized" });
    }

    await Snippet.deleteOne({ _id: snippet._id });
    res.json({ message: "Snippet deleted successfully" });
  } catch (error) {
    console.error('Error deleting snippet:', error);
    res.status(500).json({ error: "Server error" });
  }
});






app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

