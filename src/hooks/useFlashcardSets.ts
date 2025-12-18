import { useState, useCallback } from "react";
import FlashcardSetService from "../services/flashcardSetService";
import type {
    FlashcardSetListItem,
    FlashcardSetDetail,
    FlashcardQuizQuestion,
    FlashcardSetQuery,
    CreateFlashcardSetRequest,
    UpdateFlashcardSetRequest,
} from "../types/flashcardSet";
import type { PageInfo } from "../types/apiTypes";

interface UseFlashcardSetsReturn {
    // State
    flashcardSets: FlashcardSetListItem[];
    currentFlashcardSet: FlashcardSetDetail | null;
    quizQuestions: FlashcardQuizQuestion[];
    pageInfo: Omit<PageInfo<FlashcardSetListItem>, "items"> | null;
    loading: boolean;
    error: string | null;

    // Actions
    fetchFlashcardSets: (params?: FlashcardSetQuery) => Promise<void>;
    fetchMyFlashcardSets: (params?: { page?: number; size?: number }) => Promise<void>;
    fetchFlashcardSetById: (id: string) => Promise<FlashcardSetDetail | null>;
    createFlashcardSet: (payload: CreateFlashcardSetRequest) => Promise<FlashcardSetDetail | null>;
    updateFlashcardSet: (id: string, payload: UpdateFlashcardSetRequest) => Promise<FlashcardSetDetail | null>;
    deleteFlashcardSet: (id: string) => Promise<boolean>;
    updateVisibility: (id: string) => Promise<boolean>;
    fetchQuiz: (id: string) => Promise<FlashcardQuizQuestion[] | null>;
    clearError: () => void;
    clearCurrentFlashcardSet: () => void;
}

