
import React, { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';

const ChatInput: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, connectionStatus } = useChat();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      sendMessage(inputValue);
      setInputValue('');
    }
  };
  
  const isDisabled = connectionStatus !== 'connected';
  
  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isDisabled ? "Connecting to chat..." : "Type your message..."}
          className="chat-input"
          autoComplete="off"
          disabled={isDisabled}
        />
        <Button type="submit" size="icon" className="send-button" disabled={isDisabled}>
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
