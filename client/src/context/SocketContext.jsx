import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [socket, setSocket] = useState(null);
  const [liveNotifications, setLiveNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // In production (Vercel), connect to same origin; locally use env var or localhost
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 
      (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected to server:', newSocket.id);
      newSocket.emit('join_user_room', user._id);

      if (isAdmin) {
        newSocket.emit('join_admin_room');
      }
    });

    // Real-time balance and transaction updates
    newSocket.on('wallet_updated', (data) => {
      if (data.notification) {
        toast((t) => (
          <div className="flex items-start space-x-3">
            <div className="text-xl">🔔</div>
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{data.notification.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{data.notification.message}</p>
            </div>
          </div>
        ), { duration: 5000 });

        setLiveNotifications((prev) => [data.notification, ...prev]);
      }
    });

    // Generic notification
    newSocket.on('notification_new', (notif) => {
      toast((t) => (
        <div className="flex items-start space-x-3">
          <div className="text-xl">⚡</div>
          <div>
            <p className="font-semibold text-sm text-slate-900 dark:text-white">{notif.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{notif.message}</p>
          </div>
        </div>
      ), { duration: 5000 });
      setLiveNotifications((prev) => [notif, ...prev]);
    });

    // Admin flagged transaction alert
    newSocket.on('flagged_transaction_alert', (alertData) => {
      toast.error(`⚠️ Suspicious Flagged Transaction: ₹${alertData.amount.toLocaleString('en-IN')} (${alertData.riskScore}% Risk)`, {
        duration: 8000
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?._id, isAdmin]);

  return (
    <SocketContext.Provider value={{ socket, liveNotifications, setLiveNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
