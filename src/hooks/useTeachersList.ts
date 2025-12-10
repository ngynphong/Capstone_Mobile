import { useEffect, useState, useCallback } from "react";
import { getTeachers } from "../services/userService";
import type { TeacherListItem, TeacherListQueryParams, TeacherListPaginationData } from "../types/userTypes";

export const useTeachersList = (initialParams?: TeacherListQueryParams) => {
    const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
    const [pagination, setPagination] = useState<Omit<TeacherListPaginationData, 'items'> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [params, setParams] = useState<TeacherListQueryParams>(initialParams || {
        pageNo: 0,
        pageSize: 10,
    });

    const fetchTeachers = useCallback(async (queryParams?: TeacherListQueryParams) => {
        setLoading(true);
        setError(null);
        try {
            const finalParams = queryParams || params;
            const res = await getTeachers(finalParams);

            if (res.code === 0 || res.code === 1000) {
                setTeachers(res.data.items);
                setPagination({
                    pageNo: res.data.pageNo,
                    pageSize: res.data.pageSize,
                    totalPage: res.data.totalPage,
                    totalElement: res.data.totalElement,
                    sortBy: res.data.sortBy,
                });
            } else {
                throw new Error(res.message || "Failed to fetch teachers");
            }
        } catch (err) {
            const e = err as Error;
            setError(e.message || "Failed to fetch teachers");
            console.error("Failed to fetch teachers:", err);
        } finally {
            setLoading(false);
        }
    }, [params]);

    const changePage = useCallback((pageNo: number) => {
        const newParams = { ...params, pageNo };
        setParams(newParams);
        fetchTeachers(newParams);
    }, [params, fetchTeachers]);

    const changePageSize = useCallback((pageSize: number) => {
        const newParams = { ...params, pageSize, pageNo: 0 };
        setParams(newParams);
        fetchTeachers(newParams);
    }, [params, fetchTeachers]);

    const updateParams = useCallback((newParams: Partial<TeacherListQueryParams>) => {
        const updatedParams = { ...params, ...newParams };
        setParams(updatedParams);
        fetchTeachers(updatedParams);
    }, [params, fetchTeachers]);

    useEffect(() => {
        fetchTeachers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        teachers,
        pagination,
        loading,
        error,
        params,
        fetchTeachers,
        changePage,
        changePageSize,
        updateParams,
    };
};
