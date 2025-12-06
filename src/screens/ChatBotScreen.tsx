import React, { useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import { Send, Bot, User, Trash2 } from 'lucide-react-native';
import { useChatBot } from '../hooks/useChatBot'; // Sửa đổi: Xóa phần mở rộng .ts
import { ChatMessage } from '../types/chatBot';
import { useNavigation } from '@react-navigation/native';

const ChatBotScreen = () => {
    const { messages, isLoading, error, sendUserMessage, clearMessages } = useChatBot();
    const [inputText, setInputText] = React.useState('');
    const flatListRef = useRef<FlatList>(null);
    const navigation = useNavigation();

    const handleSend = async () => {
        if (inputText.trim() && !isLoading) {
            await sendUserMessage(inputText);
            setInputText('');
        }
    };

    const handleClearChat = () => {
        Alert.alert(
            'Clear Chat',
            'Are you sure you want to clear all messages?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearMessages },
            ]
        );
    };

    // Function to render formatted text with bold markers
    const renderFormattedText = (text: string, isUser: boolean) => {
        if (!text) return null;

        const parts = text.split(/(\*\*.*?\*\*)/g); // Split by **bold** markers

        return (
            <Text style={{
                color: isUser ? '#FFFFFF' : '#1F2937',
                fontSize: 14,
                lineHeight: 20,
            }}>
                {parts.map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        // Bold text
                        const boldText = part.slice(2, -2); // Remove ** markers
                        return (
                            <Text
                                key={index}
                                style={{
                                    fontWeight: 'bold',
                                    color: isUser ? '#FFFFFF' : '#1F2937',
                                }}
                            >
                                {boldText}
                            </Text>
                        );
                    } else {
                        // Regular text
                        return (
                            <Text key={index}>
                                {part}
                            </Text>
                        );
                    }
                })}
            </Text>
        );
    };

    // Typing indicator component
    const TypingIndicator = () => {
        const [dots, setDots] = React.useState('');

        React.useEffect(() => {
            const interval = setInterval(() => {
                setDots(prev => {
                    if (prev === '...') return '';
                    return prev + '.';
                });
            }, 500);

            return () => clearInterval(interval);
        }, []);

        return (
            <View style={{
                flexDirection: 'row',
                marginBottom: 16,
                justifyContent: 'flex-start'
            }}>
                <View className="w-6 h-6 rounded-full bg-backgroundColor items-center justify-center mr-2 mt-0.5">
                    <Bot size={14} color="white" />
                </View>

                <View style={{
                    maxWidth: '80%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    marginRight: 48,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{
                            color: '#6B7280',
                            fontSize: 14,
                            marginRight: 8,
                        }}>
                            AI đang trả lời
                        </Text>
                        <Text style={{
                            color: '#3CBCB2',
                            fontSize: 16,
                            fontWeight: 'bold',
                        }}>
                            {dots}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        return (
            <View style={{
                flexDirection: 'row',
                marginBottom: 16,
                justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start'
            }}>
                {item.sender === 'bot' && (
                    <View className="w-6 h-6 rounded-full bg-backgroundColor items-center justify-center mr-2 mt-0.5">
                        <Bot size={14} color="white" />
                    </View>
                )}

                <View style={{
                    maxWidth: '80%',
                    backgroundColor: item.sender === 'user' ? '#3CBCB2' : '#FFFFFF',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    marginLeft: item.sender === 'user' ? 48 : 0,
                    marginRight: item.sender === 'user' ? 0 : 48,
                    borderWidth: item.sender === 'user' ? 0 : 1,
                    borderColor: item.sender === 'user' ? 'transparent' : '#E5E7EB',
                    shadowColor: item.sender === 'user' ? '#3CBCB2' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: item.sender === 'user' ? 0.2 : 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}>
                    {renderFormattedText(item.text || 'No text content', item.sender === 'user')}

                </View>

            </View>
        );
    };

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center px-8">
            <View className="w-20 h-20 rounded-full bg-backgroundColor/10 items-center justify-center mb-6">
                <Bot size={32} color="#3CBCB2" />
            </View>
            <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">
                AI Study Assistant
            </Text>
            <Text className="text-gray-600 text-center leading-6">
                Ask me anything about your studies, exams, or learning materials. I'm here to help you succeed!
            </Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Header */}
            <View className="bg-white border-b border-gray-200 px-4 py-6">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center mt-5">
                        <View className="w-10 h-10 rounded-full bg-backgroundColor items-center justify-center mr-3">
                            <Bot size={20} color="white" />
                        </View>
                        <View>
                            <Text className="text-lg font-semibold text-gray-800">AI Assistant</Text>
                            <Text className="text-sm text-green-500">Online</Text>
                        </View>
                    </View>
                    <View className='flex flex-row gap-2'>
                        {messages.length > 0 && (
                            <TouchableOpacity
                                onPress={handleClearChat}
                                className="p-2 rounded-full bg-red-100"
                            >
                                <Trash2 size={18} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => {
                                navigation.goBack();
                            }}
                            className="p-2 rounded-full bg-gray-100"
                        >
                            <Text>Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                key={messages.length} // Force re-render when messages change
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                ListEmptyComponent={renderEmptyState}
                ListFooterComponent={isLoading ? <TypingIndicator /> : null}
            />

            {/* Error Message */}
            {error && (
                <View className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mb-2 rounded-r-lg">
                    <Text className="text-red-700 text-sm">{error}</Text>
                </View>
            )}

            {/* Input Area */}
            <View className="bg-white border-t border-gray-200 px-4 mb-2 py-3">
                <View className="flex-row items-center">
                    <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 mr-3 max-h-32">
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Ask me anything about your studies..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            className="text-gray-800 text-base leading-5"
                            style={{ maxHeight: 100 }}
                            onSubmitEditing={handleSend}
                            blurOnSubmit={false}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!inputText.trim() || isLoading}
                        className={`w-12 h-12 rounded-full items-center justify-center ${inputText.trim() && !isLoading
                            ? 'bg-backgroundColor'
                            : 'bg-gray-300'
                            }`}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Send size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    messagesContainer: {
        flexGrow: 1,
        padding: 16,
    },
});

export default ChatBotScreen;
