import type { AiExamAskRequest } from "../types/ai";
import axiosInstance from "../configs/axios";

export const askAiExamQuestion = async (
    payload: AiExamAskRequest,
    onChunk: (chunk: string) => void,
    onError: (error: Error) => void,
    onComplete: () => void
) => {
    let lastProcessedIndex = 0;

    try {
        await axiosInstance.post('/ai/exam-ask', payload, {
            responseType: 'text',
            onDownloadProgress: (progressEvent) => {
                // Safely access the response, handling null cases in React Native
                const response = progressEvent.event?.currentTarget?.response;
                if (!response) return;

                const newContent = response.slice(lastProcessedIndex);
                lastProcessedIndex = response.length;

                // Process SSE format (data: prefix)
                const lines = newContent.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const content = line.slice(5); // Remove 'data:'
                        onChunk(content);
                    }
                }
            }
        });

        onComplete();
    } catch (error) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
    }
};
