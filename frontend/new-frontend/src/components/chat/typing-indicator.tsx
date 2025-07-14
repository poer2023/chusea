'use client';

/**
 * Enhanced Typing Indicator Component
 * Shows who is typing with smooth animations and user avatars
 */

import React, { useEffect, useState } from 'react';
import { TypingIndicator as TypingIndicatorType } from '@/types/chat';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  typingUsers: TypingIndicatorType[];
  showAvatars?: boolean;
  maxDisplayUsers?: number;
  className?: string;
}

const TypingDots: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

const UserAvatar: React.FC<{
  userId: string;
  userName?: string;
  size?: 'sm' | 'md';
}> = ({ userId, userName, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
  };

  return (
    <Avatar className={cn(sizeClasses[size], 'border-2 border-white shadow-sm')}>
      <div className="bg-gradient-to-br from-blue-400 to-purple-500 w-full h-full rounded-full flex items-center justify-center text-white font-medium">
        {userName?.charAt(0) || userId.charAt(0).toUpperCase()}
      </div>
    </Avatar>
  );
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  showAvatars = true,
  maxDisplayUsers = 3,
  className,
}) => {
  const [visibleUsers, setVisibleUsers] = useState<TypingIndicatorType[]>([]);

  // Filter and sort typing users
  useEffect(() => {
    const activeTypingUsers = typingUsers
      .filter(user => user.isTyping)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, maxDisplayUsers);
    
    setVisibleUsers(activeTypingUsers);
  }, [typingUsers, maxDisplayUsers]);

  if (visibleUsers.length === 0) {
    return null;
  }

  const formatTypingText = () => {
    const userCount = visibleUsers.length;
    const extraCount = Math.max(0, typingUsers.filter(u => u.isTyping).length - maxDisplayUsers);
    
    if (userCount === 1) {
      return 'is typing';
    } else if (userCount === 2) {
      return 'are typing';
    } else {
      return `and ${extraCount > 0 ? `${extraCount} other${extraCount > 1 ? 's' : ''}` : 'others'} are typing`;
    }
  };

  return (
    <div className={cn(
      'flex items-center space-x-3 px-4 py-2 text-sm text-gray-500 animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
      className
    )}>
      {/* User Avatars */}
      {showAvatars && visibleUsers.length > 0 && (
        <div className="flex -space-x-2">
          {visibleUsers.map((user) => (
            <UserAvatar
              key={user.userId}
              userId={user.userId}
              userName={user.userId} // In real app, get actual userName
              size="sm"
            />
          ))}
        </div>
      )}

      {/* Typing Animation */}
      <div className="flex items-center space-x-2">
        <TypingDots />
        <span className="text-gray-600">
          {visibleUsers.length === 1 
            ? `${visibleUsers[0].userId} ${formatTypingText()}...` 
            : `${visibleUsers.length} users ${formatTypingText()}...`
          }
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;