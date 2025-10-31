import { useState, useCallback } from 'react';
import { ChatMessage } from '../types/chatBot';
import { sendMessage } from '../services/chatBotService';

export const useChatBot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((message: ChatMessage) => {
    console.log('Adding message:', message);
    setMessages(prev => {
      const newMessages = [...prev, message];
      console.log('New messages array:', newMessages);
      return newMessages;
    });
  }, []);

  const sendUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
    };

    addMessage(userMessage);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage(text);
      console.log('API Response:', response); // Debug log

      let botText = 'Sorry, I couldn\'t process your message.';
      
      if (typeof response === 'string') {
        botText = response;
      } else if (response && typeof response === 'object') {
        // FIX: Ưu tiên trường 'data' trước, sau đó mới đến 'message'
        botText = response.data || response.message || response.response || response.text || JSON.stringify(response);
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
      };
      addMessage(botMessage);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendUserMessage,
    clearMessages,
  };
};
