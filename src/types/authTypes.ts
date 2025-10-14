
// Auth API Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    code: string;
    message: string;
    data: {
        token: string;
        refreshToken: string; 
        authenticated: boolean;
        roles: string[];
    };
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dob: string; 
}

export interface RegisterResponse {
    code: string;
    message: string;
    data: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        dob: string;
        roles: string[];
    };
}

export interface VerifyEmailRequest {
    email: string;
    token: string;
}

export interface VerifyEmailResponse {
    code: string;
    message: string;
    data: {};
}

export interface RefreshTokenRequest {
    token: string;
}

export interface RefreshTokenResponse {
    code: string;
    message: string;
    data: {
        token: string;
        refreshToken: string;
        authenticated: boolean;
        roles: string[];
    };
}
