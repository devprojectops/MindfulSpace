import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import googleLogo from '@/assets/google-logo.png';
import { auth, googleProvider, db } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  User,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface SignInSignUpModalProps {
  onClose: () => void;
}

const SignInSignUpModal: React.FC<SignInSignUpModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if this is being used as a modal (has a real onClose function) or as a page
  const isModal = onClose && onClose.toString() !== '() => {}';

  useEffect(() => setShowModal(true), []);

  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => onClose(), 300);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isModal && e.target === e.currentTarget) handleClose();
  };

  // 🔹 Updated Firestore save function
  const saveUserToFirestore = async (user: User) => {
    if (!user.uid || !user.email) {
      console.error('User is missing required fields:', user);
      return;
    }

    try {
      console.log('Attempting to save user to Firestore:', user.uid);
      
      // Check if Firestore is available
      if (!db) {
        console.warn('Firestore database not initialized, skipping user save');
        return;
      }
      
      // Add timeout to prevent hanging
      const firestoreOperation = setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          fullName: user.displayName || fullName || 'Anonymous',
          email: user.email,
          photoURL: user.photoURL || '',
          lastLogin: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      
      // Timeout after 5 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore operation timeout')), 5000)
      );
      
      await Promise.race([firestoreOperation, timeoutPromise]);
      
      console.log('User successfully saved to Firestore');
    } catch (error) {
      console.error('Failed to save user to Firestore:', error);
      console.error('Firestore error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Fallback: Save basic user info to localStorage
      try {
        const userInfo = {
          uid: user.uid,
          fullName: user.displayName || fullName || 'Anonymous',
          email: user.email,
          photoURL: user.photoURL || '',
          lastLogin: new Date().toISOString(),
        };
        localStorage.setItem(`user_${user.uid}`, JSON.stringify(userInfo));
        console.log('User info saved to localStorage as fallback');
      } catch (localError) {
        console.error('Even localStorage fallback failed:', localError);
      }
      
      // Don't throw error - allow sign-in to proceed even if Firestore save fails
      console.warn('Continuing with sign-in despite Firestore error');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
    console.log('Starting email/password authentication...');
    
    let user: User;
    if (isSignUp) {
      console.log('Creating new user account...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
      console.log('User account created, updating profile...');
      await updateProfile(user, { displayName: fullName });
      console.log('Profile updated successfully');
    } else {
      console.log('Signing in existing user...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
      console.log('User signed in successfully');
    }

    console.log('Saving user to Firestore...');
    try {
      await saveUserToFirestore(user);
    } catch (firestoreError) {
      console.warn('Firestore save failed, but continuing with sign-in:', firestoreError);
    }

    console.log('Navigating to landing page...');
    navigate('/landing');

  } catch (err: any) {
    console.error('Sign-in error:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

const handleGoogleSignIn = async () => {
  setError('');
  setLoading(true);
  
  try {
    console.log('Starting Google sign-in...');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('Google sign-in successful, user:', user.uid);
    
    console.log('Saving Google user to Firestore...');
    try {
      await saveUserToFirestore(user);
    } catch (firestoreError) {
      console.warn('Firestore save failed, but continuing with sign-in:', firestoreError);
    }

    console.log('Navigating to landing page...');
    navigate('/landing');

  } catch (err: any) {
    console.error('Google sign-in error:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        showModal ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-xl w-full max-w-md p-8 text-center space-y-6 transform transition-all duration-300 ${
          showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h2 className="text-3xl font-bold text-foreground">
          {isSignUp ? 'Create Account 🌸' : 'Welcome Back ✨'}
        </h2>
        <p className="text-foreground/70">
          {isSignUp
            ? 'Join us on your healing journey today.'
            : 'Sign in to continue your wellness journey.'}
        </p>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button
          variant="glass"
          className="w-full flex items-center justify-center gap-2 py-3"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <img src={googleLogo} alt="Google" className="w-5 h-5" />
          Continue with Google
        </Button>

        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-full bg-foreground/20"></div>
          <span className="text-sm text-foreground/50">or</span>
          <div className="h-px w-full bg-foreground/20"></div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />

          <Button type="submit" variant="dreamy" className="w-full" disabled={loading}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <p className="text-sm text-foreground/70">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <span
                onClick={() => setIsSignUp(false)}
                className="text-accent cursor-pointer hover:underline"
              >
                Sign In
              </span>
            </>
          ) : (
            <>
              Don’t have an account?{' '}
              <span
                onClick={() => setIsSignUp(true)}
                className="text-accent cursor-pointer hover:underline"
              >
                Sign Up
              </span>
            </>
          )}
        </p>

        {isModal && (
          <button
            onClick={handleClose}
            aria-label="Close authentication modal"
            className="absolute top-4 right-4 text-white hover:text-red-400"
          >
            <X size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

// 🔹 Sign-out function for Landing avatar
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (err) {
    console.error('Error signing out:', err);
  }
};

export default SignInSignUpModal;
