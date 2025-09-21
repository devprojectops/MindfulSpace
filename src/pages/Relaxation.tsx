import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, Volume2, VolumeX, Waves, Wind, Droplets, Mountain, Heart, Home } from 'lucide-react';

const RelaxationFeature = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [currentMuscleGroup, setCurrentMuscleGroup] = useState(0);
  const [mindfulnessStep, setMindfulnessStep] = useState('focus');
  const [isMuted, setIsMuted] = useState(true); // Default muted - user has to turn on audio
  const [selectedAmbient, setSelectedAmbient] = useState('waves');
  const [ambientVolume, setAmbientVolume] = useState(0.3);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const intervalRef = useRef(null);
  const breathingIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const ambientAudioRef = useRef(null);

  const exercises = [
    {
      id: 'breathing-478',
      name: '4-7-8 Breathing',
      duration: 300,
      description: 'Inhale for 4, hold for 7, exhale for 8',
      icon: '🫁',
      phases: { inhale: 4, hold: 7, exhale: 8 }
    },
    {
      id: 'box-breathing',
      name: 'Box Breathing',
      duration: 480,
      description: 'Equal 4-count breathing pattern',
      icon: '⬜',
      phases: { inhale: 4, hold: 4, exhale: 4, holdEmpty: 4 }
    },
    {
      id: 'progressive-relaxation',
      name: 'Progressive Muscle Relaxation',
      duration: 600,
      description: 'Systematic muscle tension and release',
      icon: '💆‍♀️',
      phases: { tense: 5, relax: 10 },
      muscleGroups: [
        'Face & Forehead', 'Neck & Shoulders', 'Arms & Hands', 
        'Chest & Upper Back', 'Abdomen', 'Hips & Glutes', 
        'Thighs', 'Calves & Feet'
      ]
    },
    {
      id: 'mindfulness',
      name: 'Mindfulness Meditation',
      duration: 420,
      description: 'Present moment awareness practice',
      icon: '🧘‍♀️',
      phases: { focus: 30, observe: 30, accept: 30, return: 30 },
      steps: [
        'Focus on your breath', 'Observe your thoughts', 
        'Accept without judgment', 'Return to the present'
      ]
    }
  ];

  const ambientSounds = [
    { 
      id: 'waves', 
      name: 'Ocean Waves', 
      icon: Waves, 
      color: 'from-blue-400 to-cyan-600',
      description: 'Calming ocean waves'
    },
    { 
      id: 'rain', 
      name: 'Gentle Rain', 
      icon: Droplets, 
      color: 'from-indigo-400 to-blue-600',
      description: 'Soft rainfall sounds'
    },
    { 
      id: 'wind', 
      name: 'Forest Wind', 
      icon: Wind, 
      color: 'from-green-400 to-emerald-600',
      description: 'Peaceful forest breeze'
    },
    { 
      id: 'mountain', 
      name: 'Mountain Peace', 
      icon: Mountain, 
      color: 'from-purple-400 to-pink-600',
      description: 'Serene mountain atmosphere'
    }
  ];

  // Initialize Web Audio API for ambient sounds
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generate ambient sound using Web Audio API
  const generateAmbientSound = (type) => {
    if (!audioContextRef.current) return null;

    const context = audioContextRef.current;
    let oscillator, gainNode, filterNode, oscillator2;

    const createSound = () => {
      oscillator = context.createOscillator();
      gainNode = context.createGain();
      filterNode = context.createBiquadFilter();

      switch (type) {
        case 'waves':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(80, context.currentTime);
          // Create wave-like modulation
          setInterval(() => {
            if (oscillator && context.state !== 'closed') {
              oscillator.frequency.exponentialRampToValueAtTime(180, context.currentTime + 3);
              oscillator.frequency.exponentialRampToValueAtTime(80, context.currentTime + 6);
            }
          }, 6000);
          filterNode.type = 'lowpass';
          filterNode.frequency.value = 800;
          break;
          
        case 'rain':
          // Create noise buffer for rain sound
          const buffer = context.createBuffer(2, context.sampleRate * 2, context.sampleRate);
          const leftChannel = buffer.getChannelData(0);
          const rightChannel = buffer.getChannelData(1);
          
          for (let i = 0; i < buffer.length; i++) {
            leftChannel[i] = (Math.random() * 2 - 1) * 0.1;
            rightChannel[i] = (Math.random() * 2 - 1) * 0.1;
          }
          
          oscillator = context.createBufferSource();
          oscillator.buffer = buffer;
          oscillator.loop = true;
          filterNode.type = 'bandpass';
          filterNode.frequency.value = 2000;
          filterNode.Q.value = 1;
          break;
          
        case 'wind':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(60, context.currentTime);
          // Add wind variation
          setInterval(() => {
            if (oscillator && context.state !== 'closed') {
              oscillator.frequency.exponentialRampToValueAtTime(120, context.currentTime + 4);
              oscillator.frequency.exponentialRampToValueAtTime(60, context.currentTime + 8);
            }
          }, 8000);
          filterNode.type = 'lowpass';
          filterNode.frequency.value = 400;
          break;
          
        case 'mountain':
          // Create layered mountain ambiance
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(40, context.currentTime);
          
          // Add second layer for richness
          oscillator2 = context.createOscillator();
          oscillator2.type = 'sine';
          oscillator2.frequency.setValueAtTime(80, context.currentTime);
          
          filterNode.type = 'lowpass';
          filterNode.frequency.value = 300;
          
          // Connect second oscillator
          if (oscillator2) {
            const gainNode2 = context.createGain();
            gainNode2.gain.setValueAtTime(ambientVolume * 0.3, context.currentTime);
            oscillator2.connect(gainNode2);
            gainNode2.connect(context.destination);
            oscillator2.start();
          }
          break;
          
        default:
          oscillator.type = 'sine';
          oscillator.frequency.value = 200;
      }

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(ambientVolume * 0.6, context.currentTime + 1);

      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(context.destination);

      return { oscillator, gainNode, oscillator2 };
    };

    return createSound;
  };

  // Generate breathing exercise sounds
  const generateBreathingSound = (phase) => {
    if (!audioContextRef.current || isMuted) return null;

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    switch (phase) {
      case 'inhale':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.3, context.currentTime + 0.5);
        break;
      case 'exhale':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, context.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.1, context.currentTime + 0.5);
        break;
      case 'hold':
      case 'holdEmpty':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(330, context.currentTime);
        gainNode.gain.setValueAtTime(0.15, context.currentTime);
        break;
      default:
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(330, context.currentTime);
        gainNode.gain.setValueAtTime(0.2, context.currentTime);
    }

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 1);

    return { oscillator, gainNode };
  };

  // Generate meditation sounds for progressive relaxation and mindfulness
  const generateMeditationSound = (type, phase) => {
    if (!audioContextRef.current || isMuted) return null;

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const filterNode = context.createBiquadFilter();

    if (type === 'progressive-relaxation') {
      switch (phase) {
        case 'tense':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(150, context.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(200, context.currentTime + 0.5);
          gainNode.gain.setValueAtTime(0.15, context.currentTime);
          filterNode.type = 'highpass';
          filterNode.frequency.value = 300;
          break;
        case 'relax':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(200, context.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(100, context.currentTime + 2);
          gainNode.gain.setValueAtTime(0.2, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.05, context.currentTime + 2);
          filterNode.type = 'lowpass';
          filterNode.frequency.value = 800;
          break;
      }
    } else if (type === 'mindfulness') {
      switch (phase) {
        case 'focus':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(256, context.currentTime); // C note
          gainNode.gain.setValueAtTime(0.1, context.currentTime);
          filterNode.type = 'lowpass';
          filterNode.frequency.value = 1000;
          break;
        case 'observe':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(341.3, context.currentTime); // F note
          gainNode.gain.setValueAtTime(0.08, context.currentTime);
          filterNode.type = 'bandpass';
          filterNode.frequency.value = 800;
          break;
        case 'accept':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(384, context.currentTime); // G note
          gainNode.gain.setValueAtTime(0.12, context.currentTime);
          filterNode.type = 'lowpass';
          filterNode.frequency.value = 600;
          break;
        case 'return':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(256, context.currentTime); // Back to C
          gainNode.gain.setValueAtTime(0.1, context.currentTime);
          filterNode.type = 'lowpass';
          filterNode.frequency.value = 1200;
          break;
      }
    }

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 1.5);

    return { oscillator, gainNode };
  };

  // Handle ambient sound playback
  const toggleAmbientSound = () => {
    if (!audioContextRef.current) return;

    if (isAmbientPlaying) {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.5);
        setTimeout(() => {
          if (ambientAudioRef.current) {
            if (ambientAudioRef.current.oscillator) {
              ambientAudioRef.current.oscillator.stop();
            }
            if (ambientAudioRef.current.oscillator2) {
              ambientAudioRef.current.oscillator2.stop();
            }
          }
          ambientAudioRef.current = null;
        }, 500);
      }
      setIsAmbientPlaying(false);
    } else {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      const soundGenerator = generateAmbientSound(selectedAmbient);
      if (soundGenerator) {
        ambientAudioRef.current = soundGenerator();
        if (ambientAudioRef.current.oscillator) {
          ambientAudioRef.current.oscillator.start();
        }
        setIsAmbientPlaying(true);
      }
    }
  };

  // Change ambient sound
  const handleAmbientChange = (ambientId) => {
    setSelectedAmbient(ambientId);
    if (isAmbientPlaying) {
      // Stop current sound
      if (ambientAudioRef.current) {
        if (ambientAudioRef.current.oscillator) {
          ambientAudioRef.current.oscillator.stop();
        }
        if (ambientAudioRef.current.oscillator2) {
          ambientAudioRef.current.oscillator2.stop();
        }
      }
      // Start new sound
      setTimeout(() => {
        const soundGenerator = generateAmbientSound(ambientId);
        if (soundGenerator) {
          ambientAudioRef.current = soundGenerator();
          if (ambientAudioRef.current.oscillator) {
            ambientAudioRef.current.oscillator.start();
          }
        }
      }, 100);
    }
  };

  // Exercise timer logic
  useEffect(() => {
    if (isPlaying && selectedExercise) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= selectedExercise.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      if (selectedExercise.id.includes('breathing')) {
        startBreathingCycle();
      } else if (selectedExercise.id === 'progressive-relaxation') {
        startProgressiveRelaxation();
      } else if (selectedExercise.id === 'mindfulness') {
        startMindfulnessMeditation();
      }
    } else {
      clearInterval(intervalRef.current);
      clearInterval(breathingIntervalRef.current);
    }

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(breathingIntervalRef.current);
    };
  }, [isPlaying, selectedExercise]);

  // Progressive Muscle Relaxation cycle
  const startProgressiveRelaxation = () => {
    const phases = ['tense', 'relax'];
    let currentPhaseIndex = 0;
    let muscleGroupIndex = 0;
    
    setCurrentMuscleGroup(0);
    setBreathingPhase('tense');

    const cyclePhase = () => {
      if (!isPlaying) return;
      
      const currentPhaseName = phases[currentPhaseIndex];
      setBreathingPhase(currentPhaseName);
      
      if (!isMuted) {
        generateMeditationSound('progressive-relaxation', currentPhaseName);
      }
      
      const phaseTime = selectedExercise.phases[currentPhaseName] * 1000;
      
      breathingIntervalRef.current = setTimeout(() => {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        
        if (currentPhaseIndex === 0) {
          muscleGroupIndex = (muscleGroupIndex + 1) % selectedExercise.muscleGroups.length;
          setCurrentMuscleGroup(muscleGroupIndex);
        }
        
        cyclePhase();
      }, phaseTime);
    };

    cyclePhase();
  };

  // Mindfulness Meditation cycle
  const startMindfulnessMeditation = () => {
    const steps = ['focus', 'observe', 'accept', 'return'];
    let currentStepIndex = 0;
    
    setMindfulnessStep('focus');

    const cycleStep = () => {
      if (!isPlaying) return;
      
      const currentStepName = steps[currentStepIndex];
      setMindfulnessStep(currentStepName);
      
      if (!isMuted) {
        generateMeditationSound('mindfulness', currentStepName);
      }
      
      const stepTime = selectedExercise.phases[currentStepName] * 1000;
      
      breathingIntervalRef.current = setTimeout(() => {
        currentStepIndex = (currentStepIndex + 1) % steps.length;
        cycleStep();
      }, stepTime);
    };

    cycleStep();
  };

  const startBreathingCycle = () => {
    const phases = selectedExercise.phases;
    let currentPhaseIndex = 0;
    let phaseNames;
    
    if (selectedExercise.id === 'box-breathing') {
      phaseNames = ['inhale', 'hold', 'exhale', 'holdEmpty'];
    } else {
      phaseNames = ['inhale', 'hold', 'exhale'];
    }

    const cyclePhase = () => {
      if (!isPlaying) return;
      
      const currentPhaseName = phaseNames[currentPhaseIndex];
      setBreathingPhase(currentPhaseName);
      
      // Play breathing sound for each phase
      if (!isMuted) {
        generateBreathingSound(currentPhaseName);
      }
      
      const phaseTime = phases[currentPhaseName] * 1000;
      
      breathingIntervalRef.current = setTimeout(() => {
        currentPhaseIndex = (currentPhaseIndex + 1) % phaseNames.length;
        if (currentPhaseIndex === 0) {
          setBreathingCount(prev => prev + 1);
        }
        cyclePhase();
      }, phaseTime);
    };

    cyclePhase();
  };

  const getPhaseInstruction = (phase) => {
    if (selectedExercise?.id === 'progressive-relaxation') {
      const instructions = {
        tense: `Tense: ${selectedExercise.muscleGroups[currentMuscleGroup]}`,
        relax: `Relax: ${selectedExercise.muscleGroups[currentMuscleGroup]}`
      };
      return instructions[phase] || 'Relax';
    } else if (selectedExercise?.id === 'mindfulness') {
      const instructions = {
        focus: 'Focus on your breath',
        observe: 'Observe your thoughts',
        accept: 'Accept without judgment',
        return: 'Return to the present'
      };
      return instructions[mindfulnessStep] || 'Be mindful';
    } else {
      const instructions = {
        inhale: 'Breathe In',
        hold: 'Hold',
        exhale: 'Breathe Out',
        holdEmpty: 'Hold Empty'
      };
      return instructions[phase] || 'Breathe';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isAmbientPlaying) {
      toggleAmbientSound();
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setBreathingCount(0);
    setBreathingPhase('inhale');
    setCurrentMuscleGroup(0);
    setMindfulnessStep('focus');
    clearInterval(intervalRef.current);
    clearInterval(breathingIntervalRef.current);
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
    handleReset();
  };

  const getBreathingCircleSize = () => {
    const baseSize = 200;
    if (!selectedExercise?.phases) return baseSize;

    if (breathingPhase === 'inhale') {
      return baseSize + 120;
    } else if (breathingPhase === 'exhale') {
      return baseSize + 40;
    }
    return baseSize + 80;
  };

  const getCurrentAmbient = () => {
    return ambientSounds.find(sound => sound.id === selectedAmbient);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-200 via-pink-200 to-indigo-200 text-gray-900">
      {/* Dashboard Button - Top Left Corner */}
      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="absolute top-6 left-6 z-20 p-3 rounded-full bg-white/60 hover:bg-white/80 backdrop-blur-md transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <Home className="w-5 h-5 text-purple-600" />
        <span className="text-purple-600 font-semibold hidden sm:inline">Dashboard</span>
      </button>
      {/* Animated background particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/20 blur-xl animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 60 + 20}px`,
            height: `${Math.random() * 60 + 20}px`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${Math.random() * 8 + 4}s`
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6">
        {!selectedExercise ? (
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Your AI-Powered Safe Space
            </h1>
            <p className="text-base sm:text-lg text-gray-700 mb-8 sm:mb-10 px-4">
              For mental peace, happiness, and emotional wellness.
              <br />Breathe. Heal. Grow.
            </p>

            {/* Ambient Sound Controls */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-purple-600 mb-4 sm:mb-6">Choose Your Ambiance</h2>
              
              {/* Current ambient display */}
              <div className="mb-6 p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getCurrentAmbient()?.color}`}>
                      {React.createElement(getCurrentAmbient()?.icon, { className: "w-5 h-5 text-white" })}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">{getCurrentAmbient()?.name}</div>
                      <div className="text-xs text-gray-600">{getCurrentAmbient()?.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={toggleAmbientSound}
                    className={`p-3 rounded-full transition-all duration-300 ${
                      isAmbientPlaying 
                        ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg' 
                        : 'bg-white/50 text-gray-600 hover:bg-white/70'
                    }`}
                  >
                    {isAmbientPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Volume control */}
                <div className="mt-4 flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-gray-600" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={ambientVolume}
                    onChange={(e) => {
                      setAmbientVolume(parseFloat(e.target.value));
                      if (ambientAudioRef.current) {
                        ambientAudioRef.current.gainNode.gain.setValueAtTime(
                          parseFloat(e.target.value), 
                          audioContextRef.current.currentTime
                        );
                      }
                    }}
                    className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 w-8">{Math.round(ambientVolume * 100)}</span>
                </div>
              </div>

              {/* Ambient selection grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {ambientSounds.map((sound) => {
                  const IconComponent = sound.icon;
                  return (
                    <button
                      key={sound.id}
                      onClick={() => handleAmbientChange(sound.id)}
                      className={`p-4 sm:p-6 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 ${
                        selectedAmbient === sound.id
                          ? `bg-gradient-to-br ${sound.color} text-white transform scale-105`
                          : 'bg-white/40 backdrop-blur-md text-gray-800 hover:bg-white/60'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                      <div className="text-xs sm:text-sm font-medium">{sound.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exercise Selection */}
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-6 sm:mb-8">Choose Your Practice</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  onClick={() => handleExerciseSelect(exercise)}
                  className="cursor-pointer group p-6 sm:p-8 rounded-3xl bg-white/40 backdrop-blur-md border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden"
                >
                  {/* Hover sound preview */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-all duration-500"
                    onMouseEnter={() => {
                      if (exercise.id.includes('breathing') && !isMuted && audioContextRef.current) {
                        generateBreathingSound('inhale');
                      } else if (exercise.id === 'progressive-relaxation' && !isMuted && audioContextRef.current) {
                        generateMeditationSound('progressive-relaxation', 'tense');
                      } else if (exercise.id === 'mindfulness' && !isMuted && audioContextRef.current) {
                        generateMeditationSound('mindfulness', 'focus');
                      }
                    }}
                  />
                  
                  <div className="text-center relative z-10">
                    <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 group-hover:animate-pulse">{exercise.icon}</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-purple-700 mb-2 sm:mb-3">{exercise.name}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{exercise.description}</p>
                    
                    {/* Exercise type indicator */}
                    <div className="mb-3">
                      {exercise.id.includes('breathing') && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                          🎵 With Breathing Sounds
                        </span>
                      )}
                      {exercise.id === 'progressive-relaxation' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                          🧘‍♀️ Guided Practice
                        </span>
                      )}
                      {exercise.id === 'mindfulness' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">
                          🧠 Mindful Awareness
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-center gap-4 text-gray-500 text-xs sm:text-sm">
                      <span>{formatTime(exercise.duration)}</span>
                      <span>•</span>
                      <span>Beginner Friendly</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center max-w-2xl mx-auto">
            {/* Back button - only shows when exercise is selected */}
            <button
              onClick={() => setSelectedExercise(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/60 hover:bg-white/80 backdrop-blur-md transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5 text-purple-600" />
              <span className="hidden sm:inline text-purple-600 font-semibold">Back</span>
            </button>

            {/* Exercise header */}
            <div className="mb-8">
              <div className="text-4xl sm:text-6xl mb-4">{selectedExercise.icon}</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-2">{selectedExercise.name}</h2>
              <p className="text-gray-600">{selectedExercise.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-white/50 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(currentTime / selectedExercise.duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-gray-700 text-sm">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(selectedExercise.duration)}</span>
              </div>
            </div>

            {/* Main Exercise Display */}
            {selectedExercise.id.includes('breathing') && (
              <div className="mb-8 flex justify-center">
                <div
                  className="rounded-full bg-gradient-to-br from-pink-300/60 to-purple-400/60 backdrop-blur-md border-2 border-white/40 transition-all duration-[4000ms] ease-in-out flex items-center justify-center shadow-xl"
                  style={{
                    width: `${getBreathingCircleSize()}px`,
                    height: `${getBreathingCircleSize()}px`
                  }}
                >
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-2">🫁</div>
                    <div className="font-semibold text-lg sm:text-xl">{getPhaseInstruction(breathingPhase)}</div>
                    <div className="text-gray-700 text-sm mt-1">
                      {selectedExercise.phases[breathingPhase] || 4}s
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Cycle {breathingCount + 1}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progressive Muscle Relaxation Display */}
            {selectedExercise.id === 'progressive-relaxation' && (
              <div className="mb-8 text-center">
                <div className="mb-6">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full transition-all duration-1000 ${
                    breathingPhase === 'tense' 
                      ? 'bg-gradient-to-br from-red-300/60 to-orange-400/60 scale-110' 
                      : 'bg-gradient-to-br from-green-300/60 to-blue-400/60 scale-90'
                  } backdrop-blur-md border-2 border-white/40 shadow-xl`}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">💆‍♀️</div>
                      <div className="font-semibold text-lg">{breathingPhase === 'tense' ? 'Tense' : 'Relax'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-purple-700 mb-2">Current Focus</h3>
                  <p className="text-lg text-gray-800">{selectedExercise.muscleGroups[currentMuscleGroup]}</p>
                  <div className="text-sm text-gray-600 mt-2">
                    {breathingPhase === 'tense' ? `Hold tension for ${selectedExercise.phases.tense}s` : `Relax for ${selectedExercise.phases.relax}s`}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Group {currentMuscleGroup + 1} of {selectedExercise.muscleGroups.length}
                  </div>
                </div>
              </div>
            )}

            {/* Mindfulness Meditation Display */}
            {selectedExercise.id === 'mindfulness' && (
              <div className="mb-8 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-purple-300/60 to-pink-400/60 backdrop-blur-md border-2 border-white/40 shadow-xl transition-all duration-2000">
                    <div className="text-center">
                      <div className="text-5xl mb-2">🧘‍♀️</div>
                      <div className="font-semibold text-lg">Mindful</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 max-w-lg mx-auto">
                  <h3 className="text-2xl font-bold text-purple-700 mb-4">{getPhaseInstruction(mindfulnessStep)}</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    {selectedExercise.phases[mindfulnessStep] || 30}s for this step
                  </div>
                  
                  {/* Mindfulness guide */}
                  <div className="text-left space-y-2 text-sm text-gray-700">
                    {mindfulnessStep === 'focus' && (
                      <p>• Close your eyes gently<br/>• Feel your breath naturally<br/>• Let thoughts come and go</p>
                    )}
                    {mindfulnessStep === 'observe' && (
                      <p>• Notice what thoughts arise<br/>• Don't try to stop them<br/>• Simply observe with curiosity</p>
                    )}
                    {mindfulnessStep === 'accept' && (
                      <p>• Accept whatever you feel<br/>• No judgment needed<br/>• Everything is welcome here</p>
                    )}
                    {mindfulnessStep === 'return' && (
                      <p>• Gently return to your breath<br/>• Feel your body in this moment<br/>• You are here, you are present</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ambient status during exercise */}
            {isAmbientPlaying && (
              <div className="mb-6 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md text-sm">
                  {React.createElement(getCurrentAmbient()?.icon, { className: "w-4 h-4" })}
                  <span>{getCurrentAmbient()?.name} playing</span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4 sm:gap-6">
              <button
                onClick={handleReset}
                className="p-3 sm:p-4 rounded-full bg-white/50 hover:bg-white/70 transition-all duration-300"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className="p-4 sm:p-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg text-white"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-6 h-6 sm:w-8 sm:h-8" /> : <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 sm:p-4 rounded-full transition-all duration-300 ${
                  isMuted ? 'bg-gray-500 text-white' : 'bg-white/50 hover:bg-white/70 text-purple-600'
                }`}
                title={isMuted ? "Unmute exercise sounds" : "Mute exercise sounds"}
              >
                {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelaxationFeature;