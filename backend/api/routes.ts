import geminiService from '../services/geminiService';

// Type definitions
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type MoodEntry = {
  mood: string;
  timestamp: number;
};

// In-memory storage (would be replaced with Firestore in production)
let chatHistory: ChatMessage[] = [];
let moodHistory: MoodEntry[] = [];
let journalEntries: {entry: string, response: string, timestamp: number}[] = [];

// Chat API endpoint
export const handleChatRequest = async (message: string) => {
  try {
    // Add user message to history
    chatHistory.push({ role: 'user', content: message });
    
    // Generate response
    const response = await geminiService.generateChatResponse(message, chatHistory);
    
    // Add assistant response to history
    chatHistory.push({ role: 'assistant', content: response });
    
    // Return the response
    return {
      success: true,
      message: response,
      history: chatHistory
    };
  } catch (error) {
    console.error('Error in chat request:', error);
    return {
      success: false,
      error: 'Failed to process chat request'
    };
  }
};

// Mood check API endpoint
export const handleMoodRequest = async (mood: string) => {
  try {
    // Add mood to history
    const moodEntry = { mood, timestamp: Date.now() };
    moodHistory.push(moodEntry);
    
    // Generate response
    const response = await geminiService.generateMoodResponse(mood, moodHistory);
    
    // Return the response
    return {
      success: true,
      message: response,
      moodHistory
    };
  } catch (error) {
    console.error('Error in mood request:', error);
    return {
      success: false,
      error: 'Failed to process mood request'
    };
  }
};

// Journal API endpoint
export const handleJournalRequest = async (entry: string) => {
  try {
    // Generate response
    const response = await geminiService.generateJournalResponse(entry);
    
    // Save entry and response
    const journalEntry = {
      entry,
      response,
      timestamp: Date.now()
    };
    
    journalEntries.push(journalEntry);
    
    // Return the response
    return {
      success: true,
      message: response,
      journalEntries
    };
  } catch (error) {
    console.error('Error in journal request:', error);
    return {
      success: false,
      error: 'Failed to process journal request'
    };
  }
};

// Helper to clear history (for testing)
export const clearHistory = () => {
  chatHistory = [];
  moodHistory = [];
  journalEntries = [];
  return { success: true, message: 'History cleared' };
};

export default {
  handleChatRequest,
  handleMoodRequest,
  handleJournalRequest,
  clearHistory
};