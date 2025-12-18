import axiosInstance from "../configs/axios";
import type { AxiosResponse } from "axios";
import type {
    FlashcardSetListResponse,
    FlashcardSetDetailResponse,
    FlashcardQuizResponse,
    FlashcardSetQuery,
    CreateFlashcardSetRequest,
    UpdateFlashcardSetRequest,
} from "../types/flashcardSet";
import type { ApiResponse } from "../types/apiTypes";

const FlashcardSetService = {
    // GET /flashcard-sets - Get all flashcard sets with pagination
    getAll(params?: FlashcardSetQuery): Promise<AxiosResponse<FlashcardSetListResponse>> {
        return axiosInstance.get("/flashcard-sets", { params });
    },

    // GET /flashcard-sets/{id} - Get flashcard set by ID
    getById(id: string): Promise<AxiosResponse<FlashcardSetDetailResponse>> {
        return axiosInstance.get(`/flashcard-sets/${id}`);
    },

    // POST /flashcard-sets - Create new flashcard set
    create(payload: CreateFlashcardSetRequest): Promise<AxiosResponse<FlashcardSetDetailResponse>> {
        return axiosInstance.post("/flashcard-sets", payload);
    },

    // PUT /flashcard-sets/{id} - Update flashcard set
    update(id: string, payload: UpdateFlashcardSetRequest): Promise<AxiosResponse<FlashcardSetDetailResponse>> {
        return axiosInstance.put(`/flashcard-sets/${id}`, payload);
    },

    // DELETE /flashcard-sets/{id} - Delete flashcard set
    delete(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return axiosInstance.delete(`/flashcard-sets/${id}`);
    },

    // GET /flashcard-sets/{id}/quiz - Get quiz questions for a flashcard set
    getQuiz(id: string): Promise<AxiosResponse<FlashcardQuizResponse>> {
        return axiosInstance.get(`/flashcard-sets/${id}/quiz`);
    },

    // GET /flashcard-sets/my-sets - Get flashcard sets created by current user
    getMyFlashcardSets(params?: { page?: number; size?: number }): Promise<AxiosResponse<FlashcardSetListResponse>> {
        return axiosInstance.get("/flashcard-sets/my-sets", { params });
    },

    // PATCH /flashcard-sets/{id}/visibility - Update flashcard set visibility
    updateVisibility(id: string): Promise<AxiosResponse<ApiResponse<string>>> {
        return axiosInstance.patch(`/flashcard-sets/${id}/visibility`);
    },
};

export default FlashcardSetService;
