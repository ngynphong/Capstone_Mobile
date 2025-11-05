// Subject API Response Types
export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNo: number;
  pageSize: number;
  sortBy: string | null;
  totalElement: number;
  totalPage: number;
}

export interface GetAllSubjectsResponse extends ApiResponse<PaginatedResponse<Subject>> {}

export interface GetSubjectByIdResponse extends ApiResponse<Subject> {}

// API Request Types
export interface GetSubjectByIdParams {
  id: string;
}
