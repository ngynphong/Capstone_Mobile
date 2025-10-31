// Core exam types based on the web interface
export type SubjectType = 'All' | 'Math' | 'History' | 'Art' | 'Biology' | 'Chemistry' | 'Physics' | 'English' | 'Music';

export interface Subject {
  id: string;
  name: SubjectType;
  icon?: string;
  color?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: Subject;
  level: string;
  sentences: number;
  questions: number;
  duration: number; // in minutes
  attempts?: number;
  totalAttemptsCount?: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description?: string;
  tags?: string[];
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  rating: number;
  tokenCost: number;
}

export interface Question {
  id: string;
  type: 'MCQ' | 'FRQ';
  question: string;
  options?: string[]; // for MCQ
  correctAnswer?: string;
  explanation?: string;
  points?: number;
  timeLimit?: number; // in seconds
}

export interface ExamSection {
  id: string;
  title: string;
  type: 'MCQ' | 'FRQ';
  questions: Question[];
  timeLimit?: number;
}

export interface PracticeSession {
  examId: string;
  mode: 'flashcard' | 'quiz' | 'frq';
  questions: Question[];
  currentIndex: number;
  answers: Record<string, any>;
  startTime: Date;
  timeRemaining?: number;
  score?: number;
  completed: boolean;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface FRQAnswer {
  questionId: string;
  answer: string;
  wordCount: number;
  timeSpent: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: (QuizAnswer | FRQAnswer)[];
  completed: boolean;
}

export interface ExamStats {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  subjectProgress: Record<SubjectType, number>;
}

// Navigation types
export type ExamStackParamList = {
  ExamLibrary: undefined;
  ExamDetail: { examId: string };
  PracticeMode: { examId: string };
  FlashCard: { session: PracticeSession };
  Quiz: { session: PracticeSession };
  FRQ: { session: PracticeSession };
  FullTest: { examId: string };
  TestResults: { attempt: ExamAttempt };
};

// Filter and search types
export interface ExamFilters {
  subject?: SubjectType;
  level?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  duration?: {
    min?: number;
    max?: number;
  };
  searchQuery?: string;
}

export interface ExamSortOption {
  field: 'title' | 'level' | 'duration' | 'attempts' | 'difficulty';
  direction: 'asc' | 'desc';
}
