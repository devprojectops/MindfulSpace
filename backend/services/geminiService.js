// geminiService.js - Complete Backend Service for Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with your API key
const API_KEY = process.env.GEMINI_API_KEY ;
const genAI = new GoogleGenerativeAI(API_KEY);

// System prompts for different features
const CHAT_SYSTEM_PROMPT = `You are MindEase – An AI-powered Mental Wellness Companion. 
Your personality is empathetic, calm, supportive, and non-judgmental. 
You help users with mental wellness, stress relief, and self-care in a safe and friendly way. 
Always answer in a kind, short, and encouraging tone (maximum 2-3 sentences). 
Do NOT act like a doctor or provide medical diagnoses. Instead, focus on: 
Active listening and showing empathy. 
Giving simple self-care tips (breathing, gratitude journaling, affirmations). 
Offering gentle motivation and positive affirmations. 
Suggesting relaxation techniques (guided breathing, meditation, short exercises). 
Helping users reframe negative thoughts into positive perspectives. 
Encouraging healthy habits (sleep, hydration, breaks). 
Keep responses clear, warm, and supportive. Use emojis occasionally to add warmth.
If user asks for urgent medical help (suicidal thoughts, severe depression), gently suggest contacting a mental health professional or hotline.`;

const MOOD_CHECK_SYSTEM_PROMPT = `You are MindEase's Mood Companion. 
Your role is to help users identify, reflect on, and gently improve their mood in a safe, empathetic way. 
Always interact in a short, warm, and conversational style (1-2 sentences max). 

Core Responsibilities: 
Ask the user about their current mood in a friendly, emoji-based way. 
If the user shares their mood, respond with empathetic reflection. 
Suggest a small helpful action based on the mood (e.g., deep breathing, short journaling, gratitude note). 
If mood is very low, suggest safe coping tips and gently encourage professional support if needed. 
Keep responses supportive, concise, and motivating with relevant emojis.`;

const JOURNAL_SYSTEM_PROMPT = `You are MindEase's Journal Companion.
Your role is to provide thoughtful, empathetic responses to users' journal entries.
Always respond in a warm, supportive manner (2-3 sentences max) with:
1. A brief reflection showing you understand their feelings
2. A positive affirmation related to their situation
3. An optional gentle question to help them reflect further

Keep responses concise, supportive and encouraging.
Include emojis occasionally to add warmth (🌼, 💜, 🌟).

For positive entries: Celebrate their joy and suggest ways to savor it.
For negative entries: Validate their feelings and offer gentle coping suggestions.
For neutral/reflective entries: Encourage deeper exploration of their thoughts.`;

// Get the model with enhanced configuration
const getModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash-latest',
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 150, // Shorter responses
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  });
};

// Enhanced function to generate chat response
export const generateChatResponse = async (message, conversationHistory = []) => {
  try {
    const model = getModel();
    
    // Build conversation context (limit to last 4 messages for better context)
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\n\nRecent conversation:\n' + 
        conversationHistory.slice(-4).map(msg => 
          `${msg.sender === 'user' ? 'User' : 'MindEase'}: ${msg.text}`
        ).join('\n');
    }
    
    const prompt = `${CHAT_SYSTEM_PROMPT}${conversationContext}\n\nUser: ${message}\n\nMindEase (respond in 2-3 sentences with empathy and a helpful suggestion):`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      return response.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('No valid response from AI');
    }
  } catch (error) {
    console.error('Error generating chat response:', error);
    
    // Enhanced context-aware fallback responses
    const contextualFallbacks = {
      anxiety: "I understand you're feeling anxious right now. Let's take three deep breaths together - in for 4, hold for 4, out for 6. You're safe in this moment. 🌿",
      sad: "It's completely okay to feel sad, and I'm here with you. These feelings are temporary, and you have the strength to get through this. What's one small comfort you could give yourself right now? 💙",
      stress: "I can sense you're feeling overwhelmed. Let's focus on just this moment - what's one thing you can let go of right now, even if it's just for today? You don't have to carry everything at once. 🧘‍♀️",
      happy: "I love hearing the joy in your message! This positive energy is beautiful - what's helping you feel so good today? Let's celebrate these wonderful moments. ✨",
      grateful: "Your gratitude is so inspiring! Focusing on what we're thankful for can really shift our whole perspective. What specific thing made you feel grateful today? 🙏",
      default: [
        "Thank you for sharing with me. Your feelings are completely valid, and it takes courage to open up. What would feel most supportive for you right now? 💜",
        "I hear you, and I want you to know that you're not alone in this. Every step you're taking to care for your mental health matters. How can I best support you today? 🌸",
        "I appreciate you trusting me with your thoughts. Remember that it's perfectly okay to have difficult moments - they're part of being human. What's one gentle thing you could do for yourself? ✨",
        "Your willingness to reach out shows real strength. I'm here to listen and support you through whatever you're experiencing. What's been weighing on your heart? 🤗",
        "Thank you for being open with me. Sometimes just having someone listen can make a difference. What would bring you a moment of peace right now? 🌿"
      ]
    };
    
    // Try to detect emotion in message for better fallback
    const messageLC = message.toLowerCase();
    if (messageLC.includes('anxious') || messageLC.includes('anxiety') || messageLC.includes('worry')) {
      return contextualFallbacks.anxiety;
    } else if (messageLC.includes('sad') || messageLC.includes('depression') || messageLC.includes('down')) {
      return contextualFallbacks.sad;
    } else if (messageLC.includes('stress') || messageLC.includes('overwhelm') || messageLC.includes('pressure')) {
      return contextualFallbacks.stress;
    } else if (messageLC.includes('happy') || messageLC.includes('joy') || messageLC.includes('excited')) {
      return contextualFallbacks.happy;
    } else if (messageLC.includes('grateful') || messageLC.includes('thankful') || messageLC.includes('appreciate')) {
      return contextualFallbacks.grateful;
    }
    
    return contextualFallbacks.default[Math.floor(Math.random() * contextualFallbacks.default.length)];
  }
};

