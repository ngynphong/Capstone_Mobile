import api from './../configs/axios';

export const sendMessage = async (message: string) => {
    try {
        const response = await api.post(`/chat?message=${encodeURIComponent(message)}`);
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};
