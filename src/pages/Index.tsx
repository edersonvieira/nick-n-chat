
import React from 'react';
import { ChatProvider } from '@/context/ChatContext';
import Chat from '@/components/Chat';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 h-screen max-w-4xl">
        <div className="glass-panel h-full overflow-hidden shadow-xl">
          <ChatProvider>
            <Chat />
          </ChatProvider>
        </div>
      </div>
    </div>
  );
};

export default Index;
