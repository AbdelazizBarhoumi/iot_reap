/**
 * User Management API
 */
import axios from 'axios';
import type {
    AdminUser,
    PaginatedUsers,
    UserFilters,
} from '@/types/user.types';
const client = axios.create({
    baseURL: '/admin/users',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});
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
        const { data } = await client.get('/', { params });
        return data;
    },
    /**
     * Get user details.
     */
    async getUser(userId: string): Promise<{ data: AdminUser }> {
        const { data } = await client.get(`/${userId}`);
        return data;
    },
    /**
     * Approve a teacher account.
     */
    async approveTeacher(
        userId: string,
    ): Promise<{ data: AdminUser; message: string }> {
        const { data } = await client.post(`/${userId}/approve-teacher`);
        return data;
    },
    /**
     * Revoke teacher approval.
     */
    async revokeTeacherApproval(
        userId: string,
    ): Promise<{ data: AdminUser; message: string }> {
        const { data } = await client.post(
            `/${userId}/revoke-teacher-approval`,
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
        const { data } = await client.post(`/${userId}/suspend`, { reason });
        return data;
    },
    /**
     * Unsuspend a user.
     */
    async unsuspendUser(
        userId: string,
    ): Promise<{ data: AdminUser; message: string }> {
        const { data } = await client.post(`/${userId}/unsuspend`);
        return data;
    },
    /**
     * Update user role.
     */
    async updateUserRole(
        userId: string,
        role: string,
    ): Promise<{ data: AdminUser; message: string }> {
        const { data } = await client.patch(`/${userId}/role`, { role });
        return data;
    },
    /**
     * Impersonate a user.
     */
    async impersonateUser(userId: string): Promise<void> {
        // This is a redirect action, not a JSON response
        window.location.href = `/admin/users/${userId}/impersonate`;
    },
};
export default usersApi;

