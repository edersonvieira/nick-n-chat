
import React, { useState, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Image, Smile, Paperclip } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const ChatInput: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, sendImage, connectionStatus } = useChat();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setInputValue(prev => prev + emoji.native);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 500KB)
    if (file.size > 500 * 1024) {
      alert("File too large! Please select an image smaller than 500KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        sendImage(event.target.result.toString());
      }
    };
    reader.readAsDataURL(file);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const isDisabled = connectionStatus !== 'connected';
  
  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
      <div className="flex items-center space-x-2">
        <div className="flex-1 flex items-center gap-2 p-2 rounded-md border border-border bg-background">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={isDisabled}>
                <Smile className="h-5 w-5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="p-0 border-none bg-transparent">
              <Picker 
                data={data} 
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                set="native"
              />
            </PopoverContent>
          </Popover>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isDisabled ? "Connecting to chat..." : "Type your message..."}
            className="flex-1 bg-transparent border-none focus:outline-none"
            autoComplete="off"
            disabled={isDisabled}
          />
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            disabled={isDisabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="h-5 w-5 text-muted-foreground" />
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileSelect}
              disabled={isDisabled}
            />
          </Button>
        </div>
        
        <Button type="submit" size="icon" className="send-button" disabled={isDisabled || !inputValue.trim()}>
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
