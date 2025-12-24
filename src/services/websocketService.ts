import { Client, type IMessage } from "@stomp/stompjs";
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationResponse } from "../types/notification";

// WebSocket URL - use EXPO_PUBLIC_API_URL and convert to WebSocket URL
// For SockJS endpoints, we need to append /websocket to connect via raw WebSocket
const getWsUrl = () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
    console.log("[WebSocket] API URL from env:", apiUrl);

    // Remove /api/v1 to get base URL
    // const baseUrl = apiUrl.replace('/api/v1', '');

    // Convert http to ws protocol
    // const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');

    // For SockJS compatibility, append /ws/websocket
    // SockJS expects: /ws/websocket for raw WebSocket connections
    const fullWsUrl = apiUrl + '/ws';

    console.log("[WebSocket] Full WebSocket URL:", fullWsUrl);
    return fullWsUrl;
};

type NotificationCallback = (notification: NotificationResponse) => void;

class WebSocketService {
    private client: Client | null = null;
    private notificationCallbacks: NotificationCallback[] = [];
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private userEmail: string = '';

    // Initialize and connect
    async connect(email?: string): Promise<void> {
        try {
            const token = await AsyncStorage.getItem("accessToken");
            const storedEmail = await AsyncStorage.getItem("userEmail");
            this.userEmail = email || storedEmail || "";

            if (!token) {
                console.warn("[WebSocket] No access token found, skipping connection");
                return;
            }

            if (this.client?.active) {
                console.log("[WebSocket] Already connected");
                return;
            }

            const wsUrl = getWsUrl();
            console.log("[WebSocket] Connecting with email:", this.userEmail);

            this.client = new Client({
                brokerURL: wsUrl,
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                connectHeaders: {
                    "X-USER-ID": this.userEmail,
                    "Authorization": `Bearer ${token}`,
                },
                debug: (str) => {
                    console.log("[WebSocket Debug]", str);
                },
                onConnect: () => {
                    console.log("[WebSocket] ✅ Connected successfully");
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.subscribeToNotifications();
                },
                onDisconnect: () => {
                    console.log("[WebSocket] Disconnected");
                    this.isConnected = false;
                },
                onStompError: (frame) => {
                    console.error("[WebSocket] ❌ STOMP Error:", frame.headers["message"]);
                    console.error("[WebSocket] Error details:", frame.body);
                },
                onWebSocketError: (event) => {
                    console.error("[WebSocket] ❌ WebSocket Error:", event);
                    this.reconnectAttempts++;
                    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                        console.error("[WebSocket] Max reconnect attempts reached, stopping");
                        this.disconnect();
                    }
                },
                onWebSocketClose: (event) => {
                    console.log("[WebSocket] Connection closed:", event);
                },
            });

            this.client.activate();
        } catch (error) {
            console.error("[WebSocket] Connection error:", error);
        }
    }

    // Subscribe to user notifications queue
    private subscribeToNotifications(): void {
        if (!this.client?.active) {
            console.warn("[WebSocket] Cannot subscribe - client not active");
            return;
        }

        console.log("[WebSocket] Subscribing to /user/queue/notifications");

        this.client.subscribe("/user/queue/notifications", (message: IMessage) => {
            try {
                console.log("[WebSocket] 📬 Received notification:", message.body);
                const notification: NotificationResponse = JSON.parse(message.body);
                this.notificationCallbacks.forEach((callback) => {
                    callback(notification);
                });
            } catch (error) {
                console.error("[WebSocket] Error parsing notification:", error);
            }
        });
    }

    // Register callback for new notifications
    onNotification(callback: NotificationCallback): () => void {
        this.notificationCallbacks.push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.notificationCallbacks.indexOf(callback);
            if (index > -1) {
                this.notificationCallbacks.splice(index, 1);
            }
        };
    }

    // Disconnect from WebSocket
    disconnect(): void {
        console.log("[WebSocket] Disconnecting...");
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.isConnected = false;
            this.notificationCallbacks = [];
        }
    }

    // Check if connected
    getIsConnected(): boolean {
        return this.isConnected;
    }
}

// Singleton instance
export const websocketService = new WebSocketService();

