
/**
 * Cấu trúc phản hồi API chung
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * Cấu trúc dữ liệu phân trang
 */
export interface PageInfo<T> {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElement: number;
  totalElements?: number; // Thêm
  items: T[];
  content?: T[]; // Thêm
  sortBy?: string[]; // Thêm
}