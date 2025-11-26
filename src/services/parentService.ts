import axiosInstance from "../configs/axios";
import type { AxiosResponse } from "axios";
import type { PageInfo, ApiResponse } from "../types/apiTypes";
import type {
    ChildInfo,
    ChildExamHistoryItem,
    LinkStudentPayload,
    UnlinkStudentPayload
} from "../types/parent";

const ParentService = {
    /**
     * Lấy danh sách con cái đã liên kết
     * GET /parents/children
     */
    getChildren: (): Promise<AxiosResponse<ApiResponse<ChildInfo[]>>> => {
        return axiosInstance.get("/parents/children");
    },

    /**
     * Liên kết với học sinh bằng email và mã kết nối
     * POST /parents/link-student
     */
    linkStudent: (
        data: LinkStudentPayload
    ): Promise<AxiosResponse<ApiResponse<string>>> => {
        return axiosInstance.post("/parents/link-student", data);
    },

    /**
     * Hủy liên kết với học sinh
     * POST /parents/unlink-student
     */
    unlinkStudent: (
        data: UnlinkStudentPayload
    ): Promise<AxiosResponse<ApiResponse<string>>> => {
        return axiosInstance.post("/parents/unlink-student", data);
    },

    /**
     * Lấy lịch sử thi của con
     * GET /parents/children/{studentId}/exam-history
     */
    getChildExamHistory: (
        studentId: string,
        params?: { pageNo?: number; pageSize?: number; sorts?: string[] }
    ): Promise<AxiosResponse<ApiResponse<PageInfo<ChildExamHistoryItem>>>> => {
        return axiosInstance.get(`/parents/children/${studentId}/exam-history`, { params });
    },

    /**
     * Cập nhật thông tin parent profile
     * PUT /parents/me
     */
    updateParentProfile: (
        data: { occupation: string }
    ): Promise<AxiosResponse<ApiResponse<any>>> => {
        return axiosInstance.put("/parents/me", data);
    },
};

export default ParentService;