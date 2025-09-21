import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, Heart, Sparkles, TrendingUp, Calendar, Clock, Send, Smile, 
  AlertCircle, RefreshCw, Volume2, VolumeX, Share2, Download, 
  Target, Brain, Lightbulb, Award, BarChart3, Zap
} from 'lucide-react';

// Gemini API Configuration
const API_KEY = 'AIzaSyAZ9DgAZvs4i4gSD_fPHcS8B4nAgiAA6zo'; // Replace with your actual Gemini API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

// Generate mood response
const generateMoodResponse = async (message, selectedMood) => {
  const moodContext = selectedMood ? 
    `\nSelected Mood: ${selectedMood.emoji} ${selectedMood.label} - ${selectedMood.description}` : '';

  const prompt = `You are MindEase's Mood Companion - a warm, empathetic AI mental wellness assistant.

PERSONALITY: Caring, gentle, supportive, understanding, non-judgmental
TONE: Warm and conversational, like talking to a close friend who truly cares  
RESPONSE LENGTH: Always exactly 2-3 sentences, never longer

YOUR ROLE:
- Validate and acknowledge their feelings with genuine empathy
- Provide ONE specific, actionable suggestion based on their mood
- Use natural, encouraging language (not clinical or robotic)
- Include 1-2 relevant emojis naturally in your response${moodContext}

User's message: "${message}"

Respond with empathy and one practical suggestion (2-3 sentences):`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 120,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ]
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    let text = data.candidates[0].content.parts[0].text.trim();
    text = text.replace(/^(MindEase|AI|Assistant):\s*/i, '');
    text = text.replace(/\n+/g, ' ');
    return text.trim();
  } else {
    throw new Error('Invalid response from Gemini API');
  }
};

// Generate daily affirmation
const generateDailyAffirmation = async (mood) => {
  const prompt = `Create a personalized, uplifting affirmation for someone feeling ${mood}. 

Requirements:
- Personal and encouraging
- Present tense  
- Under 25 words
- Include one relevant emoji
- Focused on strength and self-compassion

Affirmation:`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.8, maxOutputTokens: 80 }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
           "You are stronger than you know, and every challenge helps you grow. 🌱";
  } catch (error) {
    return "Your feelings are valid and your journey matters. You're doing better than you think. ✨";
  }
};

