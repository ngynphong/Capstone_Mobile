import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { websocketService } from '../services/websocketService';
import { notificationService } from '../services/notificationService';
import type { NotificationResponse, GetNotificationsParams } from '../types/notification';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    notifications: NotificationResponse[];
    loading: boolean;
    error: string | null;
    unreadCount: number;
    markingAsRead: boolean;
    markingAllAsRead: boolean;
    isWebSocketConnected: boolean;
    fetchNotifications: (params?: GetNotificationsParams) => Promise<void>;
    fetchUnreadNotifications: () => Promise<void>;
    fetchAllNotifications: () => Promise<void>;
    fetchPublicNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    getUnreadNotifications: () => NotificationResponse[];
    getReadNotifications: () => NotificationResponse[];
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Polling interval when WebSocket is not connected (30 seconds)
const POLLING_INTERVAL = 30000;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoggedIn, user } = useAuth();

    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [markingAsRead, setMarkingAsRead] = useState(false);
    const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
    const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

    const wsUnsubscribeRef = useRef<(() => void) | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastNotificationCountRef = useRef<number>(0);

    const handleError = (err: unknown, defaultMessage: string) => {
        const e = err as Error;
        setError(e.message || defaultMessage);
        console.error("[NotificationContext] Error:", e.message || defaultMessage);
    };

    // Fetch notifications
    const fetchNotifications = useCallback(async (params?: GetNotificationsParams) => {
        setLoading(true);
        setError(null);
        try {
            const data = await notificationService.getNotifications(params);
            lastNotificationCountRef.current = data.length;
            setNotifications(data);
        } catch (err) {
            handleError(err, 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUnreadNotifications = useCallback(async () => {
        await fetchNotifications({ unreadOnly: true });
    }, [fetchNotifications]);

    const fetchAllNotifications = useCallback(async () => {
        await fetchNotifications({ unreadOnly: false });
    }, [fetchNotifications]);

    // Fetch public notifications and merge with existing
    const fetchPublicNotifications = useCallback(async () => {
        try {
            const publicNotifications = await notificationService.getPublicNotificationList();
            if (publicNotifications.length > 0) {
                setNotifications(prev => {
                    // Merge and avoid duplicates
                    const existingIds = new Set(prev.map(n => n.id));
                    const newNotifications = publicNotifications.filter(n => !existingIds.has(n.id));
                    return [...newNotifications, ...prev];
                });
            }
        } catch (err) {
            console.log('[NotificationContext] Failed to fetch public notifications');
        }
    }, []);

    // Mark as read
    const markAsRead = useCallback(async (notificationId: string) => {
        setMarkingAsRead(true);
        try {
            const updatedNotification = await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? updatedNotification : n)
            );
        } catch (err) {
            handleError(err, 'Failed to update notification');
        } finally {
            setMarkingAsRead(false);
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        setMarkingAllAsRead(true);
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            handleError(err, 'Failed to update notifications');
        } finally {
            setMarkingAllAsRead(false);
        }
    }, []);

    // Helpers
    const getUnreadNotifications = useCallback(() => {
        return notifications.filter(n => !n.read);
    }, [notifications]);

    const getReadNotifications = useCallback(() => {
        return notifications.filter(n => n.read);
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Ref to always have latest callback
    const handleNewNotificationRef = useRef<((notification: NotificationResponse) => void) | undefined>(undefined);

    // Handle new notification from WebSocket (no toast)
    handleNewNotificationRef.current = (notification: NotificationResponse) => {
        console.log("[NotificationContext] 📬 New notification received:", notification);

        // Add to beginning of list
        setNotifications(prev => {
            // Avoid duplicates
            const exists = prev.some(n => n.id === notification.id);
            if (exists) {
                return prev;
            }
            return [notification, ...prev];
        });
    };

    // Start polling fallback
    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            return; // Already polling
        }


        // Fetch immediately
        fetchAllNotifications();

        // Then poll every POLLING_INTERVAL
        pollingIntervalRef.current = setInterval(() => {
            fetchAllNotifications();
        }, POLLING_INTERVAL);
    }, [fetchAllNotifications]);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            // console.log("[NotificationContext] Stopping polling...");
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    // Connect WebSocket when authenticated
    useEffect(() => {
        if (isLoggedIn && user) {

            // NOTE: WebSocket is disabled due to SockJS incompatibility with React Native
            // The backend uses SockJS which requires browser-specific APIs
            // Using polling fallback instead

            // Start polling immediately since WebSocket doesn't work on React Native
            startPolling();

            return () => {
                stopPolling();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, user]);

    // Handle app state changes (refresh when app comes to foreground)
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active' && isLoggedIn) {
                console.log("[NotificationContext] App became active, refreshing notifications...");
                fetchAllNotifications();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription?.remove();
        };
    }, [isLoggedIn, fetchAllNotifications]);

    // Disconnect WebSocket on logout
    useEffect(() => {
        if (!isLoggedIn) {
            console.log("[NotificationContext] User logged out, cleaning up...");
            websocketService.disconnect();
            stopPolling();
            setNotifications([]);
            setIsWebSocketConnected(false);
            lastNotificationCountRef.current = 0;
        }
    }, [isLoggedIn, stopPolling]);

    const value: NotificationContextType = {
        notifications,
        loading,
        error,
        unreadCount,
        markingAsRead,
        markingAllAsRead,
        isWebSocketConnected,
        fetchNotifications,
        fetchUnreadNotifications,
        fetchAllNotifications,
        fetchPublicNotifications,
        markAsRead,
        markAllAsRead,
        getUnreadNotifications,
        getReadNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within NotificationProvider');
    }
    return context;
};