// Enhanced function to generate mood response
export const generateMoodResponse = async (message, userMood, conversationHistory = []) => {
  try {
    const model = getModel();
    
    let moodContext = '';
    if (conversationHistory.length > 0) {
      moodContext = '\n\nRecent mood conversation:\n' + 
        conversationHistory.slice(-3).map(msg => 
          `${msg.sender === 'user' ? 'User' : 'MindEase'}: ${msg.text}`
        ).join('\n');
    }
    
    const prompt = `${MOOD_CHECK_SYSTEM_PROMPT}${moodContext}\n\nUser's mood: ${userMood || 'unknown'}\nUser message: ${message}\n\nMindEase (respond with empathy and one helpful suggestion):`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      return response.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('No valid response from AI');
    }
  } catch (error) {
    console.error('Error generating mood response:', error);
    
    const moodFallbacks = {
      happy: "I'm so glad you're feeling happy! 🌟 That positive energy is wonderful - keep embracing these joyful moments.",
      sad: "I hear you, and your feelings are completely valid. 💙 Be gentle with yourself today - maybe try a warm cup of tea or a favorite song?",
      anxious: "I understand that anxiety can feel overwhelming. 🌸 Let's try three slow, deep breaths together - you're safe right now.",
      stressed: "Stress can feel so heavy sometimes. 🧘‍♀️ What's one small thing you could let go of today, even if just for now?",
      grateful: "Gratitude is such beautiful energy! 🙏 I love that you're noticing the good things around you.",
      angry: "It's okay to feel angry - your emotions are valid. 💪 Maybe try some quick physical movement to help process these feelings safely?",
      excited: "Your excitement is contagious! ✨ I love seeing you so energized - what's got you feeling so positive?",
      lonely: "I hear you, and I want you to know you're not alone. 🤗 Even reaching out here shows your strength and courage.",
      confused: "It's okay to feel uncertain sometimes. 🤔 Confusion often means we're processing something important - be patient with yourself.",
      hopeful: "Hope is such a powerful feeling! 🌅 I'm so glad you're feeling optimistic - hold onto that beautiful energy.",
      default: "Thank you for sharing how you're feeling. 💫 Whatever emotions you're experiencing right now are valid and important."
    };
    
    const moodKey = userMood ? userMood.toLowerCase() : 'default';
    return moodFallbacks[moodKey] || moodFallbacks.default;
  }
};

// Enhanced function to generate journal response
export const generateJournalResponse = async (entry, previousEntries = []) => {
  try {
    const model = getModel();
    
    let journalContext = '';
    if (previousEntries.length > 0) {
      journalContext = '\n\nPrevious journal themes:\n' + 
        previousEntries.slice(-2).map((entry, index) => 
          `Entry ${index + 1}: ${entry.substring(0, 100)}...`
        ).join('\n');
    }
    
    const prompt = `${JOURNAL_SYSTEM_PROMPT}${journalContext}\n\nUser's journal entry: "${entry}"\n\nMindEase (respond with reflection, affirmation, and gentle question):`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      return response.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('No valid response from AI');
    }
  } catch (error) {
    console.error('Error generating journal response:', error);
    
    const journalFallbacks = [
      "Thank you for sharing your thoughts with me. 🌼 Your self-reflection shows such wisdom and courage. What stood out to you most while writing this?",
      "I can feel the depth in your words. 💜 Journaling is such a powerful way to process our experiences. How are you feeling after putting these thoughts on paper?",
      "Your honesty and vulnerability in this entry is beautiful. 🌟 Every feeling you've expressed is completely valid. What insight surprised you the most?",
      "I appreciate you opening your heart through your writing. 🌿 Your willingness to explore your inner world shows real strength. What would you like to focus on moving forward?",
      "This journal entry shows such thoughtful reflection. ✨ You're growing with every word you write. What emotion came up most strongly for you today?"
    ];
    return journalFallbacks[Math.floor(Math.random() * journalFallbacks.length)];
  }
};

