/**
 * Admin Users Page
 * Comprehensive user management interface for administrators.
 */
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    Ban,
    CheckCircle2,
    Clock,
    Eye,
    Filter,
    MoreVertical,
    RefreshCw,
    Search,
    Shield,
    UserCheck,
    UserCog,
    Users,
    UserX,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUsers } from '@/hooks/useUsers';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PageProps } from '@/types';
import type {
    AdminUser,
    PaginatedUsers,
    RoleOption,
    UserFilters,
    UserStats,
} from '@/types/user.types';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/infrastructure' },
    { title: 'User Management', href: '/admin/users' },
];
interface UsersPageProps extends PageProps {
    users: {
        data: AdminUser[];
        meta?: Partial<PaginatedUsers['meta']>;
    };
    filters: UserFilters;
    roles: RoleOption[];
    stats: UserStats;
}
const roleColors: Record<string, string> = {
    admin: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    teacher: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    engineer: 'bg-green-500/10 text-green-500 border-green-500/30',
};
export default function UsersPage() {
    const {
        users: initialUsers,
        filters,
        roles,
        stats,
    } = usePage<UsersPageProps>().props;

    const initialPaginatedUsers = useMemo<PaginatedUsers>(
        () => ({
            data: initialUsers.data,
            meta: {
                current_page: initialUsers.meta?.current_page ?? 1,
                last_page: initialUsers.meta?.last_page ?? 1,
                per_page: initialUsers.meta?.per_page ?? 15,
                total: initialUsers.meta?.total ?? initialUsers.data.length,
            },
        }),
        [initialUsers],
    );

    const {
        users,
        meta,
        loading,
        suspendUser,
        unsuspendUser,
        approveTeacher,
        revokeTeacherApproval,
        updateUserRole,
        impersonateUser,
        error,
        setError,
    } = useUsers(initialPaginatedUsers);

    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const refreshUsersList = useCallback(() => {
        router.reload({
            only: ['users', 'filters', 'stats'],
            preserveUrl: true,
        });
    }, []);

    // Modals
    const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
    const [suspendingUser, setSuspendingUser] = useState<AdminUser | null>(
        null,
    );
    const [suspendReason, setSuspendReason] = useState('');
    const [roleChangeUser, setRoleChangeUser] = useState<AdminUser | null>(
        null,
    );
    const [newRole, setNewRole] = useState('');
    const handleSearch = useCallback(() => {
        router.get(
            '/admin/users',
            {
                search: search.trim(),
                role: roleFilter,
                status: statusFilter,
                page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );
    }, [search, roleFilter, statusFilter]);

    const handleRoleFilterChange = (value: string) => {
        setRoleFilter(value === 'all' ? '' : value);
        router.get(
            '/admin/users',
            {
                search,
                role: value === 'all' ? '' : value,
                status: statusFilter,
                page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value === 'all' ? '' : value);
        router.get(
            '/admin/users',
            {
                search,
                role: roleFilter,
                status: value === 'all' ? '' : value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setRoleFilter('');
        setStatusFilter('');

        router.get(
            '/admin/users',
            {
                search: '',
                role: '',
                status: '',
                page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handlePageChange = useCallback(
        (page: number) => {
            if (loading || page < 1 || page > meta.last_page) {
                return;
            }

            router.get(
                '/admin/users',
                {
                    search: search.trim(),
                    role: roleFilter,
                    status: statusFilter,
                    page,
                },
                { preserveState: true, preserveScroll: true },
            );
        },
        [loading, meta.last_page, roleFilter, search, statusFilter],
    );

    const handleSuspend = async () => {
        if (!suspendingUser || !suspendReason) return;
        const success = await suspendUser(suspendingUser.id, suspendReason);
        if (success) {
            setSuspendingUser(null);
            setSuspendReason('');
            refreshUsersList();
        }
    };

    const handleUnsuspend = async (user: AdminUser) => {
        const success = await unsuspendUser(user.id);
        if (success) {
            refreshUsersList();
        }
    };

    const handleApproveTeacher = async (user: AdminUser) => {
        const success = await approveTeacher(user.id);
        if (success) {
            refreshUsersList();
        }
    };

    const handleRevokeTeacherApproval = async (user: AdminUser) => {
        const success = await revokeTeacherApproval(user.id);
        if (success) {
            refreshUsersList();
        }
    };

    const handleRoleChange = async () => {
        if (!roleChangeUser || !newRole) return;
        const success = await updateUserRole(roleChangeUser.id, newRole);
        if (success) {
            setRoleChangeUser(null);
            setNewRole('');
            refreshUsersList();
        }
    };
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const UserRow = ({ user }: { user: AdminUser }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
        >
            <Card className="shadow-card transition-all duration-200 hover:shadow-card-hover">
                <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground sm:flex">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        {/* User Info */}
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate font-medium text-foreground">
                                    {user.name}
                                </h3>
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${roleColors[user.role] || ''}`}
                                >
                                    {user.role_label}
                                </Badge>
                                {user.is_suspended && (
                                    <Badge
                                        variant="destructive"
                                        className="text-xs"
                                    >
                                        <Ban className="mr-1 h-3 w-3" />{' '}
                                        Suspended
                                    </Badge>
                                )}
                                {user.requires_teacher_approval &&
                                    !user.is_teacher_approved && (
                                        <Badge
                                            variant="outline"
                                            className="border-amber-500/40 bg-amber-500/10 text-xs text-amber-500"
                                        >
                                            Pending teacher approval
                                        </Badge>
                                    )}
                                {user.two_factor_enabled && (
                                    <Badge
                                        variant="outline"
                                        className="border-success/30 bg-success/10 text-xs text-success"
                                    >
                                        <Shield className="mr-1 h-3 w-3" /> 2FA
                                    </Badge>
                                )}
                            </div>
                            <p className="truncate text-sm text-muted-foreground">
                                {user.email}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Joined {formatDate(user.created_at)}
                                </span>
                                {user.last_login_at && (
                                    <span className="flex items-center gap-1">
                                        <UserCheck className="h-3 w-3" />
                                        Last login{' '}
                                        {formatDate(user.last_login_at)}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDetailUser(user)}
                            >
                                <Eye className="mr-1 h-3.5 w-3.5" /> View
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        aria-label="User actions"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setRoleChangeUser(user);
                                            setNewRole(user.role);
                                        }}
                                    >
                                        <UserCog className="mr-2 h-4 w-4" />
                                        Change Role
                                    </DropdownMenuItem>
                                    {user.requires_teacher_approval &&
                                        !user.is_teacher_approved && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleApproveTeacher(user)
                                                }
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Approve Teacher
                                            </DropdownMenuItem>
                                        )}
                                    {user.requires_teacher_approval &&
                                        user.is_teacher_approved && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleRevokeTeacherApproval(
                                                        user,
                                                    )
                                                }
                                            >
                                                <UserX className="mr-2 h-4 w-4" />
                                                Revoke Teacher Approval
                                            </DropdownMenuItem>
                                        )}
                                    {!user.is_suspended &&
                                        user.role !== 'admin' && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setSuspendingUser(user)
                                                }
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <UserX className="mr-2 h-4 w-4" />
                                                Suspend User
                                            </DropdownMenuItem>
                                        )}
                                    {user.is_suspended && (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleUnsuspend(user)
                                            }
                                        >
                                            <UserCheck className="mr-2 h-4 w-4" />
                                            Unsuspend User
                                        </DropdownMenuItem>
                                    )}
                                    {user.role !== 'admin' &&
                                        !user.is_suspended && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        impersonateUser(user.id)
                                                    }
                                                >
                                                    <Users className="mr-2 h-4 w-4" />
                                                    Impersonate
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="min-h-screen bg-background">
                <div className="container py-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="font-heading text-3xl font-bold text-foreground">
                                    User Management
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage platform users, roles, and permissions
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={refreshUsersList}
                            disabled={loading}
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </Button>
                    </div>
                    {/* Stats Cards */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="shadow-card">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Users
                                    </p>
                                    <p className="font-heading text-2xl font-bold text-foreground">
                                        {stats.total}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-card">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                                    <UserCog className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Engineers
                                    </p>
                                    <p className="font-heading text-2xl font-bold text-foreground">
                                        {stats.by_role?.engineer || 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-card">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Teachers
                                    </p>
                                    <p className="font-heading text-2xl font-bold text-foreground">
                                        {stats.by_role?.teacher || 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-card">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Admins
                                    </p>
                                    <p className="font-heading text-2xl font-bold text-foreground">
                                        {stats.by_role?.admin || 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Filters */}
                    <Card className="mb-6 shadow-card">
                        <CardContent className="py-4">
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && handleSearch()
                                        }
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={roleFilter || 'all'}
                                    onValueChange={handleRoleFilterChange}
                                >
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Roles
                                        </SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem
                                                key={role.value}
                                                value={role.value}
                                            >
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={statusFilter || 'all'}
                                    onValueChange={handleStatusFilterChange}
                                >
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="suspended">
                                            Suspended
                                        </SelectItem>
                                        <SelectItem value="pending_teacher_approval">
                                            Pending Teacher Approval
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    onClick={handleSearch}
                                >
                                    <Filter className="mr-2 h-4 w-4" /> Apply
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={handleResetFilters}
                                >
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <p className="text-sm text-destructive">{error}</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setError(null)}
                                className="ml-auto"
                            >
                                Dismiss
                            </Button>
                        </div>
                    )}
                    {/* Users List */}
                    <div className="mb-3 text-sm text-muted-foreground">
                        Showing {users.length} users on this page • Total{' '}
                        {meta.total} • Page {meta.current_page} of{' '}
                        {meta.last_page}
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : users.length === 0 ? (
                            <Card className="shadow-card">
                                <CardContent className="py-12 text-center">
                                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                                        No users found
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Try adjusting your search or filter
                                        criteria
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            users.map((user) => (
                                <UserRow key={user.id} user={user} />
                            ))
                        )}
                    </div>

                    {meta.last_page > 1 && (
                        <div className="mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                            <p className="text-sm text-muted-foreground">
                                Page {meta.current_page} of {meta.last_page}
                            </p>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={loading || meta.current_page <= 1}
                                    onClick={() =>
                                        handlePageChange(meta.current_page - 1)
                                    }
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        loading ||
                                        meta.current_page >= meta.last_page
                                    }
                                    onClick={() =>
                                        handlePageChange(meta.current_page + 1)
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* User Detail Modal */}
            <Dialog
                open={!!detailUser}
                onOpenChange={() => setDetailUser(null)}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            View detailed information about this user
                        </DialogDescription>
                    </DialogHeader>
                    {detailUser && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
                                    {detailUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {detailUser.name}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {detailUser.email}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">
                                        Role
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className={roleColors[detailUser.role]}
                                    >
                                        {detailUser.role_label}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Status
                                    </p>
                                    {detailUser.is_suspended ? (
                                        <Badge variant="destructive">
                                            Suspended
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="border-success/30 bg-success/10 text-success"
                                        >
                                            Active
                                        </Badge>
                                    )}
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Email Verified
                                    </p>
                                    <p className="font-medium">
                                        {detailUser.email_verified_at
                                            ? formatDate(
                                                  detailUser.email_verified_at,
                                              )
                                            : 'Not verified'}
                                    </p>
                                </div>
                                {detailUser.requires_teacher_approval && (
                                    <div>
                                        <p className="text-muted-foreground">
                                            Teacher Approval
                                        </p>
                                        <p className="font-medium">
                                            {detailUser.is_teacher_approved
                                                ? detailUser.teacher_approved_at
                                                    ? formatDate(
                                                          detailUser.teacher_approved_at,
                                                      )
                                                    : 'Approved'
                                                : 'Pending approval'}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-muted-foreground">
                                        2FA Enabled
                                    </p>
                                    <p className="font-medium">
                                        {detailUser.two_factor_enabled ? (
                                            <span className="flex items-center gap-1 text-success">
                                                <CheckCircle2 className="h-4 w-4" />{' '}
                                                Yes
                                            </span>
                                        ) : (
                                            'No'
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Joined
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(detailUser.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Last Login
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(detailUser.last_login_at)}
                                    </p>
                                </div>
                            </div>
                            {detailUser.is_suspended &&
                                detailUser.suspended_reason && (
                                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                                        <p className="mb-1 text-xs font-medium text-destructive">
                                            Suspension Reason
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {detailUser.suspended_reason}
                                        </p>
                                    </div>
                                )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDetailUser(null)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Suspend Modal */}
            <Dialog
                open={!!suspendingUser}
                onOpenChange={(open) => {
                    if (!open) {
                        setSuspendingUser(null);
                        setSuspendReason('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Suspend User</DialogTitle>
                        <DialogDescription>
                            This will prevent {suspendingUser?.name} from
                            accessing the platform.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground">
                                Reason for suspension
                            </label>
                            <Textarea
                                value={suspendReason}
                                onChange={(e) =>
                                    setSuspendReason(e.target.value)
                                }
                                placeholder="Provide a reason for suspending this user..."
                                className="mt-1.5"
                                rows={3}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Minimum 10 characters required
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSuspendingUser(null);
                                setSuspendReason('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleSuspend}
                            disabled={suspendReason.length < 10 || loading}
                        >
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Role Change Modal */}
            <Dialog
                open={!!roleChangeUser}
                onOpenChange={(open) => {
                    if (!open) {
                        setRoleChangeUser(null);
                        setNewRole('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Update the role for {roleChangeUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground">
                                New Role
                            </label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem
                                            key={role.value}
                                            value={role.value}
                                        >
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRoleChangeUser(null);
                                setNewRole('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRoleChange}
                            disabled={
                                !newRole ||
                                newRole === roleChangeUser?.role ||
                                loading
                            }
                        >
                            <UserCog className="mr-2 h-4 w-4" />
                            Update Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

