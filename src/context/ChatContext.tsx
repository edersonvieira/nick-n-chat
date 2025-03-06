
import React, { createContext, useContext, useState, useEffect } from 'react';

type Message = {
  id: string;
  nickname: string;
  text: string;
  timestamp: number;
};

type User = {
  id: string;
  nickname: string;
};

type ChatContextType = {
  messages: Message[];
  users: User[];
  currentUser: User | null;
  sendMessage: (text: string) => void;
  setNickname: (nickname: string) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // This would normally connect to a real-time service like WebSockets
  // For this demo, we'll simulate users joining and messages being sent
  
  // Function to set the current user's nickname
  const setNickname = (nickname: string) => {
    if (nickname.trim() === '') return;
    
    const userId = crypto.randomUUID();
    const newUser = { id: userId, nickname };
    
    setCurrentUser(newUser);
    setUsers((prevUsers) => [...prevUsers, newUser]);
    
    // Simulate a welcome message
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      nickname: 'System',
      text: `${nickname} joined the chat`,
      timestamp: Date.now(),
    };
    
    setMessages((prevMessages) => [...prevMessages, welcomeMessage]);
  };
  
  // Function to send a message
  const sendMessage = (text: string) => {
    if (!currentUser || text.trim() === '') return;
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
      nickname: currentUser.nickname,
      text,
      timestamp: Date.now(),
    };
    
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };
  
  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        currentUser,
        sendMessage,
        setNickname,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
