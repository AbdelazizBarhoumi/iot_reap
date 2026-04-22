/**
 * User Management API
 */
import client from '@/api/client';
import type {
    AdminUser,
    PaginatedUsers,
    UserFilters,
} from '@/types/user.types';

const USERS_BASE_PATH = '/admin/users';

export interface GetUsersParams extends Partial<UserFilters> {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
}
export const usersApi = {
    /**
     * Get paginated users list.
     */
    async getUsers(params: GetUsersParams = {}): Promise<PaginatedUsers> {
        const { data } = await client.get<PaginatedUsers>(USERS_BASE_PATH, {
            params,
        });
        return data;
    },
    /**
     * Get user details.
     */
    async getUser(userId: string): Promise<{ data: AdminUser }> {
        const { data } = await client.get<{ data: AdminUser }>(
            `${USERS_BASE_PATH}/${userId}`,
        );
        return data;
    },
    /**
     * Approve a teacher account.
     */
    async approveTeacher(
        userId: string,
    ): Promise<{ data: AdminUser; message: string }> {
        const { data } = await client.post<{ data: AdminUser; message: string }>(
            `${USERS_BASE_PATH}/${userId}/approve-teacher`,
        );
        return data;
    },
    /**
     * Revoke teacher approval.
     */
    async revokeTeacherApproval(
        userId: string,
    ): Promise<{ data: AdminUser; message: string }> {
        const { data } = await client.post<{ data: AdminUser; message: string }>(
            `${USERS_BASE_PATH}/${userId}/revoke-teacher-approval`,
        );
        return data;
    },
    /**
     * Suspend a user.
     */
    async suspendUser(
        userId: string,
        reason: string,
    ): Promise<{ data: AdminUser; message: string }> {
        const { data } = await client.post<{ data: AdminUser; message: string }>(
            `${USERS_BASE_PATH}/${userId}/suspend`,
            { reason },
        );
        return data;
    },
    /**
     * Unsuspend a user.
     */
    async unsuspendUser(
        userId: string,
    ): Promise<{ data: AdminUser; message: string }> {
        const { data } = await client.post<{ data: AdminUser; message: string }>(
            `${USERS_BASE_PATH}/${userId}/unsuspend`,
        );
        return data;
    },
    /**
     * Update user role.
     */
    async updateUserRole(
        userId: string,
        role: string,
    ): Promise<{ data: AdminUser; message: string }> {
        const { data } = await client.patch<{ data: AdminUser; message: string }>(
            `${USERS_BASE_PATH}/${userId}/role`,
            { role },
        );
        return data;
    },
    /**
     * Impersonate a user.
     */
    async impersonateUser(userId: string): Promise<void> {
        await client.post(`${USERS_BASE_PATH}/${userId}/impersonate`);
        window.location.assign('/dashboard');
    },
    /**
     * GDPR anonymize a user.
     */
    async gdprDeleteUser(userId: string): Promise<{ message: string }> {
        const { data } = await client.delete<{ message: string }>(
            `${USERS_BASE_PATH}/${userId}/gdpr`,
        );

        return data;
    },
};
export default usersApi;

