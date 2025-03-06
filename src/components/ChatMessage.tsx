
import React from 'react';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Image } from 'lucide-react';

interface ChatMessageProps {
  id: string;
  nickname: string;
  text: string;
  timestamp: number;
  type?: 'text' | 'image';
  imageData?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ id, nickname, text, timestamp, type = 'text', imageData, ...props }) => {
  const { currentUser } = useChat();
  const isOwnMessage = currentUser?.nickname === nickname;
  const isSystem = nickname === 'System';
  
  return (
    <div
      className={cn(
        "flex flex-col mb-2",
        isOwnMessage ? "items-end" : "items-start",
        isSystem && "items-center"
      )}
      {...props}
    >
      {!isSystem && (
        <div className="text-xs text-muted-foreground mb-1 px-2">
          {nickname} • {format(timestamp, 'HH:mm')}
        </div>
      )}
      
      <div
        className={cn(
          "message-bubble",
          isOwnMessage && "message-bubble-own",
          isSystem ? "bg-muted text-muted-foreground text-xs py-1" : !isOwnMessage && "message-bubble-other"
        )}
      >
        {type === 'image' && imageData ? (
          <div className="message-image-container">
            <img 
              src={imageData} 
              alt="Shared" 
              className="max-w-[240px] max-h-[240px] rounded-md object-contain cursor-pointer"
              onClick={() => window.open(imageData, '_blank')}
            />
          </div>
        ) : (
          text
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
