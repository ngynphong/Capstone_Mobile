import { useState, useCallback } from 'react';
import { Subject, GetAllSubjectsResponse, GetSubjectByIdResponse } from '../types/subjectTypes';
import { SubjectService } from '../services/subjectService';

export const useSubject = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all subjects
  const fetchAllSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: GetAllSubjectsResponse = await SubjectService.getAllSubjects();
      const subjectsData = response.data.items;
      setSubjects(subjectsData);
      console.log('Subject data', subjectsData);
      return subjectsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subjects';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get subject by ID
  const fetchSubjectById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: GetSubjectByIdResponse = await SubjectService.getSubjectById({ id });
      setCurrentSubject(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subject';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear current subject
  const clearCurrentSubject = useCallback(() => {
    setCurrentSubject(null);
    setError(null);
  }, []);

  // Clear all subjects
  const clearSubjects = useCallback(() => {
    setSubjects([]);
    setError(null);
  }, []);

  return {
    subjects,
    currentSubject,
    isLoading,
    error,
    fetchAllSubjects,
    fetchSubjectById,
    clearCurrentSubject,
    clearSubjects,
  };
};