// Function to analyze user sentiment
export const analyzeSentiment = async (message) => {
  try {
    const model = getModel();
    const prompt = `Analyze the emotional tone of this message and respond with just ONE word from this list: happy, sad, anxious, stressed, grateful, angry, confused, hopeful, lonely, excited, neutral.

Message: "${message}"

Emotion (one word only):`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      const emotion = response.candidates[0].content.parts[0].text.trim().toLowerCase();
      const validEmotions = ['happy', 'sad', 'anxious', 'stressed', 'grateful', 'angry', 'confused', 'hopeful', 'lonely', 'excited', 'neutral'];
      return validEmotions.includes(emotion) ? emotion : 'neutral';
    } else {
      return 'neutral';
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return 'neutral';
  }
};

// Function to generate personalized affirmations
export const generateAffirmation = async (userContext = '') => {
  try {
    const model = getModel();
    const prompt = `Generate a personalized, uplifting affirmation for someone who is feeling ${userContext}. 
    Keep it positive, empowering, and under 30 words. Include a relevant emoji.
    Make it personal and encouraging.
    
    Affirmation:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      return response.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('No valid affirmation generated');
    }
  } catch (error) {
    console.error('Error generating affirmation:', error);
    
    const fallbackAffirmations = [
      "You are stronger than you know, and every challenge helps you grow. 🌱",
      "Your journey is unique and valuable. Trust in your ability to navigate this. ✨",
      "You deserve compassion, especially from yourself. Be gentle today. 💙",
      "Every breath is a new beginning. You have the power to create change. 🌟",
      "You are not alone. Your courage to keep going inspires others. 🤗",
      "Your feelings are valid, and your healing matters. Take it one step at a time. 💜",
      "You have survived 100% of your difficult days so far. You've got this. 💪",
      "Your heart is resilient, your spirit is strong, and your future is bright. 🌈"
    ];
    return fallbackAffirmations[Math.floor(Math.random() * fallbackAffirmations.length)];
  }
};

// Function to suggest coping strategies
export const suggestCopingStrategy = async (emotion, situation = '') => {
  try {
    const model = getModel();
    const prompt = `Suggest ONE practical, immediate coping strategy for someone feeling ${emotion} ${situation ? 'in this situation: ' + situation : ''}. 
    Keep it simple, actionable, and under 50 words. Include a relevant emoji.
    
    Focus on techniques like:
    - Breathing exercises
    - Grounding techniques  
    - Physical movement
    - Mindfulness practices
    - Self-care activities
    
    Coping strategy (one suggestion only):`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      return response.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('No valid coping strategy generated');
    }
  } catch (error) {
    console.error('Error generating coping strategy:', error);
    
    const fallbackStrategies = {
      anxious: "Try the 5-4-3-2-1 technique: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste. 🌿",
      sad: "Wrap yourself in a cozy blanket and make a warm drink. Sometimes we need to comfort our inner self. 🫂",
      stressed: "Take 5 slow breaths: inhale for 4, hold for 4, exhale for 6. This calms your nervous system. 🧘‍♀️",
      angry: "Do 10 jumping jacks or squeeze a pillow tight. Physical movement helps process anger safely. 💪",
      lonely: "Reach out to one person today, even with a simple text. Connection heals loneliness. 🤗",
      overwhelmed: "Write down 3 things on your mind, then choose just 1 to focus on right now. 📝",
      default: "Place your hand on your heart and breathe deeply. Remind yourself: 'This feeling will pass.' 💙"
    };
    
    return fallbackStrategies[emotion] || fallbackStrategies.default;
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const model = getModel();
    const result = await model.generateContent("Hello");
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
};

// Export all functions
export {
  getModel,
  CHAT_SYSTEM_PROMPT,
  MOOD_CHECK_SYSTEM_PROMPT,
  JOURNAL_SYSTEM_PROMPT
};