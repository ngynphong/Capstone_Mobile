import axiosInstance from "../configs/axios";
import { ParentExamStatsResponse, StudentExamStatsResponse } from "../types/dashboard";

const DashboardService = {

    // GET /student/dashboard/exam-stats
    async getStudentExamStats(): Promise<StudentExamStatsResponse> {
        const response = await axiosInstance.get<StudentExamStatsResponse>("/student/dashboard/exam-stats");
        return response.data;
    },

    // GET /parent/dashboard/exam-stats/{childrenId}
    async getParentExamStats(childrenId: string): Promise<ParentExamStatsResponse> {
        const response = await axiosInstance.get<ParentExamStatsResponse>(`/parent/dashboard/exam-stats/${childrenId}`);
        return response.data;
    },

};

export default DashboardService;
