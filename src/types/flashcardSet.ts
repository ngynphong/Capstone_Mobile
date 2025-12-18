import type { PageInfo, ApiResponse } from "../types/apiTypes";

// Author profiles
export interface FlashcardAuthorTeacherProfile {
    id: string;
    qualification: string;
    specialization: string;
    experience: string;
    biography: string;
    rating: number;
    certificateUrls: string[];
    isVerified: boolean;
}

export interface FlashcardAuthorStudentProfile {
    id: string;
    schoolName: string;
    emergencyContact: string;
    goal: string;
}

export interface FlashcardAuthorParentProfile {
    id: string;
    occupation: string;
}

// Author type
export interface FlashcardAuthor {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    imgUrl: string;
    dob: string;
    roles: string[];
    teacherProfile?: FlashcardAuthorTeacherProfile;
    studentProfile?: FlashcardAuthorStudentProfile;
    parentProfile?: FlashcardAuthorParentProfile;
}

// Flashcard type
export interface Flashcard {
    id: string;
    term: string;
    definition: string;
    imageUrl: string;
    displayOrder: number;
}

// Flashcard Set (list item - without flashcards)
export interface FlashcardSetListItem {
    id: string;
    title: string;
    description: string;
    cardCount: number;
    viewCount: number;
    author: FlashcardAuthor;
    createdAt: string;
    visible: boolean;
}

// Flashcard Set (detail - with flashcards)
export interface FlashcardSetDetail extends FlashcardSetListItem {
    flashcards: Flashcard[];
}

// Quiz Question type
export interface FlashcardQuizQuestion {
    flashcardId: string;
    question: string;
    imageUrl: string;
    options: string[];
    correctAnswer: string;
}

// Request types
export interface FlashcardSetQuery {
    keyword?: string;
    page?: number;
    size?: number;
}

export interface CreateFlashcardRequest {
    term: string;
    definition: string;
    imageUrl?: string;
}

export interface CreateFlashcardSetRequest {
    title: string;
    description: string;
    cards: CreateFlashcardRequest[];
    isVisible: boolean;
}

export interface UpdateFlashcardSetRequest {
    title?: string;
    description?: string;
    cards?: CreateFlashcardRequest[];
    isVisible: boolean;
}

// Response types
export type FlashcardSetListResponse = ApiResponse<PageInfo<FlashcardSetListItem>>;
export type FlashcardSetDetailResponse = ApiResponse<FlashcardSetDetail>;
export type FlashcardQuizResponse = ApiResponse<FlashcardQuizQuestion[]>;
