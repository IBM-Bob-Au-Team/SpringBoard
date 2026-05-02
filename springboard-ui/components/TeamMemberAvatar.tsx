'use client';

import { useState } from 'react';

interface TeamMemberAvatarProps {
  image?: string;
  name: string;
  avatar: string;
}

export default function TeamMemberAvatar({ image, name, avatar }: TeamMemberAvatarProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent border-2 border-primary/30 rounded-2xl overflow-hidden mb-6 mx-auto group-hover:scale-110 transition-transform">
      {image && !imageError ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-5xl flex items-center justify-center h-full">{avatar}</span>
      )}
    </div>
  );
}

// Made with Bob
