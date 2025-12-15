import type { AxiosResponse } from 'axios';
import axiosInstance from '../configs/axios';
import type { ApiResponse, PageInfo } from '../types/apiTypes';
import type { Note, NotePayload } from '../types/noteTypes';

type NoteListApiResponse = ApiResponse<Note[] | PageInfo<Note>>;

const NoteService = {
  /**
   * POST /api/notes
   * Create a new note.
   */
  createNote(payload: NotePayload): Promise<AxiosResponse<ApiResponse<Note>>> {
    return axiosInstance.post('/api/notes', payload);
  },

  /**
   * PUT /api/notes/{noteId}
   * Update an existing note.
   */
  updateNote(
    noteId: string,
    payload: Partial<NotePayload>,
  ): Promise<AxiosResponse<ApiResponse<Note>>> {
    return axiosInstance.put(`/api/notes/${noteId}`, payload);
  },

  /**
   * DELETE /api/notes/{noteId}
   * Delete a note.
   */
  deleteNote(noteId: string): Promise<AxiosResponse<void>> {
    return axiosInstance.delete(`/api/notes/${noteId}`);
  },

  /**
   * GET /api/notes/my-notes
   * Get all notes of current user.
   */
  getMyNotes(): Promise<AxiosResponse<NoteListApiResponse>> {
    return axiosInstance.get('/api/notes/my-notes');
  },

  /**
   * GET /api/notes/lesson/{lessonId}
   * Get all notes of a lesson (any user).
   */
  getNotesByLesson(
    lessonId: string,
    pageNo: number = 0,
    pageSize: number = 20,
  ): Promise<AxiosResponse<NoteListApiResponse>> {
    return axiosInstance.get(`/api/notes/lesson/${lessonId}`, {
      params: { pageNo, pageSize },
    });
  },

  /**
   * GET /api/notes/lesson/{lessonId}/user/{userId}
   * Get note(s) of a specific user for a lesson.
   */
  getNotesByLessonAndUser(
    lessonId: string,
    userId: string,
  ): Promise<AxiosResponse<NoteListApiResponse>> {
    return axiosInstance.get(`/api/notes/lesson/${lessonId}/user/${userId}`);
  },
};

export default NoteService;


