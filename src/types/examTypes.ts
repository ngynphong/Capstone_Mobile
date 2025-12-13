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
  tokenCost: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface GetAllExamsResponse extends ApiResponse<Exam[]> { }

export interface GetExamByIdResponse extends ApiResponse<Exam> { }

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


/**
 * (API Start) Thông tin cơ bản về môn học hoặc chủ đề.
 */
export interface ExamSubjectInfo {
  id: string;
  name: string;
  description: string;
}

/**
 * (API Start) Một lựa chọn trả lời cho câu hỏi.
 */
export interface ExamAnswer {
  id: string;
  content: string;
}

/**
 * (API Start) Chi tiết của một câu hỏi (object lồng nhau).
 */
export interface ExamQuestionDetail {
  id: string;
  content: string;
  type: string; // "mcq" | "frq"
  subject: ExamSubjectInfo;
  difficulty: ExamSubjectInfo; // Giả sử difficulty có cấu trúc tương tự subject
  createdBy: string;
  topic: string;
  answers: ExamAnswer[]; // Danh sách các lựa chọn trả lời
}

/**
 * (API Start) Một câu hỏi trong bài thi đang làm.
 */
export interface ActiveExamQuestion {
  examQuestionId: string; // ID duy nhất của câu hỏi trong lần thi này
  question: ExamQuestionDetail;
  orderNumber: number;
  points: number;
  savedAnswer?: {
    selectedAnswerId?: string | null;
    frqAnswerText?: string | null;
  } | null;
}

/**
 * (API Start) Dữ liệu chính của bài thi khi bắt đầu.
 */
export interface ActiveExam {
  id: string; // Exam ID
  title: string;
  subject: ExamSubjectInfo;
  examAttemptId: string; // ID của lần làm bài này
  durationInMinute: number;
  passingScore: number;
  belongTo: string;
  questions: ActiveExamQuestion[];
  savedAnswer: SaveProgressPayload | null; // Đáp án đã lưu (null nếu thi lần đầu)
  attemptSessionToken: string; // Token for save/submit verification
}

// 2. Types cho API /exam-test/submit/{attemptId}

/**
 * (API Submit) Payload cho một câu trả lời.
 */
export interface ExamSubmissionAnswer {
  examQuestionId: string;
  selectedAnswerId?: string | null; // Cập nhật cho phép null
  frqAnswerText?: string | null; // Cập nhật cho phép null
}

/**
 * (API Submit) Payload để nộp bài.
 */
export interface SubmitExamPayload {
  answers: ExamSubmissionAnswer[];
  attemptSessionToken: string;
}

/**
 * (API Submit) Dữ liệu trả về sau khi nộp bài.
 */
export interface ExamResult {
  id: string; // Submission ID
  examId: string;
  userId: string;
  score: number;
  startAt: string; // ISO Date string
  endAt: string; // ISO Date string
}


// Đại diện cho 1 quy tắc trong khuôn mẫu
export interface ExamRule {
  id: string;
  topicName: string;
  difficultyName: 'Easy' | 'Medium' | 'Hard';
  questionType: 'mcq' | 'frq';
  numberOfQuestions: number;
  points: number;
}

export interface ExamTemplateSubject {
  id: string;
  name: string;
  description: string;
}
// Đại diện cho 1 khuôn mẫu đề thi (dùng cho trang Browse)
export interface ExamTemplate {
  id: string;
  title: string;
  description: string;
  subject: ExamTemplateSubject;
  duration: number;
  passingScore: number;
  isActive: boolean;
  createdBy: string;
  createdAt?: string;
  rules: ExamRule[];
  tokenCost: number;
  averageRating: number;
  totalRatings: number;
  totalTakers: number;
}

// Types cho api của học sinh xem danh sách bài thi
export interface BrowseExamTemplateParams {
  subject?: string;
  teacherId?: string;
  minRating?: number;
  pageNo?: number;
  pageSize?: number;
  sorts?: string[];
}

// --- Types từ web/types/examAttempt.ts ---

/**
 * Payload cho API /exam-attempts/start-single
 */
export interface StartSinglePayload {
  templateId: string;
}

/**
 * Payload cho API /exam-attempts/start-combo
 */
export interface StartComboPayload {
  templateIds: string[];
}

/**
 * Payload cho API /exam-attempts/start-combo-random
 */
export interface StartComboRandomPayload {
  subjectIds: string[];
}

/**
 * Payload cho API /exam-attempts/{attemptId}/rate
 */
export interface RateAttemptPayload {
  rating: number;
  comment: string;
}

/**
 * Chi tiết câu hỏi trong kết quả của một lần thi
 * (dùng trong response của /result)
 */
export interface AttemptResultQuestion {
  examQuestionId: string;
  question: ExamQuestionDetail;
  orderNumber: number;
  points: number;
  studentAnswer: {
    studentAnswerId: string;
    selectedAnswerId: string | null;
    frqAnswerText: string | null;
    score: number;
    feedback: string | null;
    correctAnswer: {
      id: string;
      content: string;
      isCorrect: boolean;
      explanation: string | null;
    };
  };
  score: number;
}

/**
 * Chi tiết đầy đủ của một lần thi đã hoàn thành
 * (dùng trong response của /result)
 */
export interface AttemptResultDetail {
  attemptId: string; // ID của Attempt
  examId: string;
  title: string;
  subjects: ExamSubjectInfo[];
  status: string; // "IN_PROGRESS", "COMPLETED"
  score: number;
  passingScore: number;
  startTime: string;
  endTime: string;
  rating: number;
  questions: AttemptResultQuestion[];
}

/**
 * Kiểu dữ liệu cho một dòng trong lịch sử thi
 * (Dùng cho trang ExamResultsScreen)
 */
export interface HistoryRecord {
  attemptId: string;
  examId: string;
  doneBy: string;
  score: number;
  startTime: string;
  endTime: string | null;
  rating: number | null;
}

/**
 * Payload cho API /exam-attempts/{attemptId}/save-progress
 */
export interface SaveProgressPayload {
  answers: {
    examQuestionId: string;
    selectedAnswerId?: string | null; // Dùng cho MCQ
    frqAnswerText?: string | null;    // Dùng cho FRQ
  }[];
  attemptSessionToken: string;
}