const MoodCheck = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [showMoodTrend, setShowMoodTrend] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [dailyAffirmation, setDailyAffirmation] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [moodStreak, setMoodStreak] = useState(0);

  // Mood options
  const MOOD_OPTIONS = [
    { emoji: '😊', label: 'Happy', color: 'from-yellow-400 to-yellow-500', description: 'Feeling joyful and positive', category: 'positive' },
    { emoji: '😍', label: 'Excited', color: 'from-pink-400 to-pink-500', description: 'Full of energy and enthusiasm', category: 'positive' },
    { emoji: '😌', label: 'Peaceful', color: 'from-green-400 to-green-500', description: 'Calm and relaxed', category: 'positive' },
    { emoji: '🙂', label: 'Content', color: 'from-blue-400 to-blue-500', description: 'Satisfied and comfortable', category: 'positive' },
    { emoji: '🤗', label: 'Grateful', color: 'from-purple-400 to-purple-500', description: 'Appreciative and thankful', category: 'positive' },
    { emoji: '😐', label: 'Neutral', color: 'from-gray-400 to-gray-500', description: 'Neither good nor bad', category: 'neutral' },
    { emoji: '😔', label: 'Sad', color: 'from-blue-500 to-blue-600', description: 'Feeling down or melancholy', category: 'negative' },
    { emoji: '😞', label: 'Disappointed', color: 'from-purple-500 to-purple-600', description: 'Let down or discouraged', category: 'negative' },
    { emoji: '😤', label: 'Frustrated', color: 'from-orange-500 to-orange-600', description: 'Annoyed or irritated', category: 'negative' },
    { emoji: '😰', label: 'Anxious', color: 'from-red-400 to-red-500', description: 'Feeling worried or nervous', category: 'negative' },
    { emoji: '😡', label: 'Angry', color: 'from-red-500 to-red-600', description: 'Feeling upset or mad', category: 'negative' },
    { emoji: '🥺', label: 'Vulnerable', color: 'from-pink-300 to-pink-400', description: 'Feeling sensitive or exposed', category: 'negative' }
  ];

  // Time-based greetings
  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning! 🌅';
    if (hour < 17) return 'Good afternoon! ☀️';
    if (hour < 21) return 'Good evening! 🌆';
    return 'Good night! 🌙';
  };

  // Initialize effects
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('moodHistory');
    const savedStreak = localStorage.getItem('moodStreak');
    
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setMoodHistory(parsed.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        })));
      } catch (error) {
        console.error('Error loading mood history:', error);
      }
    }
    
    if (savedStreak) setMoodStreak(parseInt(savedStreak));
    
    // Generate daily affirmation on load
    generateTodaysAffirmation();
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (moodHistory.length > 0) {
      localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
    }
  }, [moodHistory]);

  useEffect(() => {
    localStorage.setItem('moodStreak', moodStreak.toString());
  }, [moodStreak]);

  const generateTodaysAffirmation = async () => {
    try {
      const mood = selectedMood?.label.toLowerCase() || 'peaceful';
      const affirmation = await generateDailyAffirmation(mood);
      setDailyAffirmation(affirmation);
    } catch (error) {
      setDailyAffirmation("You are worthy of love, peace, and happiness exactly as you are. 💙");
    }
  };

  const handleMoodSelect = useCallback((moodOption) => {
    setSelectedMood(moodOption);
    setUserInput(`I'm feeling ${moodOption.emoji} (${moodOption.label.toLowerCase()}) today. ${moodOption.description}.`);
    
    // Update daily affirmation
    generateDailyAffirmation(moodOption.label.toLowerCase())
      .then(setDailyAffirmation)
      .catch(() => setDailyAffirmation("Your feelings are valid and important. 💜"));
  }, []);

  const handleSubmit = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setConnectionStatus('connecting');
    
    try {
      const response = await generateMoodResponse(userInput, selectedMood);
      
      setAiResponse(response);
      setConnectionStatus('connected');
      
      const newEntry = {
        mood: selectedMood,
        input: userInput,
        response: response,
        timestamp: new Date(),
        id: Date.now()
      };
      
      setMoodHistory(prev => {
        const updated = [newEntry, ...prev.slice(0, 19)];
        
        const last7Days = updated.filter(entry => {
          const daysDiff = (parseInt(new Date().getTime().toString()) - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        });
        
        const positiveCount = last7Days.filter(entry => 
          entry.mood?.category === 'positive'
        ).length;
        
        setMoodStreak(positiveCount);
        
        return updated;
      });
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Unable to get AI response right now. Please check your connection and try again.');
      setConnectionStatus('error');
      
      setTimeout(() => setConnectionStatus('connected'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextToSpeech = (text) => {
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
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const exportMoodData = () => {
    const data = {
      moodHistory,
      moodStreak,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMoodTrendEmoji = () => {
    if (moodHistory.length < 2) return '📊';
    const recent = moodHistory.slice(0, 5);
    const positiveCount = recent.filter(entry => entry.mood?.category === 'positive').length;
    
    if (positiveCount >= 3) return '📈';
    if (positiveCount <= 1) return '📉';
    return '📊';
  };

  const getMoodStats = () => {
    if (moodHistory.length === 0) return { total: 0, positive: 0, negative: 0, neutral: 0 };
    
    const stats = moodHistory.reduce((acc, entry) => {
      acc.total++;
      if (entry.mood?.category) acc[entry.mood.category]++;
      return acc;
    }, { total: 0, positive: 0, negative: 0, neutral: 0 });
    
    return stats;
  };

  const getSuggestedActivities = () => {
    if (!selectedMood) return defaultActivities;
    
    const activities = {
      'Happy': ['🎵 Create a Joy Playlist', '📞 Share Your Happiness', '🌟 Set a New Goal', '📚 Learn Something Fun'],
      'Excited': ['💃 Dance to Your Favorite Song', '🎨 Start a Creative Project', '🏃‍♂️ Energizing Workout', '🎯 Try Something New'],
      'Peaceful': ['🧘 Extended Meditation', '🌸 Mindful Nature Walk', '☕ Quiet Tea Ceremony', '📖 Read Poetry'],
      'Content': ['📝 Gratitude Journal', '🌱 Self-Care Routine', '🎶 Favorite Playlist', '🍃 Fresh Air Break'],
      'Grateful': ['🙏 Thank Someone', '📸 Capture Beautiful Moments', '💌 Write a Thank You Note', '🌟 Count Your Blessings'],
      'Neutral': ['🚶‍♂️ Light Walk', '🎵 Mood Music', '📱 Check In with Friend', '🌅 Mindful Breathing'],
      'Sad': ['🫂 Gentle Self-Care', '☕ Warm Comfort Drink', '🎵 Comforting Music', '💙 Call Support Person'],
      'Disappointed': ['📝 Write Your Feelings', '🛁 Relaxing Bath', '🌿 Breathing Exercise', '💜 Practice Self-Compassion'],
      'Frustrated': ['🏃‍♂️ Physical Release', '📝 Vent in Journal', '🎵 Energetic Music', '🧘‍♀️ Calm Breathing'],
      'Anxious': ['🌬️ Deep Breathing', '🧘‍♀️ Grounding Exercise', '☕ Calming Herbal Tea', '📞 Trusted Friend'],
      'Angry': ['🏃‍♂️ Physical Exercise', '🥊 Stress Ball Squeeze', '📝 Anger Journal', '🎵 Release Music'],
      'Vulnerable': ['🤗 Self-Soothing Activity', '📝 Gentle Journaling', '☕ Nurturing Self-Care', '💙 Connect with Support']
    };
    
    return activities[selectedMood?.label] || defaultActivities;
  };

  const defaultActivities = ['🧘 5-Minute Meditation', '📝 Gratitude Journal', '🎵 Mood Music', '🌱 Breathing Exercise'];

  const stats = getMoodStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-16 w-20 h-20 bg-purple-300/30 rounded-full animate-pulse"></div>
        <div className="absolute top-64 right-12 w-16 h-16 bg-pink-300/30 rounded-full animate-bounce delay-[500ms]"></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-indigo-300/20 rounded-full animate-pulse delay-[1000ms]"></div>
        <div className="absolute bottom-48 right-1/3 w-12 h-12 bg-purple-400/40 rounded-full animate-bounce delay-[1500ms]"></div>
      </div>

      {/* Dashboard Button */}
      <div className="fixed top-6 left-6 z-50">
        <button 
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-200"
        >
          <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="text-purple-700 font-medium">Dashboard</span>
        </button>
      </div>

      {/* Connection Status & Tools */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        <button
          onClick={exportMoodData}
          className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-200"
          title="Export Mood Data"
        >
          <Download className="w-5 h-5 text-purple-700" />
        </button>
        
        <div className="bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-purple-200">
          <div className="flex items-center gap-2 text-purple-700">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              connectionStatus === 'connected' ? 'bg-green-400' : 
              connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
            }`}></div>
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg animate-pulse">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Mood Check-In
              </h1>
              <p className="text-purple-600 font-medium">{getTimeBasedGreeting()}</p>
            </div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Your feelings matter. Check in with yourself and get personalized AI support for your mental wellness.
          </p>
        </div>

        {/* Daily Affirmation Card */}
        {dailyAffirmation && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <h3 className="text-lg font-semibold">Daily Affirmation</h3>
                </div>
                <button
                  onClick={() => handleTextToSpeech(dailyAffirmation)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-300"
                  title={isSpeaking ? "Stop speaking" : "Read aloud"}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-purple-100 leading-relaxed">{dailyAffirmation}</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">×</button>
          </div>
        )}

        {/* Stats Dashboard */}
        {moodHistory.length > 0 && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/20 text-center">
              <Award className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-gray-700">{moodStreak}</div>
              <div className="text-sm text-gray-600">Positive Streak</div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/20 text-center">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Check-ins</div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/20 text-center">
              <Brain className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-gray-700">
                {stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Positive Moods</div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/20 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-gray-700">{getMoodTrendEmoji()}</div>
              <div className="text-sm text-gray-600">Trend</div>
            </div>
          </div>
        )}

        {/* Mood History Quick View */}
        {moodHistory.length > 0 && (
          <div className="mb-6">
            <button 
              onClick={() => setShowMoodTrend(!showMoodTrend)}
              className="w-full bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-700">Recent Mood History</span>
                  <span className="text-2xl">{getMoodTrendEmoji()}</span>
                </div>
                <div className="flex gap-1">
                  {moodHistory.slice(0, 7).map((entry, index) => (
                    <div key={entry.id} className="text-xl transition-all duration-300" style={{opacity: 1 - index * 0.12}}>
                      {entry.mood?.emoji || '😐'}
                    </div>
                  ))}
                </div>
              </div>
              
              {showMoodTrend && (
                <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {moodHistory.slice(0, 6).map((entry) => (
                      <div key={entry.id} className="text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{entry.mood?.emoji || '😐'}</span>
                          <span className="text-sm font-medium text-purple-700">{entry.mood?.label || 'Unknown'}</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-1">{entry.input}</p>
                        {entry.response && (
                          <p className="text-xs text-purple-600 italic line-clamp-1">"{entry.response.substring(0, 80)}..."</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Main Mood Selection Card */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 p-6">
              <div className="flex items-center gap-3">
                <Smile className="w-6 h-6 text-white animate-bounce" />
                <h2 className="text-2xl font-bold text-white">How are you feeling right now?</h2>
              </div>
              <p className="text-purple-100 mt-2">
                Choose the emoji that best represents your current emotional state
              </p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6">
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood.emoji}
                    onClick={() => handleMoodSelect(mood)}
                    className={`group relative p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 ${
                      selectedMood?.emoji === mood.emoji
                        ? `bg-gradient-to-br ${mood.color} shadow-lg scale-105 text-white`
                        : 'bg-white shadow-md hover:shadow-xl border border-gray-100'
                    }`}
                    disabled={isLoading}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{mood.emoji}</div>
                      <div className={`text-xs font-medium ${
                        selectedMood?.emoji === mood.emoji ? 'text-white' : 'text-gray-700'
                      }`}>
                        {mood.label}
                      </div>
                    </div>
                    
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10 shadow-xl">
                      <div className="font-medium">{mood.label}</div>
                      <div className="text-gray-300">{mood.description}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{selectedMood.emoji}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-purple-700 text-lg">Feeling {selectedMood.label}</div>
                      <div className="text-sm text-gray-600">{selectedMood.description}</div>
                      <div className="text-xs text-purple-600 mt-1">
                        Category: <span className="font-medium capitalize">{selectedMood.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={generateTodaysAffirmation}
                        className="p-2 bg-purple-200 rounded-full hover:bg-purple-300 transition-colors"
                        title="Generate new affirmation"
                      >
                        <RefreshCw className="w-4 h-4 text-purple-700" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative mb-6">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Tell me more about how you're feeling... What's on your mind today? What specific thoughts or situations are contributing to this mood?"
                  className="w-full h-36 p-6 bg-gradient-to-br from-gray-50 to-purple-50 border-2 border-purple-200 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-purple-300/50 focus:border-purple-400 transition-all duration-300 text-gray-700 leading-relaxed placeholder-gray-400"
                  disabled={isLoading}
                  maxLength={750}
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <span className="text-gray-400 text-sm">{userInput.length}/750</span>
                  {userInput.length > 50 && (
                    <Zap className="w-4 h-4 text-green-500"  title ="Good detail level!" />
                  )}
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!userInput.trim() || isLoading}
                className={`w-full px-8 py-5 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  !userInput.trim() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Getting personalized AI support...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    Get Personalized AI Support & Guidance
                    <Brain className="w-6 h-6 animate-pulse" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* AI Response Card */}
        {aiResponse && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
              <div className="relative p-8 text-white">
                <div className="absolute top-4 right-4 opacity-20">
                  <Heart className="w-16 h-16 animate-pulse" />
                </div>
                <div className="absolute bottom-4 left-4 opacity-20">
                  <Sparkles className="w-10 h-10 animate-pulse" />
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                      <Brain className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold">AI Mood Support & Guidance</h3>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTextToSpeech(aiResponse)}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
                      title={isSpeaking ? "Stop speaking" : "Read aloud"}
                    >
                      {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => navigator.share && navigator.share({ text: aiResponse })}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
                      title="Share response"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                  <p className="text-lg leading-relaxed font-medium">
                    {aiResponse}
                  </p>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 animate-pulse" />
                    Personalized Activities for {selectedMood?.label || 'You'}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {getSuggestedActivities().map((activity, index) => (
                      <button 
                        key={index}
                        className="p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-300 text-left text-sm font-medium hover:scale-105 transform"
                        onClick={() => console.log(`Started activity: ${activity}`)}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-white/10 rounded-xl">
                    <p className="text-sm text-purple-100 italic">
                      💡 Tip: Try one of these activities and come back to share how it made you feel!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .border-3 {
          border-width: 3px;
        }
        
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

export default MoodCheck;