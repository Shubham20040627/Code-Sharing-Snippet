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
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Create a snippet
app.post('/api/create', async (req, res) => {
  try {
    const { code, language, password, expiryHours } = req.body;
    
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
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let expiresAt = null;
    if (expiryHours) {
      expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    }

    const newSnippet = new Snippet({
      shortId,
      user: userId,
      code,
      language: language || 'javascript',
      password: hashedPassword,
      expiresAt
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
      return res.status(404).json({ error: 'Snippet not found or expired' });
    }

    // Check if password protected
    const isProtected = !!snippet.password;

    res.status(200).json({
      code: isProtected ? null : snippet.code,
      language: snippet.language,
      isProtected,
      createdAt: snippet.createdAt
    });
  } catch (error) {
    console.error('Error fetching snippet:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify password for a snippet
app.post('/api/snippet/:id/verify', async (req, res) => {
  try {
    const { password } = req.body;
    const snippet = await Snippet.findOne({ shortId: req.params.id });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    if (!snippet.password) {
      return res.status(200).json({ code: snippet.code });
    }

    const isMatch = await bcrypt.compare(password, snippet.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({ code: snippet.code });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
