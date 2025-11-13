// Cấu trúc của mỗi lựa chọn (choice)
export interface QuestionOption {
  id?: string;
  text: string;
  isCorrect?: boolean;
}

// Đại diện cho 1 câu hỏi trong ngân hàng (API trả về)
export interface QuestionBankItem {
  id: string;
  text: string;
  subject: string;
  topic?: string;
  difficulty: "easy" | "medium" | "hard";
  type: "mcq" | "frq";
  createdBy: string;
  createdAt: string;
  options?: QuestionOption[];
  expectedAnswer?: string;
  tags?: string[];
}

// Dùng khi thêm câu hỏi thủ công (form modal)
export interface NewQuestion {
  text: string;
  subject: string;
  topic?: string;
  difficulty: "easy" | "medium" | "hard";
  type: "mcq" | "frq";
  tags?: string[];
  choices?: string[];
  correctIndex?: number | null;
  expectedAnswer?: string;
}

// Form field types cho AddQuestionModal
export type QuestionFormFields = {
  text: string;
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple_choice" | "essay";
  choices?: string[];
  correctIndex?: number | null;
  expectedAnswer?: string;
  tags: string[];
};

// Cấu trúc của câu hỏi trắc nghiệm (MCQ)
export interface MCQ extends QuestionBankItem {
  type: "mcq";
  options: QuestionOption[];
}

// Cấu trúc của câu hỏi tự luận (FRQ)
export interface FRQ extends QuestionBankItem {
  type: "frq";
  expectedAnswer: string;
}

// Types for /questions-v2 API response
export interface Subject {
  id: string;
  name: string;
  description: string | null;
}

export interface Difficulty {
  id: string;
  name: string;
  description: string | null;
}

export interface Answer {
  id: string;
  content: string;
}

export interface QuestionV2 {
  id: string;
  content: string;
  type: "mcq" | "frq";
  subject: Subject;
  difficulty: Difficulty;
  createdBy: string;
  topic: string;
  answers: Answer[];
}

export interface QuestionV2PaginationResponse {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElement: number;
  sortBy: string | null;
  items: QuestionV2[];
}

export interface QuestionPaginationResponse {
  items: QuestionBankItem[];
  totalElement: number;
}
