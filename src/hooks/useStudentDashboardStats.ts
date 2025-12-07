import { useEffect, useState, useCallback } from "react";
import DashboardService from "../services/dashboardService";
import type { StudentExamStats } from "../types/dashboard";
import { useAppToast } from "../utils/toast";

export const useStudentDashboardStats = () => {
    const [stats, setStats] = useState<StudentExamStats | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useAppToast();

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await DashboardService.getStudentExamStats();
            if (res.code === 1000) {
                setStats(res.data);
            } else {
                toast.error(res.message || "Failed to fetch student exam statistics");
            }
        } catch (error) {
            const err = error as unknown as { message?: string; response?: { status?: number; data?: unknown } };
            console.error("Failed to fetch student exam stats:", err);
            toast.error(
                `Failed to load student exam stats${err.response?.status ? ` (HTTP ${err.response.status})` : ""}`
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        fetchStats,
    };
};
