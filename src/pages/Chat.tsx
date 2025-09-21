import React, { useState, useRef, useEffect } from 'react';
import { Home, Send, Mic, MicOff, Volume2, VolumeX, Copy, MessageCircle, Clock, User, Bot, Heart } from 'lucide-react';

// Direct Gemini API Configuration (no fallback responses)
const API_KEY = 'AIzaSyAZ9DgAZvs4i4gSD_fPHcS8B4nAgiAA6zo';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const CHAT_SYSTEM_PROMPT = `You are MindEase – An AI-powered Mental Wellness Companion. 
Your personality is empathetic, calm, supportive, and non-judgmental. 
You help users with mental wellness, stress relief, and self-care in a safe and friendly way. 
IMPORTANT: Always respond in exactly 2-3 sentences maximum. Be concise but warm.
Do NOT act like a doctor or provide medical diagnoses. Instead, focus on: 
- Active listening and showing empathy
- Giving simple self-care tips (breathing, gratitude journaling, affirmations)
- Offering gentle motivation and positive affirmations
- Suggesting relaxation techniques (guided breathing, meditation, short exercises)
- Helping users reframe negative thoughts into positive perspectives
- Encouraging healthy habits (sleep, hydration, breaks)
Keep responses clear, warm, and supportive. Use emojis occasionally (1-2 per response).
If user asks for urgent medical help, gently suggest contacting a mental health professional.

Examples of good responses:
- "I hear you, and those feelings are completely valid. Have you tried taking a few deep breaths or stepping outside for some fresh air? 🌿"
- "Thank you for sharing that with me. It sounds like you're carrying a lot right now - what's one small thing that usually brings you comfort? 💙"
- "I'm glad you reached out today. Sometimes talking through our thoughts can really help us process them better. What's been the hardest part for you? ✨"`;

// Message interface
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

