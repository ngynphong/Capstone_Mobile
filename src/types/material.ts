export interface Material {
  id: string;
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
