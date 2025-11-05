// Exam API Response Types
export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  subjectNames: string[];
  createdByName: string;
  questionContents: string[];
  isActive: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface GetAllExamsResponse extends ApiResponse<Exam[]> {}

export interface GetExamByIdResponse extends ApiResponse<Exam> {}

// API Request Types
export interface GetExamByIdParams {
  id: string;
}

// Navigation Types
export type ExamStackParamList = {
  ExamLibrary: undefined;
  ExamDetail: { examId: string };
  PracticeMode: { examId: string };
  FlashCard: { examId: string };
  Quiz: { examId: string };
  FRQ: { examId: string };
  FullTest: { examId: string };
  TestResults: { attempt: any }; // Using any for now since the attempt structure may vary
};

// Mock attempt type for test results
export interface MockAttempt {
  examId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
}
