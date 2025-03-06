
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

// Simple WebRTC peer connection implementation
// This is a simplified version for demo purposes
const PEER_SERVER = 'wss://lovable-chat-signaling.glitch.me';

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
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Clean up WebSocket connection when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const connectToChat = (user: User) => {
    try {
      setConnectionStatus('connecting');
      // Create WebSocket connection
      const socket = new WebSocket(PEER_SERVER);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnectionStatus('connected');
        // Send join message when connection is established
        const joinMessage = {
          type: 'join',
          user: user,
        };
        socket.send(JSON.stringify(joinMessage));

        // Add system message for local user
        const welcomeMessage: Message = {
          id: crypto.randomUUID(),
          nickname: 'System',
          text: `You joined the chat as ${user.nickname}`,
          timestamp: Date.now(),
        };
        setMessages((prevMessages) => [...prevMessages, welcomeMessage]);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'join') {
          // A new user joined
          if (data.user.id !== user.id) {
            setUsers((prevUsers) => {
              if (!prevUsers.some(u => u.id === data.user.id)) {
                // Add system message about new user
                const joinMessage: Message = {
                  id: crypto.randomUUID(),
                  nickname: 'System',
                  text: `${data.user.nickname} joined the chat`,
                  timestamp: Date.now(),
                };
                setMessages((prevMessages) => [...prevMessages, joinMessage]);
                
                return [...prevUsers, data.user];
              }
              return prevUsers;
            });
          }
        } else if (data.type === 'message') {
          // Received a chat message
          if (data.senderId !== user.id) {
            const newMessage: Message = {
              id: data.id,
              nickname: data.nickname,
              text: data.text,
              timestamp: data.timestamp,
            };
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        } else if (data.type === 'users') {
          // Received updated user list
          setUsers(data.users);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
        toast.error('Connection error. Please try refreshing the page.');
      };

      socket.onclose = () => {
        setConnectionStatus('disconnected');
        toast.info('Disconnected from chat. Please refresh to reconnect.');
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionStatus('disconnected');
      toast.error('Failed to connect to chat. Please try again.');
    }
  };

  // Function to set the current user's nickname
  const setNickname = (nickname: string) => {
    if (nickname.trim() === '') return;
    
    const userId = crypto.randomUUID();
    const newUser = { id: userId, nickname };
    
    setCurrentUser(newUser);
    setUsers((prevUsers) => [...prevUsers, newUser]);
    
    // Connect to the chat server when nickname is set
    connectToChat(newUser);
  };
  
  // Function to send a message
  const sendMessage = (text: string) => {
    if (!currentUser || text.trim() === '' || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
      nickname: currentUser.nickname,
      text,
      timestamp: Date.now(),
    };
    
    // Add message to local state
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    
    // Send message via WebSocket
    const messageData = {
      type: 'message',
      id: newMessage.id,
      senderId: currentUser.id,
      nickname: currentUser.nickname,
      text: newMessage.text,
      timestamp: newMessage.timestamp,
    };
    
    socketRef.current.send(JSON.stringify(messageData));
  };
  
  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        currentUser,
        sendMessage,
        setNickname,
        connectionStatus,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
