/**
 * User Management Hook
 */
import { useCallback, useState } from 'react';
import usersApi, { type GetUsersParams } from '@/api/users.api';
import type {
    AdminUser,
    PaginatedUsers,
} from '@/types/user.types';
export function useUsers(initialData?: PaginatedUsers) {
    const [users, setUsers] = useState<AdminUser[]>(initialData?.data ?? []);
    const [meta, setMeta] = useState(
        initialData?.meta ?? {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 0,
        },
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchUsers = useCallback(async (params: GetUsersParams = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await usersApi.getUsers(params);
            setUsers(response.data);
            setMeta(response.meta);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, []);
    const suspendUser = useCallback(
        async (userId: string, reason: string): Promise<boolean> => {
            setLoading(true);
            try {
                const response = await usersApi.suspendUser(userId, reason);
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? response.data : u)),
                );
                return true;
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : 'Failed to suspend user',
                );
                return false;
            } finally {
                setLoading(false);
            }
        },
        [],
    );
    const unsuspendUser = useCallback(
        async (userId: string): Promise<boolean> => {
            setLoading(true);
            try {
                const response = await usersApi.unsuspendUser(userId);
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? response.data : u)),
                );
                return true;
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : 'Failed to unsuspend user',
                );
                return false;
            } finally {
                setLoading(false);
            }
        },
        [],
    );
    const updateUserRole = useCallback(
        async (userId: string, role: string): Promise<boolean> => {
            setLoading(true);
            try {
                const response = await usersApi.updateUserRole(userId, role);
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? response.data : u)),
                );
                return true;
            } catch (e) {
                setError(
                    e instanceof Error
                        ? e.message
                        : 'Failed to update user role',
                );
                return false;
            } finally {
                setLoading(false);
            }
        },
        [],
    );
    const impersonateUser = useCallback((userId: string) => {
        usersApi.impersonateUser(userId);
    }, []);
    return {
        users,
        meta,
        loading,
        error,
        fetchUsers,
        suspendUser,
        unsuspendUser,
        updateUserRole,
        impersonateUser,
        setError,
    };
}

