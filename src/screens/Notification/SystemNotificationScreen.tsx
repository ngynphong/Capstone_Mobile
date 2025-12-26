import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Modal,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, ArrowLeft, Megaphone, X, Clock, Tag } from 'lucide-react-native';
import { notificationService } from '../../services/notificationService';
import type { NotificationResponse } from '../../types/notification';

// Format time ago helper
const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format full date
const formatFullDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Parse notification message - handles JSON format and extracts actual message
const parseNotificationMessage = (message: string): string => {
    if (!message) return '';

    try {
        // Try to parse as JSON
        const parsed = JSON.parse(message);
        // If it has a message field, use that
        if (parsed && typeof parsed.message === 'string') {
            return parsed.message;
        }
        // If it's just a string after parsing, return it
        if (typeof parsed === 'string') {
            return parsed;
        }
        // Otherwise return original
        return message;
    } catch {
        // Not JSON, return as is
        return message;
    }
};

interface SystemNotificationItemProps {
    notification: NotificationResponse;
    onPress: () => void;
}

const SystemNotificationItem: React.FC<SystemNotificationItemProps> = ({
    notification,
    onPress,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-start p-4 mx-4 my-1.5 rounded-xl bg-white border border-purple-100"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
            }}
        >
            {/* Icon */}
            <View className="w-12 h-12 rounded-full items-center justify-center mr-3 bg-purple-50">
                <Megaphone size={24} color="#9333EA" />
            </View>

            {/* Content */}
            <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs font-medium uppercase tracking-wide text-purple-600">
                        System Notification
                    </Text>
                    <Text className="text-xs text-gray-400">
                        {formatTimeAgo(notification.createdAt)}
                    </Text>
                </View>

                <Text className="text-base leading-5 text-gray-800 font-medium" numberOfLines={2}>
                    {parseNotificationMessage(notification.message)}
                </Text>

                <View className="flex-row items-center mt-2">
                    <Text className="text-xs text-purple-600 font-medium">Tap to view details</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// System Notification Detail Modal
interface SystemNotificationDetailModalProps {
    notification: NotificationResponse | null;
    visible: boolean;
    onClose: () => void;
}

const SystemNotificationDetailModal: React.FC<SystemNotificationDetailModalProps> = ({
    notification,
    visible,
    onClose,
}) => {
    if (!notification) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl max-h-[80%]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                        <Text className="text-lg font-bold text-gray-800">System Notification</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                        >
                            <X size={20} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView className="p-4">
                        {/* Type Badge */}
                        <View className="flex-row items-center mb-4">
                            <View className="flex-row items-center bg-purple-50 px-3 py-1.5 rounded-full">
                                <Tag size={14} color="#9333EA" />
                                <Text className="text-purple-600 text-sm font-medium ml-1.5">
                                    {notification.type.replace(/_/g, ' ')}
                                </Text>
                            </View>
                        </View>

                        {/* Message */}
                        <View className="bg-gray-50 rounded-xl p-4 mb-4">
                            <Text className="text-base text-gray-800 leading-6">
                                {parseNotificationMessage(notification.message)}
                            </Text>
                        </View>

                        {/* Timestamp */}
                        <View className="flex-row items-center mb-6">
                            <Clock size={16} color="#9CA3AF" />
                            <Text className="text-gray-500 text-sm ml-2">
                                {formatFullDate(notification.createdAt)}
                            </Text>
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-purple-500 py-3 rounded-xl items-center mb-8"
                        >
                            <Text className="text-white font-medium text-base">Close</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const SystemNotificationScreen: React.FC = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<NotificationResponse | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await notificationService.getPublicNotificationList();
            // Sort by createdAt descending (newest first)
            const sorted = data.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setNotifications(sorted);
        } catch (error) {
            console.error('[SystemNotificationScreen] Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    const handleNotificationPress = (notification: NotificationResponse) => {
        setSelectedNotification(notification);
        setDetailModalVisible(true);
    };

    const handleCloseModal = () => {
        setDetailModalVisible(false);
        setSelectedNotification(null);
    };

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Megaphone size={40} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-semibold text-gray-700 mb-2">No System Notifications</Text>
            <Text className="text-gray-500 text-center px-8">
                There are no system announcements at this time.
            </Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100">
            {/* Header */}
            <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mr-3"
                    >
                        <ArrowLeft size={20} color="#374151" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-bold text-gray-800">System Notifications</Text>
                        <Text className="text-sm text-gray-500">
                            {notifications.length} announcement{notifications.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Loading state */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#9333EA" />
                    <Text className="text-gray-500 mt-4">Loading notifications...</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <SystemNotificationItem
                            notification={item}
                            onPress={() => handleNotificationPress(item)}
                        />
                    )}
                    ListEmptyComponent={renderEmptyState}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingVertical: 8,
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#9333EA']}
                            tintColor="#9333EA"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Detail Modal */}
            <SystemNotificationDetailModal
                notification={selectedNotification}
                visible={detailModalVisible}
                onClose={handleCloseModal}
            />
        </View>
    );
};

export default SystemNotificationScreen;
