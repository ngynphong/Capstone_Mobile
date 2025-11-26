import { useState, useCallback } from "react";
import StudentService from "../services/studentService";
import { useAppToast } from '../utils/toast';

export const useStudentConnection = () => {
    const [connectionCode, setConnectionCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useAppToast();
    const fetchConnectionCode = useCallback(async () => {
        setLoading(true);
        try {
            const res = await StudentService.getConnectionCode();
            if (res.data.code === 0 || res.data.code === 1000) {
                setConnectionCode(res.data.data);
            } else {
                toast.error(res.data.message || "Không thể lấy mã kết nối.");
            }
        } catch (error) {
            console.error("Error fetching connection code:", error);
            toast.error("Có lỗi xảy ra khi lấy mã kết nối.");
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        connectionCode,
        loading,
        fetchConnectionCode,
    };
};