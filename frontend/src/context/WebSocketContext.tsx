import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  connected: false
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
