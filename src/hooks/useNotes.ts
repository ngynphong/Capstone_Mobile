import { useCallback, useState } from 'react';
import NoteService from '../services/noteService';
import type { Note, NotePayload } from '../types/noteTypes';
import type { ApiResponse, PageInfo } from '../types/apiTypes';

type NoteListApiResponse = ApiResponse<Note[] | PageInfo<Note>>;

const normalizeNotesResponse = (response: NoteListApiResponse | Note[] | undefined | null): Note[] => {
  if (!response) return [];

  const rawData =
    Array.isArray(response) || !(response as NoteListApiResponse).data
      ? (response as Note[])
      : (response as NoteListApiResponse).data;

  if (Array.isArray(rawData)) {
    return rawData;
  }

  // Trường hợp backend trả về 1 object Note đơn lẻ (không paging)
  if ((rawData as any)?.id && (rawData as any)?.lessonId) {
    return [rawData as unknown as Note];
  }

  const pageInfo = rawData as PageInfo<Note>;
  return pageInfo.items || pageInfo.content || [];
};

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [myNotes, setMyNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyNotes = useCallback(async (): Promise<Note[]> => {
    try {
      setLoading(true);
      setError(null);

      const res = await NoteService.getMyNotes();
      const list = normalizeNotesResponse(res.data);
      setMyNotes(list);
      return list;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load your notes.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotesByLesson = useCallback(
    async (lessonId: string): Promise<Note[]> => {
      try {
        setLoading(true);
        setError(null);
        const res = await NoteService.getNotesByLesson(lessonId);
        const list = normalizeNotesResponse(res.data);
        setNotes(list);
        return list;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to load notes for this lesson.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchNotesByLessonAndUser = useCallback(
    async (lessonId: string, userId: string): Promise<Note[]> => {
      try {
        setLoading(true);
        setError(null);
        const res = await NoteService.getNotesByLessonAndUser(lessonId, userId);
        const list = normalizeNotesResponse(res.data);
        return list;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to load notes for this lesson.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createNote = useCallback(
    async (payload: NotePayload): Promise<Note> => {
      try {
        setLoading(true);
        setError(null);
        const res = await NoteService.createNote(payload);
        const note = (res.data as ApiResponse<Note>).data || (res.data as any);
        setNotes(prev => [note, ...prev]);
        return note;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to create note.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateNote = useCallback(
    async (noteId: string, payload: Partial<NotePayload>): Promise<Note> => {
      try {
        setLoading(true);
        setError(null);
        const res = await NoteService.updateNote(noteId, payload);
        const updated =
          (res.data as ApiResponse<Note>).data || (res.data as any);
        setNotes(prev =>
          prev.map(n => (n.id === noteId ? { ...n, ...updated } : n)),
        );
        return updated;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to update note.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await NoteService.deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      return true;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to delete note.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // state
    notes,
    myNotes,
    loading,
    error,

    // actions
    fetchMyNotes,
    fetchNotesByLesson,
    fetchNotesByLessonAndUser,
    createNote,
    updateNote,
    deleteNote,
  };
};

export default useNotes;


