export interface ParentData {
  key: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  student: string;
  status: "Active" | "Inactive";
}


export interface ChildInfo {
  studentId: string;
  studentName: string;
  email: string;
  avatarUrl: string;
  totalExamsTaken: number;
  averageScore: number;
  lastExamTitle: string;
  lastExamScore: number;
  lastActivity: string; // ISO Date string
}

export interface ChildExamHistoryItem {
  attemptId: string;
  examId: string;
  doneBy: string;
  score: number;
  startTime: string;
  endTime: string;
  status: string;
  rating: number;
  title: string;
}

export interface LinkStudentPayload {
  studentEmail: string;
  connectionCode: string;
}

export interface UnlinkStudentPayload {
  studentEmail: string;
}

export interface ConnectionCodeResponse {
  code: number;
  message: string;
  data: string; // The connection code
}