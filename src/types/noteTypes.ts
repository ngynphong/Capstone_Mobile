import type { ApiResponse, PageInfo } from './apiTypes';

export interface Note {
  id: string;
  lessonId: string;
  userId: string;
  title?: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotePayload {
  lessonId: string;
  title?: string;
  description: string;
}

export type NoteResponse = ApiResponse<Note>;

export type NoteListResponse = ApiResponse<Note[] | PageInfo<Note>>;


