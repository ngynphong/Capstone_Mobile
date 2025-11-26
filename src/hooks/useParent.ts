import { useState, useCallback } from "react";
import ParentService from "../services/parentService";
import type { ChildInfo, ChildExamHistoryItem } from "../types/parent";
import { useAppToast } from '../utils/toast';
import type { PageInfo } from "../types/apiTypes";

export const useParent = () => {
    const [children, setChildren] = useState<ChildInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [examHistory, setExamHistory] = useState<ChildExamHistoryItem[]>([]);
    const [historyPageInfo, setHistoryPageInfo] = useState<PageInfo<ChildExamHistoryItem> | null>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const toast = useAppToast();
    // Lấy danh sách con cái
    const fetchChildren = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ParentService.getChildren();
            if (res.data.code === 0 || res.data.code === 1000) {
                setChildren(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch children:", error);
            toast.error("Không thể tải danh sách học sinh đã liên kết.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Liên kết học sinh
    const linkStudent = useCallback(async (email: string, code: string) => {
        setLoading(true);
        try {
            const res = await ParentService.linkStudent({ studentEmail: email, connectionCode: code });
            if (res.data.code === 0 || res.data.code === 1000) {
                toast.success("Liên kết tài khoản thành công!");
                await fetchChildren(); // Refresh list
                return true;
            } else {
                toast.error(res.data.message || "Liên kết thất bại.");
                return false;
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi liên kết.");
            console.error("Failed to link student:", error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchChildren]);

    // Hủy liên kết học sinh
    const unlinkStudent = useCallback(async (email: string) => {
        try {
            const res = await ParentService.unlinkStudent({ studentEmail: email });
            if (res.data.code === 0 || res.data.code === 1000) {
                toast.success("Đã hủy liên kết thành công.");
                setChildren(prev => prev.filter(c => c.email !== email));
                return true;
            }
            return false;
        } catch (error) {
            toast.error("Hủy liên kết thất bại.");
            console.error("Failed to unlink student:", error);
            return false;
        }
    }, []);

    // Lấy lịch sử thi của con
    const fetchChildExamHistory = useCallback(async (studentId: string, pageNo = 0, pageSize = 10) => {
        setLoadingHistory(true);
        try {
            const res = await ParentService.getChildExamHistory(studentId, { pageNo, pageSize });
            if (res.data.code === 0 || res.data.code === 1000) {
                const data = res.data.data;
                setExamHistory(data.items || []);
                setHistoryPageInfo(data);
               
                console.log("Fetched exam history:", examHistory);
            }

        } catch (error) {
            console.error("Failed to fetch exam history:", error);
            toast.error("Không thể tải lịch sử thi.");
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    return {
        children,
        loading,
        fetchChildren,
        linkStudent,
        unlinkStudent,

        // History related
        examHistory,
        historyPageInfo,
        loadingHistory,
        fetchChildExamHistory,
    };
};