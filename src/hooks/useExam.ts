import { useState, useCallback } from 'react';
import { Exam, GetAllExamsResponse, GetExamByIdResponse } from '../types/examTypes';
import { ExamService } from '../services/examService';

export const useExam = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all exams
  const fetchAllExams = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: GetAllExamsResponse = await ExamService.getAllExams();
      setExams(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exams';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get exam by ID
  const fetchExamById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: GetExamByIdResponse = await ExamService.getExamById({ id });
      setCurrentExam(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exam';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear current exam
  const clearCurrentExam = useCallback(() => {
    setCurrentExam(null);
    setError(null);
  }, []);

  // Clear all exams
  const clearExams = useCallback(() => {
    setExams([]);
    setError(null);
  }, []);

  return {
    exams,
    currentExam,
    isLoading,
    error,
    fetchAllExams,
    fetchExamById,
    clearCurrentExam,
    clearExams,
  };
};
