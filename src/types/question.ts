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
export interface QuestionPaginationResponse {
  items: QuestionBankItem[];
  totalElement: number;
}