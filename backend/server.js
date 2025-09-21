import express from 'express';
import cors from 'cors';
import api from './api/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await api.chat(message);
    res.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

app.post('/api/mood', async (req, res) => {
  try {
    const { message, mood: userMood } = req.body;
    const response = await api.mood(message, userMood);
    res.json({ response });
  } catch (error) {
    console.error('Mood API error:', error);
    res.status(500).json({ error: 'Failed to process mood request' });
  }
});

app.post('/api/journal', async (req, res) => {
  try {
    const { entry } = req.body;
    const response = await api.journal(entry);
    res.json({ response });
  } catch (error) {
    console.error('Journal API error:', error);
    res.status(500).json({ error: 'Failed to process journal request' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});