
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import mqtt from 'mqtt';

// Using the HiveMQ public MQTT broker
const MQTT_BROKER = 'wss://broker.hivemq.com:8884/mqtt';
const CHAT_TOPIC = 'lovable-chat/public';
const USERS_TOPIC = 'lovable-chat/users';

type MessageType = 'text' | 'image';

type Message = {
  id: string;
  nickname: string;
  text: string;
  timestamp: number;
  type: MessageType;
  imageData?: string;  // Base64 encoded image
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
  sendImage: (imageData: string) => void;
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
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, []);

  const connectToChat = (user: User) => {
    try {
      setConnectionStatus('connecting');
      
      const client = mqtt.connect(MQTT_BROKER, {
        clientId: `chat_${user.id}_${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
      });
      
      clientRef.current = client;

      client.on('connect', () => {
        setConnectionStatus('connected');
        toast.success('Connected to HiveMQ MQTT broker!');
        
        client.subscribe(CHAT_TOPIC);
        client.subscribe(USERS_TOPIC);
        
        const joinMessage = {
          type: 'join',
          user: user,
        };
        client.publish(USERS_TOPIC, JSON.stringify(joinMessage));

        const welcomeMessage: Message = {
          id: crypto.randomUUID(),
          nickname: 'System',
          text: `You joined the chat as ${user.nickname}`,
          timestamp: Date.now(),
          type: 'text',
        };
        setMessages((prevMessages) => [...prevMessages, welcomeMessage]);
      });

      client.on('message', (topic, payload) => {
        try {
          const data = JSON.parse(payload.toString());
          
          if (topic === USERS_TOPIC && data.type === 'join') {
            if (data.user.id !== user.id) {
              setUsers((prevUsers) => {
                if (!prevUsers.some(u => u.id === data.user.id)) {
                  const joinMessage: Message = {
                    id: crypto.randomUUID(),
                    nickname: 'System',
                    text: `${data.user.nickname} joined the chat`,
                    timestamp: Date.now(),
                    type: 'text',
                  };
                  setMessages((prevMessages) => [...prevMessages, joinMessage]);
                  
                  return [...prevUsers, data.user];
                }
                return prevUsers;
              });
            }
          } else if (topic === CHAT_TOPIC && (data.type === 'message' || data.type === 'image')) {
            if (data.senderId !== user.id) {
              const newMessage: Message = {
                id: data.id,
                nickname: data.nickname,
                text: data.text || '',
                timestamp: data.timestamp,
                type: data.messageType,
                imageData: data.imageData,
              };
              setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      client.on('error', (error) => {
        console.error('MQTT error:', error);
        setConnectionStatus('disconnected');
        toast.error('Connection error. Please try refreshing the page.');
      });

      client.on('close', () => {
        setConnectionStatus('disconnected');
        toast.info('Disconnected from chat. Please refresh to reconnect.');
      });
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionStatus('disconnected');
      toast.error('Failed to connect to chat. Please try again.');
    }
  };

  const setNickname = (nickname: string) => {
    if (nickname.trim() === '') return;
    
    const userId = crypto.randomUUID();
    const newUser = { id: userId, nickname };
    
    setCurrentUser(newUser);
    setUsers((prevUsers) => [...prevUsers, newUser]);
    
    connectToChat(newUser);
  };
  
  const sendMessage = (text: string) => {
    if (!currentUser || text.trim() === '' || !clientRef.current || !clientRef.current.connected) return;
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
      nickname: currentUser.nickname,
      text,
      timestamp: Date.now(),
      type: 'text',
    };
    
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    
    const messageData = {
      type: 'message',
      messageType: 'text',
      id: newMessage.id,
      senderId: currentUser.id,
      nickname: currentUser.nickname,
      text: newMessage.text,
      timestamp: newMessage.timestamp,
    };
    
    clientRef.current.publish(CHAT_TOPIC, JSON.stringify(messageData));
  };

  const sendImage = (imageData: string) => {
    if (!currentUser || !clientRef.current || !clientRef.current.connected) return;
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
      nickname: currentUser.nickname,
      text: '📷 Image',
      timestamp: Date.now(),
      type: 'image',
      imageData,
    };
    
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    
    const messageData = {
      type: 'message',
      messageType: 'image',
      id: newMessage.id,
      senderId: currentUser.id,
      nickname: currentUser.nickname,
      text: '📷 Image',
      timestamp: newMessage.timestamp,
      imageData,
    };
    
    clientRef.current.publish(CHAT_TOPIC, JSON.stringify(messageData));
  };
  
  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        currentUser,
        sendMessage,
        sendImage,
        setNickname,
        connectionStatus,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
