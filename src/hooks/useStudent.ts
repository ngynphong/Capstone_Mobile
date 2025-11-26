import { useState } from "react";
import StudentService from "../services/studentService";
import type { UpdateStudentProfileRequest } from "../types/userTypes";
import { useAppToast } from "../utils/toast";

export const useStudent = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useAppToast();
    
    const updateStudentProfile = async (data: UpdateStudentProfileRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await StudentService.updateStudentProfile(data);
            toast.success("Cập nhật thông tin thành công!");
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Cập nhật thông tin thất bại";
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        updateStudentProfile,
    };
};
