import { useEffect, useState, useCallback } from "react";
import ExamTemplateService from "../services/examService";
import type { ExamRatingItem, ExamRatingsQueryParams, ExamRatingsPaginationData } from "../types/examTypes";

export const useExamTemplateRatings = (templateId: string, initialParams?: ExamRatingsQueryParams) => {
    const [ratings, setRatings] = useState<ExamRatingItem[]>([]);
    const [pagination, setPagination] = useState<Omit<ExamRatingsPaginationData, 'items'> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [params, setParams] = useState<ExamRatingsQueryParams>(initialParams || {
        pageNo: 0,
        pageSize: 10,
        sorts: ["ratingTime:desc"],
    });

    const fetchRatings = useCallback(async (queryParams?: ExamRatingsQueryParams) => {
        if (!templateId) {
            setError("Template ID is required");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const finalParams = queryParams || params;
            const res = await ExamTemplateService.getTemplateRatings(templateId, finalParams);

            if (res.data.code === 0 || res.data.code === 1000) {
                setRatings(res.data.data.items);
                setPagination({
                    pageNo: res.data.data.pageNo,
                    pageSize: res.data.data.pageSize,
                    totalPage: res.data.data.totalPage,
                    totalElement: res.data.data.totalElement,
                    sortBy: res.data.data.sortBy,
                });
            } else {
                throw new Error(res.data.message || "Failed to fetch ratings");
            }
        } catch (err) {
            const e = err as Error;
            setError(e.message || "Failed to fetch ratings");
            console.error("Failed to fetch ratings:", err);
        } finally {
            setLoading(false);
        }
    }, [templateId, params]);

    const changePage = useCallback((pageNo: number) => {
        const newParams = { ...params, pageNo };
        setParams(newParams);
        fetchRatings(newParams);
    }, [params, fetchRatings]);

    const changePageSize = useCallback((pageSize: number) => {
        const newParams = { ...params, pageSize, pageNo: 0 };
        setParams(newParams);
        fetchRatings(newParams);
    }, [params, fetchRatings]);

    const updateParams = useCallback((newParams: Partial<ExamRatingsQueryParams>) => {
        const updatedParams = { ...params, ...newParams };
        setParams(updatedParams);
        fetchRatings(updatedParams);
    }, [params, fetchRatings]);

    useEffect(() => {
        if (templateId) {
            fetchRatings();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateId]);

    return {
        ratings,
        pagination,
        loading,
        error,
        params,
        fetchRatings,
        changePage,
        changePageSize,
        updateParams,
    };
};
