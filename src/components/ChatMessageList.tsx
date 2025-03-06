
import React, { useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import ChatMessage from './ChatMessage';

const ChatMessageList: React.FC = () => {
  const { messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          id={message.id}
          nickname={message.nickname}
          text={message.text}
          timestamp={message.timestamp}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
