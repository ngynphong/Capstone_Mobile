import type { AxiosResponse } from 'axios';
import axiosInstance from '../configs/axios';
import type { MaterialResponse } from '../types/material';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=600&q=60';

const MaterialService = {
  /**
   * GET /learning-materials
   * Lấy danh sách học liệu công khai (có hỗ trợ query params).
   */
  getPublicMaterials(
    params?: Record<string, unknown>,
  ): Promise<AxiosResponse<MaterialResponse>> {
    return axiosInstance.get('/learning-materials', { params });
  },

  /**
   * GET /{fileName}/materials
   * Lấy file (ảnh/pdf/etc) của học liệu theo fileName.
   * Sử dụng responseType: 'arraybuffer' để xử lý đa định dạng.
   */
  getMaterialAsset(fileName: string): Promise<AxiosResponse<ArrayBuffer>> {
    const safeFileName = encodeURIComponent(fileName.trim());
    return axiosInstance.get(`/${safeFileName}/materials`, {
      responseType: 'arraybuffer',
    });
  },

  /**
   * Helper trả về URL xem trực tiếp file học liệu (ảnh, pdf...).
   * Nếu thiếu fileName sẽ trả placeholder cố định.
   */
  getMaterialAssetUrl(fileName?: string): string {
    if (!fileName || fileName.trim().length === 0 || fileName === 'string') {
      return PLACEHOLDER_IMAGE;
    }
    if (!API_BASE_URL) {
      return PLACEHOLDER_IMAGE;
    }
    const safeName = encodeURIComponent(fileName.trim());
    return `${API_BASE_URL}/${safeName}/materials`;
  },

  /**
   * POST /learning-materials/register/{learningMaterialId}
   * Đăng ký học liệu cho học sinh.
   * Tạo permission với tiêu đề học liệu và cấp quyền cho học sinh.
   */
  registerMaterial(
    learningMaterialId: string,
  ): Promise<AxiosResponse<unknown>> {
    return axiosInstance.post(
      `/learning-materials/register/${learningMaterialId}`,
    );
  },
};

export default MaterialService;
