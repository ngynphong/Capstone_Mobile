// src/services/teacherRatingService.ts
import axiosInstance from "../configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "../types/apiTypes";
import type {
    TeacherRating,
    TeacherRatingPayload,
} from "../types/teacherRating";

const TeacherRatingService = {
    // POST /api/teacher-ratings
    // Tạo đánh giá mới cho giáo viên
    createRating(
        payload: TeacherRatingPayload
    ): Promise<AxiosResponse<ApiResponse<TeacherRating>>> {
        return axiosInstance.post(`/api/teacher-ratings`, payload);
    },

    // GET /api/teacher-ratings/teacher/{teacherId}
    // Lấy tất cả đánh giá của một giáo viên
    getRatingsByTeacher(
        teacherId: string,
        page: number = 0,
        size: number = 10,
        sortBy: string = "createdAt",
        sortDir: string = "DESC"
    ): Promise<AxiosResponse<ApiResponse<any>>> {
        return axiosInstance.get(`/api/teacher-ratings/teacher/${teacherId}`, {
            params: {
                page,
                size,
                sortBy,
                sortDir,
            },
        });
    },

    // GET /api/teacher-ratings/teacher/{teacherId}/student/{studentId}
    // Lấy đánh giá của một học sinh cụ thể cho một giáo viên
    getRatingByTeacherAndStudent(
        teacherId: string,
        studentId: string
    ): Promise<AxiosResponse<ApiResponse<TeacherRating>>> {
        return axiosInstance.get(
            `/api/teacher-ratings/teacher/${teacherId}/student/${studentId}`
        );
    },

    // GET /api/teacher-ratings/student/{studentId}
    // Lấy danh sách đánh giá mà một học sinh đã đánh giá cho các giáo viên
    getRatingsByStudent(
        studentId: string
    ): Promise<AxiosResponse<ApiResponse<TeacherRating[]>>> {
        return axiosInstance.get(`/api/teacher-ratings/student/${studentId}`);
    },
};

export default TeacherRatingService;


