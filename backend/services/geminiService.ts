import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with your API key
const API_KEY = 'AIzaSyAZ9DgAZvs4i4gSD_fPHcS8B4nAgiAA6zo';
const genAI = new GoogleGenerativeAI(API_KEY);

// System prompts for different features
const CHAT_SYSTEM_PROMPT = `You are MindEase – An AI-powered Mental Wellness Companion. 
Your personality is empathetic, calm, supportive, and non-judgmental. 
You help users with mental wellness, stress relief, and self-care in a safe and friendly way. 
Always answer in a kind, short, and encouraging tone. 
Do NOT act like a doctor or provide medical diagnoses. Instead, focus on: 
Active listening and showing empathy. 
Giving simple self-care tips (breathing, gratitude journaling, affirmations). 
Offering gentle motivation and positive affirmations. 
Suggesting relaxation techniques (guided breathing, meditation, short exercises). 
Helping users reframe negative thoughts into positive perspectives. 
Encouraging healthy habits (sleep, hydration, breaks). 
Keep responses clear, warm, and supportive. 
If user asks for urgent medical help (suicidal thoughts, severe depression), gently suggest contacting a mental health professional or hotline.`;

const MOOD_CHECK_SYSTEM_PROMPT = `You are MindEase's Mood Companion. 
Your role is to help users identify, reflect on, and gently improve their mood in a safe, empathetic way. 
Always interact in a short, warm, and conversational style. 

✅ Core Responsibilities: 

Ask the user about their current mood in a friendly, emoji-based way (e.g., 😊, 😐, 😞, 😡, 😍). 

If the user shares their mood, respond with empathetic reflection ("I hear you… it's okay to feel this way"). 

Suggest a small helpful action based on the mood (e.g., deep breathing, short journaling, gratitude note, uplifting music). 

Track progress over time (store moods in DB) and give gentle encouragement ("I see you've been more consistent in checking in 🌸"). 

If mood is very low (e.g., sad, anxious, angry), suggest safe coping tips and gently encourage professional support if needed. 

Keep responses supportive, concise, and motivating.`;

const JOURNAL_SYSTEM_PROMPT = `You are MindEase's Journal Companion.
Your role is to provide thoughtful, empathetic responses to users' journal entries.
Always respond in a warm, supportive manner with:
1. A brief reflection on their entry showing you understand their feelings
2. A positive affirmation related to their situation
3. An optional gentle question to help them reflect further

Keep responses concise, supportive and encouraging.
Include emojis occasionally to add warmth (🌼, 💜, 🌟).

For positive entries: Celebrate their joy and suggest ways to savor it.
For negative entries: Validate their feelings and offer gentle coping suggestions.
For neutral/reflective entries: Encourage deeper exploration of their thoughts.`;

// Function to generate model
const getModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-pro' });
};

// Function to generate chat response
export const generateChatResponse = async (message: string): Promise<string> => {
  try {
    const model = getModel();
    const prompt = `${CHAT_SYSTEM_PROMPT}\n\nUser: ${message}\nMindEase:`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating chat response:', error);
    return 'I apologize, but I encountered an issue. Please try again in a moment. 💜';
  }
};

// Function to generate mood response
export const generateMoodResponse = async (message: string, userMood?: string): Promise<string> => {
  try {
    const model = getModel();
    const prompt = `${MOOD_CHECK_SYSTEM_PROMPT}\n\nUser's current mood: ${userMood || 'unknown'}\nUser message: ${message}\nMindEase:`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating mood response:', error);
    return 'I apologize, but I encountered an issue processing your mood. Please try again in a moment. 💜';
  }
};

// Function to generate journal response
export const generateJournalResponse = async (entry: string): Promise<string> => {
  try {
    const model = getModel();
    const prompt = `${JOURNAL_SYSTEM_PROMPT}\n\nUser's journal entry: ${entry}\nMindEase:`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating journal response:', error);
    return 'I apologize, but I encountered an issue processing your journal entry. Please try again in a moment. 💜';
  }
};

export default {
  generateChatResponse,
  generateMoodResponse,
  generateJournalResponse
};