import axios from '../configs/axios';
import {
  Exam,
  GetAllExamsResponse,
  GetExamByIdResponse,
  GetExamByIdParams
} from '../types/examTypes';

export class ExamService {
  // Get all exams
  static async getAllExams(): Promise<GetAllExamsResponse> {
    try {
      const response = await axios.get('/api/exams');
      return response.data;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  }

  // Get exam by ID
  static async getExamById(params: GetExamByIdParams): Promise<GetExamByIdResponse> {
    try {
      const response = await axios.get('/api/exam', {
        params: { id: params.id }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exam by ID:', error);
      throw error;
    }
  }
}
