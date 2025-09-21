# 🌸 MindfulSpace

> **AI-Powered Mental Wellness Platform** - Your compassionate digital companion for mental health, emotional well-being, and personal growth.

[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.3.0-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Google AI](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google)](https://ai.google.dev/)

## ✨ Overview

MindfulSpace is a comprehensive mental wellness application that combines cutting-edge AI technology with evidence-based therapeutic practices. Our platform provides 24/7 emotional support, mood tracking, guided journaling, and relaxation tools to help users achieve better mental health and emotional balance.

## 🎯 Key Features

### 🤖 **AI Therapy Chat**
- 24/7 compassionate AI therapist powered by Google Gemini
- Context-aware conversations with emotional intelligence
- Personalized coping strategies and mental health insights
- Safe space for expressing thoughts and feelings

### 📊 **Mood Tracking & Analytics**
- Beautiful visualizations of emotional patterns
- AI-powered mood analysis and insights
- Daily, weekly, and monthly mood trends
- Personalized recommendations based on mood data

### ✍️ **Intelligent Journaling**
- AI-assisted journal prompts and reflections
- Positive reframing and cognitive restructuring
- Daily affirmations and gratitude practices
- Emotional pattern recognition

### 🧘 **Relaxation & Meditation Tools**
- Guided breathing exercises with visual feedback
- Progressive muscle relaxation techniques
- Mindfulness meditation sessions
- Ambient soundscapes and binaural beats
- Real-time audio generation using Web Audio API

### 👥 **Community Support**
- Safe space for peer support and sharing
- Anonymous interaction options
- Group challenges and wellness goals
- Success story sharing

### 📱 **User Experience**
- Mobile-first responsive design
- Offline functionality with local storage
- Dark/light theme support
- Accessibility-compliant interface
- Progressive Web App (PWA) capabilities

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and building
- **Tailwind CSS** + **shadcn/ui** for modern, responsive design
- **Radix UI** primitives for accessible components
- **Framer Motion** for smooth animations
- **TanStack Query** for efficient state management

### **Backend & Services**
- **Node.js** + **Express** for API server
- **Firebase** suite for authentication and database
- **Google Gemini AI** for natural language processing
- **Firestore** for real-time data synchronization

### **Development Tools**
- **TypeScript** for enhanced code quality
- **ESLint** for code linting and best practices
- **React Hook Form** + **Zod** for form validation
- **Recharts** for data visualization

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Firebase account (for backend services)
- Google AI API key (for Gemini integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amansharma606/aura-serene-mind.git
   cd aura-serene-mind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```



4. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Copy configuration to your `.env` file

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Start Backend Server** (Optional - for API endpoints)
   ```bash
   cd backend
   node server.js
   ```

### Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
mindfulsapce/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── DreamyBackground.tsx
│   ├── pages/              # Application pages
│   │   ├── Home.tsx        # Landing page
│   │   ├── Landing.tsx     # Main dashboard
│   │   ├── Chat.tsx        # AI therapy chat
│   │   ├── Mood-Check.tsx  # Mood tracking
│   │   ├── Journal.tsx     # Digital journaling
│   │   ├── Relaxation.tsx  # Meditation tools
│   │   └── SignInSignUp.tsx # Authentication
│   ├── lib/                # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── assets/             # Static assets
│   └── firebase.ts         # Firebase configuration
├── backend/                # Node.js API server
│   ├── api/               # API routes
│   ├── services/          # Business logic
│   └── server.js          # Express server
├── public/                # Public assets
└── docs/                  # Documentation
```

## 🎨 UI/UX Features

### **Design System**
- **Color Palette**: Calming pastels with dreamy gradients
- **Typography**: Clean, readable fonts optimized for wellness content
- **Animations**: Smooth, purposeful transitions using Framer Motion
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation

### **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimized layouts
- Touch-friendly interface elements
- Progressive enhancement

### **Theme Support**
- Light and dark mode toggle
- High contrast options
- Customizable color schemes
- Reduced motion preferences

## 🤖 AI Integration

### **Google Gemini AI Features**
- **Conversational AI**: Natural, empathetic responses
- **Context Awareness**: Maintains conversation history
- **Safety Filters**: Content moderation and safety checks
- **Personalization**: Adapts to user preferences and history

### **AI-Powered Features**
- Mood pattern analysis
- Personalized affirmations
- Journal prompt suggestions
- Coping strategy recommendations
- Crisis intervention detection

## 🔐 Security & Privacy

### **Data Protection**
- End-to-end encryption for sensitive data
- Firebase security rules for database protection
- Local storage for offline functionality
- No personal data sharing with third parties

### **Authentication**
- Secure Firebase Authentication
- Google OAuth integration
- Session management and auto-logout
- Password reset functionality

### **Privacy Features**
- Anonymous mode for sensitive conversations
- Data export and deletion options
- Transparent privacy policy
- GDPR compliance ready

## 📊 Analytics & Insights

### **User Analytics**
- Mood trend visualization
- Journal entry insights
- Usage pattern analysis
- Progress tracking metrics

### **AI-Generated Insights**
- Weekly wellness reports
- Personalized recommendations
- Goal achievement tracking
- Emotional pattern recognition

## 🚀 Deployment

### **Frontend Deployment**
- **Vercel**: Recommended for automatic deployments
- **Netlify**: Alternative static hosting
- **Firebase Hosting**: Integrated with Firebase services

### **Backend Deployment**
- **Railway**: Full-stack deployment
- **Heroku**: Node.js hosting
- **Google Cloud Run**: Serverless containers

### **Environment Variables**
Ensure all environment variables are properly configured in your deployment platform.

## 🤝 Contributing

We welcome contributions to improve Aura Serene Mind! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use semantic commit messages
- Write tests for new features
- Ensure accessibility compliance
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or need help:

- 📧 **Email**: support@aura-serene-mind.com
- 💬 **Discord**: [Join our community](https://discord.gg/aura-serene-mind)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Amansharma606/aura-serene-mind/issues)
- 📖 **Documentation**: [Full docs](https://docs.aura-serene-mind.com)

## 🙏 Acknowledgments

- **Google AI** for Gemini API access
- **Firebase** for backend infrastructure
- **shadcn/ui** for beautiful components
- **Radix UI** for accessible primitives
- **Mental health professionals** for guidance and validation




---

**Made with ❤️ for mental wellness**

[🌐 Website](https://aura-serene-mind.com) • [📱 App Store](https://apps.apple.com/aura-serene-mind) • [🤖 Google Play](https://play.google.com/store/apps/aura-serene-mind)

*Building a more mindful, peaceful world, one user at a time.*

</div>
