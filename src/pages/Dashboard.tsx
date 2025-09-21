import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageCircle, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import DreamyBackground from '@/components/DreamyBackground';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative">
      <DreamyBackground />
      
      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Header */}
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Welcome Back 👋
            </h1>
            <p className="text-xl text-pink-400">
              How are you feeling today? Let's continue your wellness journey.
            </p>
          </div>


          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'AI Chat',
                description: 'Talk to your compassionate AI companion',
                icon: MessageCircle,
                gradient: 'from-primary to-accent',
                href: '/chat'
              },
              {
                title: 'Mood Check',
                description: 'Log how you\'re feeling right now',
                icon: Heart,
                gradient: 'from-accent to-secondary',
                href: '/mood'
              },
              {
                title: 'Journal',
                description: 'Write down your thoughts and feelings',
                icon: BookOpen,
                gradient: 'from-secondary to-dreamy-pink',
                href: '/journal'
              },
              {
                title: 'Relaxation',
                description: 'Breathing exercises and meditation',
                icon: Sparkles,
                gradient: 'from-dreamy-pink to-lavender',
                href: '/relaxation'
              }
            ].map((action) => (
              <Card 
                key={action.title}
                className="glass-card group cursor-pointer flex flex-col"
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-foreground">{action.title}</CardTitle>
                  <CardDescription className="text-foreground/70">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button 
                    variant="glass" 
                    className="w-full"
                    onClick={() => navigate(action.href)}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Daily Affirmation */}
          <Card className="glass-card shadow-dreamy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5 text-primary" />
                Daily Affirmation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-lg italic text-foreground/80 text-center">
                "You are worthy of love, peace, and happiness. Every step you take towards healing is a victory worth celebrating."
              </blockquote>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-foreground">7 Days</div>
                <div className="text-sm text-foreground/70">Current Streak</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold text-foreground">Peaceful</div>
                <div className="text-sm text-foreground/70">Current Mood</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-secondary" />
                <div className="text-2xl font-bold text-foreground">3</div>
                <div className="text-sm text-foreground/70">Journal Entries</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;