export interface Material {
  id: string;
  learningMaterialId?: string;
  title: string;
  description: string;
  fileImage?: string;
  contentUrl: string;
  typeId: string;
  typeName: string;
  subjectId: string;
  subjectName: string;
  authorId: string;
  authorName: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialPagination {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElement: number;
  sortBy: string[];
  items: Material[];
}

export interface MaterialResponse {
  code: number;
  message: string;
  data: MaterialPagination;
}

// Learning Material Rating Types
export interface MaterialRatingPayload {
  learningMaterialId: string;
  userId: string;
  rating: number;
  comment?: string;
  [key: string]: unknown;
}

export interface MaterialRating {
  id?: string;
  materialId: string;
  userId: string;
  rating: number;
  comment?: string;
  userFullName?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface MaterialRatingStatistics {
  materialId: string;
  averageRating: number;
  totalRatings: number;
  [key: string]: unknown;
}

export interface MaterialRatingsResponse {
  code: number;
  message: string;
  data: MaterialRating | MaterialRating[];
}

export interface MaterialRatingStatisticsResponse {
  code: number;
  message: string;
  data: MaterialRatingStatistics;
}