import { useEffect, useState, useCallback } from "react";
import DashboardService from "../services/dashboardService";
import type { StudentFinancialStats } from "../types/dashboard";
import { useAppToast } from "../utils/toast";

export const useStudentFinancialStats = () => {
    const [stats, setStats] = useState<StudentFinancialStats | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useAppToast();
    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await DashboardService.getStudentFinancialStats();
            if (res.code === 1000) {
                setStats(res.data);
            } else {
                toast.error(res.message || "Failed to fetch student financial statistics");
            }
        } catch (error) {
            const err = error as unknown as { message?: string; response?: { status?: number; data?: unknown } };
            console.error("Failed to fetch student financial stats:", err);
            toast.error(
                `Failed to load student financial stats${err.response?.status ? ` (HTTP ${err.response.status})` : ""}`
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
        totalSpent: stats?.totalSpent ?? 0,
        totalRegisteredMaterials: stats?.totalRegisteredMaterials ?? 0,
        currentBalance: stats?.currentBalance ?? 0,
        spendingBySubject: stats?.spendingBySubject ?? {},
        spendingByType: stats?.spendingByType ?? {},
        monthlySpending: stats?.monthlySpending ?? {},
        recentPurchases: stats?.recentPurchases ?? [],
        loading,
        fetchStats,
    };
};
