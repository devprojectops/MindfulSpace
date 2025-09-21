import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import DreamyBackground from '@/components/DreamyBackground';
import { auth } from '@/firebase'; // make sure this is your firebase config
import { onAuthStateChanged } from 'firebase/auth';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is logged in, redirect to landing
        navigate('/landing');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <DreamyBackground />

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-pink-400 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: 0.7 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      <div className="z-10 text-center px-6">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white max-w-4xl mx-auto relative">
          Welcome to Your{' '}
          <span className="text-pink-400 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600">
            Safe Space
          </span>
          <Sparkles className="absolute -top-6 -right-10 w-6 h-6 text-pink-300 animate-bounce" />
          <Sparkles className="absolute -bottom-6 -left-12 w-5 h-5 text-pink-400 animate-bounce delay-200" />
        </h1>

        <p className="mt-6 text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
          Breathe. Heal. Grow. Step into a world where your mental wellness is our priority.
        </p>

        <div className="mt-12 relative inline-block">
          <Button
            asChild
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2 relative overflow-hidden"
          >
            <Link to="/SignInSignUp" className="flex items-center gap-2">
              <Sparkles size={20} className="animate-spin-slow text-white/80" />
              Get Started
            </Link>
          </Button>
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-pink-200 rounded-full animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${1.5 + Math.random() * 1}s`,
                  opacity: 0.5 + Math.random() * 0.5,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-pink-500/10 blur-3xl pointer-events-none" />
    </div>
  );
};

export default Home;
