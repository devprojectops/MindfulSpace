import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MenteeModalProps {
  mentee: {
    name: string;
    avatar: string;
    bio: string;
    expertise: string[];
  };
  onClose: () => void;
}

const MenteeModal: React.FC<MenteeModalProps> = ({ mentee, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800/95 rounded-3xl shadow-2xl w-11/12 max-w-5xl p-8 relative flex flex-col md:flex-row gap-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:text-red-400"
        >
          <X size={28} />
        </button>

        {/* Left Column */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3 text-center md:text-left">
          <img
            src={mentee.avatar}
            alt={mentee.name}
            className="w-40 h-40 md:w-48 md:h-48 rounded-full mb-6 object-cover shadow-glow"
          />
          <h2 className="text-3xl font-bold text-white mb-2">{mentee.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
            {mentee.expertise.map((topic, idx) => (
              <span
                key={idx}
                className="bg-gradient-to-r from-primary via-accent to-secondary text-white px-4 py-1 rounded-full text-sm shadow-sm"
              >
                {topic}
              </span>
            ))}
          </div>
          <Button
            variant="dreamy"
            className="w-full md:w-auto"
            onClick={() => alert(`Connecting with ${mentee.name}`)}
          >
            Connect
          </Button>
        </div>

        {/* Right Column */}
        <div className="flex-1 text-white space-y-4">
          <h3 className="text-xl font-semibold">About {mentee.name}</h3>
          <p className="text-gray-300 leading-relaxed">
            {mentee.bio}
          </p>
          <p className="text-gray-400">
            {mentee.name} discovered a passion for helping others after overcoming challenges in their own life. Through years of experience in {mentee.expertise.join(", ")}, they have guided many community members towards better mental wellness and practical self-care. Their journey has taught them empathy, resilience, and the importance of small, consistent steps toward personal growth.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MenteeModal;
