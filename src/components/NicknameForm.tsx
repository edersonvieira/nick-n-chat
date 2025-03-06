
import React, { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const NicknameForm: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const { setNickname: setUserNickname } = useChat();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() !== '') {
      setUserNickname(nickname);
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md p-8 animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome to the Chat</h1>
          <p className="text-muted-foreground">Enter a nickname to join the conversation</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your nickname"
              className="nickname-input"
              autoFocus
            />
          </div>
          <Button type="submit" className="nickname-button w-full">
            Join Chat
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NicknameForm;
