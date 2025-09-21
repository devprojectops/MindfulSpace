import React, { useState } from "react";
import MenteeModal from "./MenteeModal";

// Example mentor data
const mentors = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/avatars/alex.jpg",
    bio: "Helping people manage stress and build confidence 🌟",
    expertise: ["Stress", "Confidence", "Mindfulness"],
  },
  {
    id: 2,
    name: "Rakhi Patel",
    avatar: "/avatars/rakhi.jpg",
    bio: "Sharing tips for healthy habits and self-care 💜",
    expertise: ["Self-care", "Sleep", "Gratitude"],
  },
  {
    id: 3,
    name: "Liam Wong",
    avatar: "/avatars/liam.jpg",
    bio: "Guiding others through anxiety and mindfulness exercises 🌼",
    expertise: ["Anxiety", "Meditation", "Relaxation"],
  },
];

const Community: React.FC = () => {
  const [selectedMentor, setSelectedMentor] = useState<typeof mentors[0] | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-lavender">
        Community Mentors
      </h1>

      <p className="text-center mb-10 text-gray-400">
        Connect with experienced community members who have walked the path and can offer guidance 🌟
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            onClick={() => setSelectedMentor(mentor)}
            className="bg-gray-800/70 backdrop-blur-lg rounded-3xl shadow-xl p-6 flex flex-col items-center text-center cursor-pointer hover:shadow-2xl transition-shadow"
          >
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="w-24 h-24 rounded-full mb-4 object-cover shadow-glow"
            />
            <h2 className="text-xl font-semibold mb-2 text-white">{mentor.name}</h2>
            <p className="text-gray-300 mb-4">{mentor.bio}</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {mentor.expertise.map((topic, idx) => (
                <span
                  key={idx}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm shadow-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedMentor && (
        <MenteeModal
          mentee={selectedMentor}
          onClose={() => setSelectedMentor(null)}
        />
      )}
    </div>
  );
};

export default Community;
