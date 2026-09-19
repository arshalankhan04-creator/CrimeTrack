import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Forensic Audit Ledger Active',
    message: 'Immutable audit trail recording and state-aware undo snapshots are operational.',
    time: '10m ago',
    type: 'audit',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Station Security Enforced',
    message: 'Strict role-based access control (RBAC) boundaries active for this terminal session.',
    time: '25m ago',
    type: 'security',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Central Database Synchronized',
    message: 'Operational registries (FIRs, Cases, Criminal IDs) connected with nominal latency.',
    time: '1h ago',
    type: 'system',
    isRead: false,
  },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('crimetrack_notifications');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse cached notifications:', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('crimetrack_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to cache notifications:', e);
    }
  }, [notifications]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
