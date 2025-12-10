import { useState, useCallback } from 'react';
import { askAiExamQuestion } from '../services/aiService';
import type { AiExamAskRequest } from '../types/ai';

export const useAiExamAsk = () => {
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const askAi = useCallback(async (payload: AiExamAskRequest) => {
        setIsLoading(true);
        setResponse('');
        setError(null);

        await askAiExamQuestion(
            payload,
            (chunk) => {
                setResponse((prev) => prev + chunk);
            },
            (err) => {
                setError(err.message);
                setIsLoading(false);
            },
            () => {
                setIsLoading(false);
            }
        );
    }, []);

    const clearResponse = useCallback(() => {
        setResponse('');
        setError(null);
    }, []);

    return {
        response,
        isLoading,
        error,
        askAi,
        clearResponse
    };
};
