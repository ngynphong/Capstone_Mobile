import { useEffect, useState, useCallback } from "react";
import DashboardService from "../services/dashboardService";
import type { StudentExamStats } from "../types/dashboard";
import { useAppToast } from "../utils/toast";

export const useParentDashboardStats = (childrenId: string | null) => {
    const [stats, setStats] = useState<StudentExamStats | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useAppToast();

    const fetchStats = useCallback(async () => {
        if (!childrenId) return;

        setLoading(true);
        try {
            const res = await DashboardService.getParentExamStats(childrenId);
            if (res.code === 1000) {
                setStats(res.data);
            } else {
                toast.error(res.message || "Failed to fetch parent exam statistics");
            }
        } catch (error) {
            const err = error as unknown as { message?: string; response?: { status?: number; data?: unknown } };
            console.error("Failed to fetch parent exam stats:", err);
            toast.error(
                `Failed to load parent exam stats${err.response?.status ? ` (HTTP ${err.response.status})` : ""}`
            );
        } finally {
            setLoading(false);
        }
    }, [childrenId]);

    useEffect(() => {
        if (childrenId) {
            fetchStats();
        } else {
            setStats(null);
        }
    }, [fetchStats, childrenId]);

    return {
        stats,
        loading,
        fetchStats,
    };
};
