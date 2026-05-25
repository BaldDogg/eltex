export interface User {
    username: string;
    email?: string;
    isAdmin?: boolean;
    role?: string;
    id?: string | number;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}