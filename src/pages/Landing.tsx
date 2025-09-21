import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Moon, Sun, X } from 'lucide-react';
import DreamyBackground from '@/components/DreamyBackground';
import heroImage from '@/assets/hero-wellness.jpg';
import meditationAvatar from '@/assets/meditation-avatar.jpg';
import { signOutUser } from './SignInSignUp';
import { auth } from '@/firebase';

interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  route: string;
}

const features: Feature[] = [
  {
    icon: Heart,
    title: 'AI Chat 💬',
    description: 'Compassionate AI therapist available 24/7 for support and guidance.',
    gradient: 'from-primary to-accent',
    route: '/chat',
  },
  {
    icon: Sun,
    title: 'Mood Tracker 😊',
    description: 'Beautiful visualizations of your emotional journey with AI insights.',
    gradient: 'from-accent to-secondary',
    route: '/mood',
  },
  {
    icon: Sparkles,
    title: 'Journaling ✍️',
    description: 'AI-powered journaling with positive reframing and affirmations.',
    gradient: 'from-secondary to-dreamy-pink',
    route: '/journal',
  },
  {
    icon: Moon,
    title: 'Relaxation 🌸',
    description: 'Breathing exercises, meditation, and calming soundscapes.',
    gradient: 'from-dreamy-pink to-lavender',
    route: '/relaxation',
  },
];
// Add this before the Landing component
const FeatureModal: React.FC<{ feature: Feature; onClose: () => void }> = ({ feature, onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-xl w-full max-w-3xl p-8 flex flex-col md:flex-row gap-8 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2 gap-4">
          <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
            <feature.icon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">{feature.title}</h2>
          <p className="text-foreground/80">
            {feature.description}<br />
            A short story about how this feature can help you achieve mental peace and improve wellness.
          </p>
          <Button
            variant="dreamy"
            className="w-full mt-4"
            onClick={() => {
              onClose();
              navigate(feature.route);
            }}
          >
            Get Started
          </Button>
        </div>
        <div className="w-full md:w-1/2 text-foreground/80 flex flex-col justify-center">
          <p>
            Imagine starting your day feeling calmer and more in control. {feature.title} has been designed to guide
            you through your journey step by step, helping you track your emotions, reflect on your experiences, and
            gradually build positive habits for mental well-being.
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close feature modal"
          className="absolute top-4 right-4 text-white hover:text-red-400"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

const Landing = () => {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen relative">
      <DreamyBackground />

      {/* 🔹 Header */}
      <header className="absolute top-0 left-0 w-full flex justify-end p-6 z-20">
        {user && (
          <div className="relative">
            <button
              className="flex items-center gap-2 bg-gray-800/70 px-4 py-2 rounded-full hover:bg-gray-700 transition"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                src={user.photoURL || meditationAvatar}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-white">{user.displayName || user.email}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-xl shadow-lg overflow-hidden z-30">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary-glow bg-clip-text text-transparent">
                Your AI-Powered
                <br />
                <span className="text-dreamy-pink">Safe Space</span>
              </h1>
              <p className="text-xl lg:text-2xl text-foreground/80 leading-relaxed">
                For mental peace, happiness, and emotional wellness.
                <br />
                <span className="text-pink-400">Breathe. Heal. Grow.</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="dreamy" size="xl" asChild className="group">
                <Link to="/dashboard">
                  <Sparkles className="mr-2" />
                  Start Your Journey
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/dashboard">
                  <Heart className="mr-2" />
                  Explore Features
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="Dreamy wellness space"
                className="w-full h-auto rounded-3xl glass-card shadow-dreamy"
              />
            </div>
            <div className="absolute -top-8 -left-8 w-full h-full rounded-3xl bg-primary/20 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Healing Features
            </h2>
            <p className="text-xl text-foreground/70">
              Everything you need for your mental wellness journey
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <button
                key={feature.title}
                onClick={() => setSelectedFeature(feature)}
                className="glass-card p-8 text-center space-y-4 group cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="relative">
            <img
              src={meditationAvatar}
              alt="Peaceful meditation avatar"
              className="w-32 h-32 mx-auto rounded-full shadow-glow"
            />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Ready to Begin Your
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Healing Journey?
            </span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Join thousands who have found peace and happiness through our AI-powered wellness platform.
          </p>
          <Button variant="aurora" size="xl" asChild>
            <Link to="/community">
              <Sparkles className="mr-2" />
              Join Our Community
            </Link>
          </Button>
        </div>
      </section>

      {/* Feature Modal */}
      {selectedFeature && (
        <FeatureModal
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </div>
  );
};

export default Landing;