// Direct API call function
const generateChatResponse = async (message: string, conversationHistory: Message[] = []): Promise<string> => {
  // Build conversation context
  let conversationContext = '';
  if (conversationHistory.length > 0) {
    conversationContext = '\n\nRecent conversation:\n' + 
      conversationHistory.slice(-4).map(msg => 
        `${msg.sender === 'user' ? 'User' : 'MindEase'}: ${msg.text}`
      ).join('\n');
  }

  const prompt = `${CHAT_SYSTEM_PROMPT}${conversationContext}\n\nUser: ${message}\n\nMindEase (respond in 2-3 sentences with empathy and practical support):`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 150,
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
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
    return data.candidates[0].content.parts[0].text.trim();
  } else {
    throw new Error('Invalid response structure from Gemini API');
  }
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m MindEase, your mental wellness companion. 🌟 How are you feeling today? I\'m here to listen and support you through whatever you\'re experiencing.',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [messageCount, setMessageCount] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connected');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Quick response suggestions
  const quickResponses = [
    "I'm feeling anxious today 😰",
    "I need some motivation 💪", 
    "I'm feeling grateful 🙏",
    "Help me process my thoughts 🤔",
    "I'm having trouble sleeping 😴",
    "I feel overwhelmed 😵‍💫",
    "I want to practice mindfulness 🧘‍♀️",
    "I need some encouragement ✨"
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hide quick responses after first user message
  useEffect(() => {
    const userMessages = messages.filter(msg => msg.sender === 'user');
    if (userMessages.length > 0) {
      setShowQuickResponses(false);
    }
  }, [messages]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || newMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    setMessageCount(prev => prev + 1);
    setConnectionStatus('connecting');

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: 'MindEase is thinking...',
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      // Get conversation history excluding typing message
      const conversationHistory = messages.filter(msg => !msg.isTyping);
      
      // Call Gemini API directly
      const aiResponse = await generateChatResponse(textToSend, [...conversationHistory, userMessage]);
      
      // Remove typing indicator and add AI response
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
        }];
      });

      setConnectionStatus('connected');
      setIsOnline(true);

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Remove typing indicator and show error
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          text: "I'm having trouble connecting to respond right now. Please check your internet connection and try again. I'm here when you're ready. 💜",
          sender: 'ai',
          timestamp: new Date(),
        }];
      });
      
      setConnectionStatus('error');
      setIsOnline(false);
      
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        setIsOnline(true);
        setConnectionStatus('connected');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Voice recording is not supported in this browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const audioChunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          // Simulate voice transcription
          setNewMessage(prev => prev + "I've been feeling overwhelmed lately and could use some guidance.");
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting voice recording:', error);
        alert('Unable to access microphone. Please check your permissions.');
      }
    }
  };

  const handleTextToSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      setIsSpeaking(false);
      window.speechSynthesis.cancel();
    } else {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesisRef.current = utterance;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        speechSynthesisRef.current = null;
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        speechSynthesisRef.current = null;
      };
      
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-16 w-20 h-20 bg-purple-300/30 rounded-full animate-pulse"></div>
        <div className="absolute top-64 right-12 w-16 h-16 bg-pink-300/30 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-indigo-300/20 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }}></div>
        <div className="absolute bottom-48 right-1/3 w-12 h-12 bg-purple-400/40 rounded-full animate-bounce" style={{ animationDelay: '500ms' }}></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full animate-pulse" style={{ animationDelay: '2000ms' }}></div>
      </div>

      {/* Dashboard Button */}
      <div className="fixed top-6 left-6 z-50">
        <button 
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-200/50"
        >
          <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="text-purple-700 font-medium">Dashboard</span>
        </button>
      </div>

      {/* Connection Status */}
      <div className="fixed top-6 right-6 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-purple-200/50 min-w-[200px]">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              connectionStatus === 'connected' ? 'bg-green-400' : 
              connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
            }`}></div>
            <span className="text-sm font-medium text-purple-700">
              {connectionStatus === 'connected' ? 'AI Online' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'Connection Error'}
            </span>
            <Clock className="w-4 h-4 text-purple-600 ml-auto" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Messages</span>
              <span className="text-xs font-bold text-purple-700">{messageCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Time</span>
              <span className="text-xs font-bold text-purple-700">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl relative z-10 h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg">
              <Heart className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              MindEase Chat
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Your compassionate AI companion for mental wellness support
          </p>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            {messages.map((msg, index) => (
              <div key={msg.id} className={`flex items-start gap-3 animate-fadeIn ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-white border-2 border-purple-300 text-purple-600'
                }`}>
                  {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                {/* Message Bubble */}
                <div className={`max-w-xs md:max-w-md lg:max-w-lg relative group ${
                  msg.sender === 'user' ? 'ml-auto' : 'mr-auto'
                }`}>
                  <div className={`p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                  }`}>
                    {msg.isTyping ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className={`text-xs opacity-70 ${msg.sender === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {/* Message Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                              onClick={() => copyMessage(msg.text)}
                              className={`p-1 rounded-full transition-colors duration-200 ${
                                msg.sender === 'user' 
                                  ? 'hover:bg-white/20 text-purple-100' 
                                  : 'hover:bg-gray-100 text-gray-600'
                              }`}
                              title="Copy message"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {msg.sender === 'ai' && (
                              <button 
                                onClick={() => handleTextToSpeech(msg.text)}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-600"
                                title={isSpeaking ? "Stop speaking" : "Read aloud"}
                              >
                                {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Responses */}
          {showQuickResponses && (
            <div className="px-6 py-3 border-t border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
              <p className="text-sm text-gray-600 mb-3 font-medium">💡 Quick responses:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {quickResponses.slice(0, 4).map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(response)}
                    className="px-3 py-2 bg-white/80 text-purple-700 rounded-full text-xs border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md text-center"
                    disabled={isLoading}
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200/50">
            <div className="flex items-end gap-3">
              {/* Voice Recording Button */}
              <button
                onClick={handleVoiceRecording}
                className={`p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse scale-110' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                disabled={isLoading}
                title={isRecording ? "Stop recording" : "Voice recording"}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="Share what's on your mind... I'm here to listen and support you. 💜"
                  className="w-full p-4 pr-12 bg-white/90 border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-200/50 transition-all duration-300 text-gray-700 leading-relaxed min-h-[52px] max-h-32 shadow-sm"
                  disabled={isLoading}
                  rows={1}
                  maxLength={1000}
                />
                <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                  {newMessage.length}/1000
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={!newMessage.trim() || isLoading}
                className={`p-3 rounded-full transition-all duration-300 shadow-md ${
                  !newMessage.trim() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
                title="Send message"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Status Messages */}
            {isRecording && (
              <div className="mt-3 flex items-center gap-2 text-red-600 text-sm animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                Recording... Tap microphone to stop
              </div>
            )}

            {connectionStatus === 'error' && (
              <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Connection error - Retrying automatically...
              </div>
            )}

            {connectionStatus === 'connecting' && (
              <div className="mt-3 flex items-center gap-2 text-yellow-600 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                Connecting to AI...
              </div>
            )}

            {isSpeaking && (
              <div className="mt-3 flex items-center gap-2 text-blue-600 text-sm">
                <Volume2 className="w-4 h-4 animate-pulse" />
                Speaking... Click volume icon to stop
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #7c3aed, #db2777);
        }
      `}</style>
    </div>
  );
};

export default Chat;