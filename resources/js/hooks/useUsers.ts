/**
 * User Management Hook
 */
import { useCallback, useEffect, useState } from 'react';
import usersApi, { type GetUsersParams } from '@/api/users.api';
import { getHttpErrorMessage } from '@/lib/http-errors';
import type {
    AdminUser,
    PaginatedUsers,
} from '@/types/user.types';

const DEFAULT_META: PaginatedUsers['meta'] = {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
};

export function useUsers(initialData?: PaginatedUsers) {
    const [users, setUsers] = useState<AdminUser[]>(initialData?.data ?? []);
    const [meta, setMeta] = useState<PaginatedUsers['meta']>(
        initialData?.meta ?? DEFAULT_META,
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!initialData) {
            return;
        }

        setUsers(initialData.data);
        setMeta(initialData.meta);
    }, [initialData]);

    const fetchUsers = useCallback(async (params: GetUsersParams = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await usersApi.getUsers(params);
            setUsers(response.data);
            setMeta(response.meta);
        } catch (e) {
            setError(getHttpErrorMessage(e, 'Failed to fetch users'));
        } finally {
            setLoading(false);
        }
    }, []);

    const suspendUser = useCallback(
        async (userId: string, reason: string): Promise<boolean> => {
            setLoading(true);
            setError(null);

            try {
                const response = await usersApi.suspendUser(userId, reason);
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? response.data : u)),
                );

                return true;
            } catch (e) {
                setError(getHttpErrorMessage(e, 'Failed to suspend user'));

                return false;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const approveTeacher = useCallback(
        async (userId: string): Promise<boolean> => {
            setLoading(true);
            setError(null);

            try {
                const response = await usersApi.approveTeacher(userId);
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? response.data : u)),
                );

                return true;
            } catch (e) {
                setError(
                    getHttpErrorMessage(e, 'Failed to approve teacher account'),
                );

                return false;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const revokeTeacherApproval = useCallback(
        async (userId: string): Promise<boolean> => {
            setLoading(true);
            setError(null);

            try {
                const response =
                    await usersApi.revokeTeacherApproval(userId);
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? response.data : u)),
                );

                return true;
            } catch (e) {
                setError(
                    getHttpErrorMessage(e, 'Failed to revoke teacher approval'),
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
            setError(null);

            try {
                const response = await usersApi.unsuspendUser(userId);
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? response.data : u)),
                );

                return true;
            } catch (e) {
                setError(getHttpErrorMessage(e, 'Failed to unsuspend user'));

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
            setError(null);

            try {
                const response = await usersApi.updateUserRole(userId, role);
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? response.data : u)),
                );

                return true;
            } catch (e) {
                setError(getHttpErrorMessage(e, 'Failed to update user role'));

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

    const gdprDeleteUser = useCallback(
        async (userId: string): Promise<boolean> => {
            setLoading(true);
            setError(null);

            try {
                await usersApi.gdprDeleteUser(userId);
                setUsers((prev) => prev.filter((user) => user.id !== userId));

                return true;
            } catch (e) {
                setError(getHttpErrorMessage(e, 'Failed to delete user data'));

                return false;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return {
        users,
        meta,
        loading,
        error,
        fetchUsers,
        suspendUser,
        unsuspendUser,
        approveTeacher,
        revokeTeacherApproval,
        updateUserRole,
        impersonateUser,
        gdprDeleteUser,
        setError,
    };
}

