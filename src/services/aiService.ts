import type { AiExamAskRequest } from "../types/ai";
import axiosInstance from "../configs/axios";

// Helper function to process SSE content
const processSSEContent = (content: string, onChunk: (chunk: string) => void) => {
    const lines = content.split('\n');
    console.log('[AI Service] Processing lines:', lines.length);

    for (const line of lines) {
        // Handle lines starting with 'data:' (SSE format)
        if (line.startsWith('data:')) {
            const data = line.slice(5); // Remove 'data:'
            console.log('[AI Service] Data line:', JSON.stringify(data));
            // If content is empty or just whitespace, it represents a newline from AI
            if (data.trim() === '') {
                onChunk('\n');
            } else {
                onChunk(data);
            }
        }
    }
};

export const askAiExamQuestion = async (
    payload: AiExamAskRequest,
    onChunk: (chunk: string) => void,
    onError: (error: Error) => void,
    onComplete: () => void
) => {
    let lastProcessedIndex = 0;

    try {
        const response = await axiosInstance.post('/ai/exam-ask', payload, {
            responseType: 'text',
            onDownloadProgress: (progressEvent) => {
                // Safely access the response, handling null cases in React Native
                const progressResponse = progressEvent.event?.currentTarget?.response;
                if (!progressResponse) return;

                const newContent = progressResponse.slice(lastProcessedIndex);
                lastProcessedIndex = progressResponse.length;

                // Debug: Log raw data
                console.log('[AI Service] Raw response length:', progressResponse.length);
                console.log('[AI Service] New content chunk:', JSON.stringify(newContent));

                // Process SSE format (data: prefix)
                processSSEContent(newContent, onChunk);
            }
        });

        // Process any remaining data from the final response
        const finalData = response.data;
        console.log('[AI Service] Final response data length:', finalData?.length);
        console.log('[AI Service] Last processed index:', lastProcessedIndex);

        if (finalData && finalData.length > lastProcessedIndex) {
            const remainingContent = finalData.slice(lastProcessedIndex);
            console.log('[AI Service] Remaining unprocessed content:', JSON.stringify(remainingContent));
            processSSEContent(remainingContent, onChunk);
        }

        console.log('[AI Service] Stream complete');
        onComplete();
    } catch (error) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
    }
};
