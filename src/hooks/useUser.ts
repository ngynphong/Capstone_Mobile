import { useEffect, useState } from "react";
import type { UserProfile } from "../types/userTypes";
import { getUserProfileById, getUsers } from "../services/userService";
import { useAppToast } from "../utils/toast";

export const useUsers = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const toast = useAppToast();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getUsers({ pageNo, pageSize, search });
            const page = res.data;
            setUsers(page?.items ?? []);
            setTotal(page?.totalElement ?? 0);
        } catch (error) {
            const err = error as unknown as { message?: string; response?: { status?: number; data?: unknown } };
            console.error("Failed to fetch users:", err);
            toast.error(
                `Không tải được danh sách người dùng${err.response?.status ? ` (HTTP ${err.response.status})` : ""}`
            );
        } finally {
            setLoading(false);
        }
    };

    

    useEffect(() => {
        fetchUsers();
    }, [pageNo, search]);

    return {
        users,
        loading,
        total,
        pageNo,
        search,
        setPageNo,
        setSearch,
        fetchUsers,
    };
};
