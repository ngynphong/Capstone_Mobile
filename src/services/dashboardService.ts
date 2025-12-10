import axiosInstance from "../configs/axios";
import { ParentExamStatsResponse, StudentExamStatsResponse, StudentFinancialStatsResponse } from "../types/dashboard";

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

    // GET /student/dashboard/financial-stats
    async getStudentFinancialStats(): Promise<StudentFinancialStatsResponse> {
        const response = await axiosInstance.get<StudentFinancialStatsResponse>("/student/dashboard/financial-stats");
        return response.data;
    },

};

export default DashboardService;
