import axios from '../configs/axios';
import {
  GetAllSubjectsResponse,
  GetSubjectByIdResponse,
  GetSubjectByIdParams,
} from '../types/subjectTypes';

export class SubjectService {
  // Get all subjects
  static async getAllSubjects(): Promise<GetAllSubjectsResponse> {
    try {
      const response = await axios.get('/subjects');
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  // Get subject by ID
  static async getSubjectById(params: GetSubjectByIdParams): Promise<GetSubjectByIdResponse> {
    try {
      const response = await axios.get('/subject', {
        params: { id: params.id },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching subject by ID:', error);
      throw error;
    }
  }
}
