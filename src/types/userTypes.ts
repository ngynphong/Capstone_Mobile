// User Profile Management Types

// Response from GET /users/me
export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    dob: string; // Date of birth in format "2025-10-17"
    roles: string[];
    avatar?: string; // Optional avatar URL
    imgUrl?: string; // Alternative avatar URL field
    tokenBalance?: number; // Current token balance for store functionality
    currentSubscription?: {
        id: string;
        name: string;
        type: 'free' | 'premium';
        expiresAt?: string;
    };
}

// Request for PUT /users/me
export interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
    dob: string;
}

// Response from PUT /users/me
export interface UpdateProfileResponse {
    code: number;
    message: string;
    data: UserProfile;
}

// Request for POST /auth/change-password
export interface ChangePasswordRequest {
    token: string;
    currentPassword: string;
    newPassword: string;
}

// Response from POST /auth/change-password
export interface ChangePasswordResponse {
    code: number;
    message: string;
    data: Record<string, never>; // Empty object based on API docs
}
