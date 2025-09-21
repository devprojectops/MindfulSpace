import { generateChatResponse, generateMoodResponse, generateJournalResponse } from '../services/geminiService.js';

// API handler for frontend to call
const apiHandler = {
  // Chat API
  chat: async (message) => {
    return await generateChatResponse(message);
  },
  
  // Mood check API
  mood: async (message, userMood) => {
    return await generateMoodResponse(message, userMood);
  },
  
  // Journal API
  journal: async (entry) => {
    return await generateJournalResponse(entry);
  }
};

export default apiHandler;