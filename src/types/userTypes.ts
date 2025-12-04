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
    studentProfile?: StudentProfile;
    parentProfile?: ParentProfile;
    teacherProfile?: TeacherProfile;
}
export interface StudentProfile {
    id: string;
    schoolName: string;
    emergencyContact: string;
    parentPhone: string;
}
export interface ParentProfile {
    id: string;
    occupation: string;
}
export interface TeacherProfile {
    id: string;
    dateOfBirth: string;
    qualification: string;
    specialization: string;
    experience: string;
    biography: string;
    rating: number;
    certificateUrls: string[];
    isVerified: boolean;
}
// Request for PUT /users/me
export interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
    dob: string;
}

export interface UpdateStudentProfileRequest {
    schoolName: string;
    parentPhone: string;
    emergencyContact: string;
}

export interface UpdateStudentProfileResponse {
    code: number;
    message: string;
    data: StudentProfile;
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

export interface UserQueryParams {
    pageNo?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
export interface UserPaginationData {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    totalElement: number;
    sortBy: string[];
    items: UserProfile[];
}

export interface UserResponse {
    code: number;
    message: string;
    data: UserPaginationData;
}

