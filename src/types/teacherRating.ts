// src/types/teacherRating.ts
// Định nghĩa type/interface dùng chung cho teacher rating API

export interface TeacherRatingPayload {
  teacherId: string;
  studentId: string;
  // Điểm đánh giá, ví dụ: 1 - 5
  rating: number;
  // Nhận xét thêm của học sinh
  comment?: string;
  // Nếu BE có thêm trường khác thì có thể mở rộng tại đây
  [key: string]: unknown;
}

export interface TeacherRating {
  id?: string;
  teacherId: string;
  studentId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  isVerified: boolean;
  learningMaterialTitle?: string;
  learningMaterialId?: string;
  [key: string]: unknown;
}

export interface TeacherRatingStatistics {
  teacherId: string;
  averageRating: number;
  totalRatings: number;
  // Có thể mở rộng thêm các field như: 1StarCount, 2StarCount,...
  [key: string]: unknown;
}


