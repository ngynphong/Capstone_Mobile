import axiosInstance from "../configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "../types/apiTypes";
import { UpdateStudentProfileRequest, UpdateStudentProfileResponse } from "../types/userTypes";

const StudentService = {
    /**
     * Lấy mã kết nối để phụ huynh liên kết
     * GET /students/connection-code
     */
    getConnectionCode: (): Promise<AxiosResponse<ApiResponse<string>>> => {
        return axiosInstance.get("/students/connection-code");
    },

    updateStudentProfile: (data: UpdateStudentProfileRequest): Promise<AxiosResponse<UpdateStudentProfileResponse>> => {
        return axiosInstance.put("/students/me", data);
    },
};

export default StudentService;