export const useFlashcardSets = (): UseFlashcardSetsReturn => {
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSetListItem[]>([]);
    const [currentFlashcardSet, setCurrentFlashcardSet] = useState<FlashcardSetDetail | null>(null);
    const [quizQuestions, setQuizQuestions] = useState<FlashcardQuizQuestion[]>([]);
    const [pageInfo, setPageInfo] = useState<Omit<PageInfo<FlashcardSetListItem>, "items"> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all flashcard sets with pagination
    const fetchFlashcardSets = useCallback(async (params?: FlashcardSetQuery) => {
        try {
            setLoading(true);
            setError(null);

            const response = await FlashcardSetService.getAll(params);
            const data = response.data?.data;

            if (data) {
                setFlashcardSets(data.items || []);
                setPageInfo({
                    pageNo: data.pageNo,
                    pageSize: data.pageSize,
                    totalPage: data.totalPage,
                    totalElement: data.totalElement,
                    sortBy: data.sortBy,
                });
            }
        } catch (err) {
            console.error("Error fetching flashcard sets:", err);
            const axiosError = err as {
                response?: {
                    data?: { message?: string };
                    status?: number;
                };
            };
            setError(axiosError.response?.data?.message || "Failed to fetch flashcard sets");
            setFlashcardSets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch single flashcard set by ID
    const fetchFlashcardSetById = useCallback(async (id: string): Promise<FlashcardSetDetail | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await FlashcardSetService.getById(id);
            const data = response.data?.data;

            if (data) {
                setCurrentFlashcardSet(data);
                return data;
            }
            return null;
        } catch (err) {
            console.error("Error fetching flashcard set:", err);
            const axiosError = err as {
                response?: {
                    data?: { message?: string };
                    status?: number;
                };
            };
            setError(axiosError.response?.data?.message || "Failed to fetch flashcard set");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create new flashcard set
    const createFlashcardSet = useCallback(async (payload: CreateFlashcardSetRequest): Promise<FlashcardSetDetail | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await FlashcardSetService.create(payload);
            const data = response.data?.data;

            if (data) {
                // Add to list
                setFlashcardSets(prev => [data, ...prev]);
                return data;
            }
            return null;
        } catch (err) {
            console.error("Error creating flashcard set:", err);
            const axiosError = err as {
                response?: {
                    data?: { message?: string };
                    status?: number;
                };
            };
            setError(axiosError.response?.data?.message || "Failed to create flashcard set");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update flashcard set
    const updateFlashcardSet = useCallback(async (id: string, payload: UpdateFlashcardSetRequest): Promise<FlashcardSetDetail | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await FlashcardSetService.update(id, payload);
            const data = response.data?.data;

            if (data) {
                // Update in list
                setFlashcardSets(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
                setCurrentFlashcardSet(data);
                return data;
            }
            return null;
        } catch (err) {
            console.error("Error updating flashcard set:", err);
            const axiosError = err as {
                response?: {
                    data?: { message?: string };
                    status?: number;
                };
            };
            setError(axiosError.response?.data?.message || "Failed to update flashcard set");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete flashcard set
    const deleteFlashcardSet = useCallback(async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            await FlashcardSetService.delete(id);

            // Remove from list
            setFlashcardSets(prev => prev.filter(item => item.id !== id));

            // Clear current if deleted
            if (currentFlashcardSet?.id === id) {
                setCurrentFlashcardSet(null);
            }

            return true;
        } catch (err) {
            console.error("Error deleting flashcard set:", err);
            const axiosError = err as {
                response?: {
                    data?: { message?: string };
                    status?: number;
                };
            };
            setError(axiosError.response?.data?.message || "Failed to delete flashcard set");
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentFlashcardSet?.id]);

    // Fetch quiz questions
    const fetchQuiz = useCallback(async (id: string): Promise<FlashcardQuizQuestion[] | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await FlashcardSetService.getQuiz(id);
            const data = response.data?.data;

            if (data) {
                setQuizQuestions(data);
                return data;
            }
            return null;
        } catch (err) {
            console.error("Error fetching quiz:", err);
            const axiosError = err as {
                response?: {
                    data?: { message?: string };
                    status?: number;
                };
            };
            setError(axiosError.response?.data?.message || "Failed to fetch quiz");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch my flashcard sets (created by current user)
    const fetchMyFlashcardSets = useCallback(async (params?: { page?: number; size?: number }) => {
        try {
            setLoading(true);
            setError(null);

            const response = await FlashcardSetService.getMyFlashcardSets(params);
            const data = response.data?.data;

            if (data) {
                setFlashcardSets(data.items || []);
                setPageInfo({
                    pageNo: data.pageNo,
                    pageSize: data.pageSize,
                    totalPage: data.totalPage,
                    totalElement: data.totalElement,
                    sortBy: data.sortBy,
                });
            }
        } catch (err) {
            console.error("Error fetching my flashcard sets:", err);
            const axiosError = err as {
                response?: {
                    data?: { message?: string };
                    status?: number;
                };
            };
            setError(axiosError.response?.data?.message || "Failed to fetch your flashcard sets");
            setFlashcardSets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update visibility
    const updateVisibility = useCallback(async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            await FlashcardSetService.updateVisibility(id);

            // Toggle visibility in list
            setFlashcardSets(prev => prev.map(item =>
                item.id === id ? { ...item, visible: !item.visible } : item
            ));

            // Toggle visibility in current if it's the same
            if (currentFlashcardSet?.id === id) {
                setCurrentFlashcardSet(prev => prev ? { ...prev, visible: !prev.visible } : null);
            }

            return true;
        } catch (err) {
            console.error("Error updating visibility:", err);
            const axiosError = err as {
                response?: {
                    data?: { message?: string };
                    status?: number;
                };
            };
            setError(axiosError.response?.data?.message || "Failed to update visibility");
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentFlashcardSet?.id]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Clear current flashcard set
    const clearCurrentFlashcardSet = useCallback(() => {
        setCurrentFlashcardSet(null);
        setQuizQuestions([]);
    }, []);

    return {
        // State
        flashcardSets,
        currentFlashcardSet,
        quizQuestions,
        pageInfo,
        loading,
        error,

        // Actions
        fetchFlashcardSets,
        fetchMyFlashcardSets,
        fetchFlashcardSetById,
        createFlashcardSet,
        updateFlashcardSet,
        deleteFlashcardSet,
        updateVisibility,
        fetchQuiz,
        clearError,
        clearCurrentFlashcardSet,
    };
};