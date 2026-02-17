export type User = {
    id: string;
    name: string;
    email: string;
    role: 'engineer' | 'admin' | 'security_officer';
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
};

export type Auth = {
    user: User;
};

export type LoginCredentials = {
    email: string;
    password: string;
};

export type RegisterData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: 'engineer' | 'admin' | 'security_officer';
};

export type AuthResponse = {
    data: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
