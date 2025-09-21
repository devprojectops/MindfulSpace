import { generateChatResponse, generateMoodResponse, generateJournalResponse } from '../services/geminiService.js';

// API handler for frontend to call
export const apiHandler = {
  // Chat API
  chat: async (message: string) => {
    return await generateChatResponse(message);
  },
  
  // Mood check API
  mood: async (mood: string, userMood?: string) => {
    return await generateMoodResponse(mood, userMood);
  },
  
  // Journal API
  journal: async (entry: string) => {
    return await generateJournalResponse(entry);
  }
};

export default apiHandler;