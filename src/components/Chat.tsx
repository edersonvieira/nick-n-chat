
import React from 'react';
import { useChat } from '@/context/ChatContext';
import NicknameForm from './NicknameForm';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import { Loader2 } from 'lucide-react';

const Chat: React.FC = () => {
  const { currentUser, connectionStatus } = useChat();
  
  if (!currentUser) {
    return <NicknameForm />;
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Nick-n-Chat</h1>
          <p className="text-sm text-muted-foreground">You are chatting as <span className="font-medium">{currentUser.nickname}</span></p>
        </div>
        <div className="flex items-center gap-2">
          {connectionStatus === 'connecting' && (
            <div className="flex items-center text-yellow-500 text-sm">
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Connecting...
            </div>
          )}
          {connectionStatus === 'connected' && (
            <div className="flex items-center text-green-500 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
              Connected
            </div>
          )}
          {connectionStatus === 'disconnected' && (
            <div className="flex items-center text-red-500 text-sm">
              <div className="h-2 w-2 bg-red-500 rounded-full mr-1"></div>
              Disconnected
            </div>
          )}
        </div>
      </div>
      
      <ChatMessageList />
      <ChatInput />
    </div>
  );
};

export default Chat;
