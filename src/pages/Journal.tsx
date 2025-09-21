import React, { useState, useEffect } from 'react';
import { Save, Home, Sparkles, BookOpen, Heart, Star, Calendar, Clock, Target, TrendingUp, Mic, MicOff, Download, Eye, EyeOff, Zap, Award } from 'lucide-react';

const Journal = () => {
  const [journalEntry, setJournalEntry] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedAffirmation, setSavedAffirmation] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [journalHistory, setJournalHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [writingStreak, setWritingStreak] = useState(7);
  const [emotionAnalysis, setEmotionAnalysis] = useState(null);
  const [showWordGoal, setShowWordGoal] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(200);
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [writingPrompts, setWritingPrompts] = useState([
    "What made you smile today?",
    "Describe a challenge you overcame recently",
    "What are you grateful for right now?",
    "If you could tell your past self one thing, what would it be?",
    "What's one small victory you had today?"
  ]);
  const [selectedPrompt, setSelectedPrompt] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const words = journalEntry.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [journalEntry]);

  const handleSubmit = async () => {
    if (!journalEntry.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call with enhanced response
    setTimeout(() => {
      const mockResponse = `Thank you for sharing your thoughts with me. I can sense the emotions behind your words, and I want you to know that what you're feeling is completely valid.

Your willingness to express yourself through journaling shows incredible strength and self-awareness. Remember that growth often comes through reflection, and you're taking a beautiful step toward understanding yourself better.

Here's an affirmation just for you: "I am worthy of peace, love, and all the beautiful moments life has to offer."

Keep nurturing your inner world - it's a sacred space that deserves your attention and care.`;
      
      setAiResponse(mockResponse);
      setSavedAffirmation("I am worthy of peace, love, and all the beautiful moments life has to offer.");
      
      // Add emotion analysis
      setEmotionAnalysis({
        primary: 'Reflective',
        secondary: 'Hopeful',
        confidence: 85,
        sentiment: 'Positive'
      });
      
      // Add to journal history
      const newEntry = {
        id: Date.now(),
        content: journalEntry,
        response: mockResponse,
        timestamp: new Date(),
        wordCount: wordCount,
        emotion: 'Reflective'
      };
      setJournalHistory(prev => [newEntry, ...prev.slice(0, 9)]);
      
      setIsLoading(false);
    }, 2500);
  };

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setJournalEntry(prev => prev + " [Voice recording transcribed: I'm feeling really good about my progress today and excited about what's coming next.]");
        setIsRecording(false);
      }, 3000);
    }
  };

  const exportJournal = () => {
    const journalData = {
      entries: journalHistory,
      totalEntries: journalHistory.length,
      totalWords: journalHistory.reduce((sum, entry) => sum + entry.wordCount, 0),
      streak: writingStreak,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(journalData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindease-journal-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const getProgressPercentage = () => {
    return Math.min((wordCount / dailyGoal) * 100, 100);
  };

  const selectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setJournalEntry(prev => prev + (prev ? '\n\n' : '') + prompt + '\n\n');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-300 rounded-full opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-purple-400 rounded-full opacity-25 animate-bounce delay-500"></div>
        <div className="absolute top-1/2 left-8 w-16 h-16 bg-pink-400 rounded-full opacity-20 animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 right-8 w-28 h-28 bg-indigo-400 rounded-full opacity-15 animate-bounce delay-1200"></div>
      </div>

      {/* Dashboard Button - Fixed in top-left corner */}
      <div className="fixed top-6 left-6 z-50">
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="group flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-200"
        >
          <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="text-purple-700 font-medium">Dashboard</span>
        </button>
      </div>

      {/* Stats Panel - Fixed in top-right corner */}
      <div className="fixed top-6 right-6 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-purple-200 min-w-[200px]">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Writing Streak</span>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-bold text-purple-700">{writingStreak} days</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Entries</span>
              <span className="text-xs font-bold text-purple-700">{journalHistory.length}</span>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Daily Goal</span>
                <span className="text-xs font-bold text-purple-700">{wordCount}/{dailyGoal}</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-32 max-w-5xl relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg animate-pulse">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              MindEase Journal
            </h1>
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Your sacred space for thoughts, dreams, and reflections. Let your AI companion guide you toward inner peace and clarity.
          </p>
        </div>

        {/* Writing Prompts Section */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
            <h3 className="text-lg font-semibold text-purple-700 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Writing Prompts to Inspire You
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {writingPrompts.slice(0, 4).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => selectPrompt(prompt)}
                  className="p-3 text-left bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 border border-purple-200 transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  <span className="text-sm text-gray-700">"{prompt}"</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Journal Entry Card */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 hover:shadow-3xl hover:-translate-y-2">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  <h2 className="text-2xl font-bold text-white">Today's Reflection</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPrivateMode(!isPrivateMode)}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
                  >
                    {isPrivateMode ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
                  </button>
                  <button
                    onClick={handleVoiceRecording}
                    className={`p-2 backdrop-blur-sm rounded-full transition-all duration-300 ${
                      isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
              <p className="text-purple-100 mt-2">
                Pour your heart out - this is your {isPrivateMode ? 'private' : 'judgment-free'} zone
              </p>
            </div>
            
            <div className="p-8">
              <div className="relative">
                <textarea
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder="Dear Journal... What's on your mind today? Share your thoughts, feelings, dreams, or anything that matters to you..."
                  className={`w-full h-64 p-6 bg-gradient-to-br from-gray-50 to-purple-50 border-2 border-purple-200 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-purple-300/50 focus:border-purple-400 transition-all duration-300 text-gray-700 leading-relaxed text-lg placeholder-gray-400 ${
                    isPrivateMode ? 'filter blur-sm focus:blur-none' : ''
                  }`}
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-4 text-gray-400 text-sm">
                  <span>{wordCount} words</span>
                  <span>{journalEntry.length} characters</span>
                  {isRecording && (
                    <div className="flex items-center gap-1 text-red-500">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Recording...
                    </div>
                  )}
                </div>
              </div>
              
              {/* Word Count Progress */}
              <div className="mt-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">Daily Writing Goal</span>
                  <span className="text-sm text-purple-600">{Math.round(getProgressPercentage())}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${getProgressPercentage()}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!journalEntry.trim() || isLoading}
                  className={`flex-1 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                    !journalEntry.trim() || isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing your thoughts...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save & Get AI Analysis
                    </>
                  )}
                </button>
                
                <button
                  onClick={exportJournal}
                  className="px-4 py-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-all duration-300 hover:scale-105"
                  title="Export Journal"
                >
                  <Download className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced AI Response Card */}
        {aiResponse && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
              <div className="relative p-8 text-white">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 opacity-20">
                  <Heart className="w-12 h-12 animate-pulse" />
                </div>
                <div className="absolute bottom-4 left-4 opacity-20">
                  <Star className="w-8 h-8" />
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold">🧠 AI Analysis & Reflection</h3>
                </div>
                
                {/* Emotion Analysis */}
                {emotionAnalysis && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Emotional Analysis
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🎭</div>
                        <div className="text-sm opacity-80">Primary</div>
                        <div className="font-semibold">{emotionAnalysis.primary}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">✨</div>
                        <div className="text-sm opacity-80">Secondary</div>
                        <div className="font-semibold">{emotionAnalysis.secondary}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">📊</div>
                        <div className="text-sm opacity-80">Confidence</div>
                        <div className="font-semibold">{emotionAnalysis.confidence}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">💫</div>
                        <div className="text-sm opacity-80">Sentiment</div>
                        <div className="font-semibold">{emotionAnalysis.sentiment}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                  <h4 className="text-lg font-semibold mb-4">Personalized Reflection</h4>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {aiResponse}
                  </p>
                </div>

                {savedAffirmation && (
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-5 h-5 text-yellow-300" />
                      <h4 className="text-xl font-semibold">Today's Personal Affirmation</h4>
                    </div>
                    <blockquote className="text-xl font-medium italic text-center py-4 border-l-4 border-yellow-300 pl-4 mb-6">
                      "{savedAffirmation}"
                    </blockquote>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button className="px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-medium hover:bg-white/30 transition-all duration-300 hover:scale-105">
                        💾 Save Affirmation
                      </button>
                      <button className="px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-medium hover:bg-white/30 transition-all duration-300 hover:scale-105">
                        📱 Share Quote
                      </button>
                      <button className="px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-medium hover:bg-white/30 transition-all duration-300 hover:scale-105">
                        🎨 Create Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default Journal;