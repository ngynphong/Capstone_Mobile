import React, { useEffect, useState } from 'react';
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
import { Bell, CheckCheck, ArrowLeft, Circle, Mail, MailOpen, X, Clock, Tag } from 'lucide-react-native';
import { useNotifications } from '../../hooks/useNotifications';
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

// Get notification icon based on type
const getNotificationIcon = (type: string, isRead: boolean) => {
    const color = isRead ? '#9CA3AF' : '#3CBCB2';
    const IconComponent = isRead ? MailOpen : Mail;
    return <IconComponent size={24} color={color} />;
};

interface NotificationItemProps {
    notification: NotificationResponse;
    onPress: () => void;
    isMarking: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onPress,
    isMarking
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isMarking}
            className={`flex-row items-start p-4 mx-4 my-1.5 rounded-xl ${notification.read ? 'bg-gray-50' : 'bg-white border border-teal-100'
                }`}
            style={{
                shadowColor: notification.read ? 'transparent' : '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: notification.read ? 0 : 2,
            }}
        >
            {/* Icon */}
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${notification.read ? 'bg-gray-100' : 'bg-teal-50'
                }`}>
                {getNotificationIcon(notification.type, notification.read)}
            </View>

            {/* Content */}
            <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                    <Text className={`text-xs font-medium uppercase tracking-wide ${notification.read ? 'text-gray-400' : 'text-teal-600'
                        }`}>
                        {notification.type.replace(/_/g, ' ')}
                    </Text>
                    <Text className="text-xs text-gray-400">
                        {formatTimeAgo(notification.createdAt)}
                    </Text>
                </View>

                <Text className={`text-base leading-5 ${notification.read ? 'text-gray-500' : 'text-gray-800 font-medium'
                    }`} numberOfLines={2}>
                    {notification.message}
                </Text>

                {/* Unread indicator */}
                {!notification.read && (
                    <View className="flex-row items-center mt-2">
                        <Circle size={8} color="#3CBCB2" fill="#3CBCB2" />
                        <Text className="text-xs text-teal-600 ml-1 font-medium">Tap to view details</Text>
                    </View>
                )}

                {isMarking && (
                    <ActivityIndicator size="small" color="#3CBCB2" className="mt-2" />
                )}
            </View>
        </TouchableOpacity>
    );
};

// Notification Detail Modal
interface NotificationDetailModalProps {
    notification: NotificationResponse | null;
    visible: boolean;
    onClose: () => void;
    onMarkAsRead: () => void;
    isMarking: boolean;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
    notification,
    visible,
    onClose,
    onMarkAsRead,
    isMarking,
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
                        <Text className="text-lg font-bold text-gray-800">Notification Details</Text>
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
                            <View className="flex-row items-center bg-teal-50 px-3 py-1.5 rounded-full">
                                <Tag size={14} color="#3CBCB2" />
                                <Text className="text-teal-600 text-sm font-medium ml-1.5">
                                    {notification.type.replace(/_/g, ' ')}
                                </Text>
                            </View>
                            {!notification.read && (
                                <View className="flex-row items-center bg-orange-50 px-3 py-1.5 rounded-full ml-2">
                                    <Circle size={8} color="#F97316" fill="#F97316" />
                                    <Text className="text-orange-600 text-sm font-medium ml-1.5">Unread</Text>
                                </View>
                            )}
                        </View>

                        {/* Message */}
                        <View className="bg-gray-50 rounded-xl p-4 mb-4">
                            <Text className="text-base text-gray-800 leading-6">
                                {notification.message}
                            </Text>
                        </View>

                        {/* Timestamp */}
                        <View className="flex-row items-center mb-6">
                            <Clock size={16} color="#9CA3AF" />
                            <Text className="text-gray-500 text-sm ml-2">
                                {formatFullDate(notification.createdAt)}
                            </Text>
                        </View>

                        {/* Mark as Read Button */}
                        {!notification.read && (
                            <TouchableOpacity
                                onPress={onMarkAsRead}
                                disabled={isMarking}
                                className="bg-teal-500 py-3 rounded-xl items-center mb-4"
                            >
                                {isMarking ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text className="text-white font-semibold text-base">Mark as Read</Text>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-gray-100 py-3 rounded-xl items-center mb-8"
                        >
                            <Text className="text-gray-700 font-medium text-base">Close</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

type FilterType = 'all' | 'unread';

const NotificationScreen: React.FC = () => {
    const navigation = useNavigation();
    const {
        notifications,
        loading,
        unreadCount,
        markingAsRead,
        markingAllAsRead,
        fetchAllNotifications,
        fetchUnreadNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const [markingId, setMarkingId] = useState<string | null>(null);
    const [selectedNotification, setSelectedNotification] = useState<NotificationResponse | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Fetch notifications on mount and when filter changes
    useEffect(() => {
        if (filter === 'unread') {
            fetchUnreadNotifications();
        } else {
            fetchAllNotifications();
        }
    }, [filter, fetchAllNotifications, fetchUnreadNotifications]);

    const onRefresh = async () => {
        setRefreshing(true);
        if (filter === 'unread') {
            await fetchUnreadNotifications();
        } else {
            await fetchAllNotifications();
        }
        setRefreshing(false);
    };

    const handleNotificationPress = (notification: NotificationResponse) => {
        setSelectedNotification(notification);
        setDetailModalVisible(true);
    };

    const handleMarkAsReadFromModal = async () => {
        if (selectedNotification && !selectedNotification.read) {
            setMarkingId(selectedNotification.id);
            await markAsRead(selectedNotification.id);
            setMarkingId(null);
            // Update selected notification to show as read
            setSelectedNotification(prev => prev ? { ...prev, read: true } : null);
        }
    };

    const handleCloseModal = () => {
        setDetailModalVisible(false);
        setSelectedNotification(null);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
    };

    // For display - use notifications directly since API already filters
    const filteredNotifications = notifications;

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Bell size={40} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-semibold text-gray-700 mb-2">No notifications</Text>
            <Text className="text-gray-500 text-center px-8">
                {filter === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : "You don't have any notifications yet."}
            </Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100">
            {/* Header */}
            <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mr-3"
                        >
                            <ArrowLeft size={20} color="#374151" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-xl font-bold text-gray-800">Notifications</Text>
                            {unreadCount > 0 && (
                                <Text className="text-sm text-gray-500">
                                    {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Mark all as read button */}
                    {unreadCount > 0 && (
                        <TouchableOpacity
                            onPress={handleMarkAllAsRead}
                            disabled={markingAllAsRead}
                            className="flex-row items-center px-3 py-2 rounded-lg bg-teal-50"
                        >
                            {markingAllAsRead ? (
                                <ActivityIndicator size="small" color="#3CBCB2" />
                            ) : (
                                <>
                                    <CheckCheck size={16} color="#3CBCB2" />
                                    <Text className="text-teal-600 text-sm font-medium ml-1">Read all</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Unread Only Filter */}
                <View className="flex-row items-center justify-between mt-4 bg-gray-50 rounded-lg px-4 py-3">
                    <View className="flex-row items-center">
                        <Mail size={18} color={filter === 'unread' ? '#3CBCB2' : '#6B7280'} />
                        <Text className={`ml-2 font-medium ${filter === 'unread' ? 'text-teal-600' : 'text-gray-600'}`}>
                            Unread Only
                        </Text>
                        {unreadCount > 0 && (
                            <View className="bg-teal-500 px-2 py-0.5 rounded-full ml-2">
                                <Text className="text-white text-xs font-semibold">{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={() => handleFilterChange(filter === 'unread' ? 'all' : 'unread')}
                        className={`w-12 h-7 rounded-full justify-center ${filter === 'unread' ? 'bg-teal-500' : 'bg-gray-300'}`}
                    >
                        <View
                            className={`w-5 h-5 bg-white rounded-full shadow ${filter === 'unread' ? 'ml-6' : 'ml-1'}`}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Loading state */}
            {loading && notifications.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3CBCB2" />
                    <Text className="text-gray-500 mt-4">Loading notifications...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredNotifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <NotificationItem
                            notification={item}
                            onPress={() => handleNotificationPress(item)}
                            isMarking={markingId === item.id || markingAsRead}
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
                            colors={['#3CBCB2']}
                            tintColor="#3CBCB2"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Detail Modal */}
            <NotificationDetailModal
                notification={selectedNotification}
                visible={detailModalVisible}
                onClose={handleCloseModal}
                onMarkAsRead={handleMarkAsReadFromModal}
                isMarking={markingId === selectedNotification?.id}
            />
        </View>
    );
};

export default NotificationScreen;
