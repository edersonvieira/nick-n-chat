
import React from 'react';
import { useChat } from '@/context/ChatContext';
import NicknameForm from './NicknameForm';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';

const Chat: React.FC = () => {
  const { currentUser } = useChat();
  
  if (!currentUser) {
    return <NicknameForm />;
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <h1 className="text-xl font-semibold">Nick-n-Chat</h1>
        <p className="text-sm text-muted-foreground">You are chatting as <span className="font-medium">{currentUser.nickname}</span></p>
      </div>
      
      <ChatMessageList />
      <ChatInput />
    </div>
  );
};

export default Chat;
