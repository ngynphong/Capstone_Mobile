
// Exam Stats Types


export interface RecentAttempt {
    attemptId: string;
    title: string;
    examId: string;
    doneBy: string;
    score: number;
    startTime: string; // ISO Date string
    endTime: string;   // ISO Date string
    status: string;
    rating: number;
}

export interface StudentExamStats {
    totalExamsTaken: number;
    averageScore: number;
    examsInProgress: number;
    topicPerformance: Record<string, number>;
    recommendedTopic: string;
    recentAttempts: RecentAttempt[];
}

export interface StudentExamStatsResponse {
    code: number;
    message: string;
    data: StudentExamStats;
}

// Parent uses the same structure as Student for their children
export type ParentExamStatsResponse = StudentExamStatsResponse;

export interface RecentPurchase {
    materialId: string;
    title: string;
    subjectName: string;
    typeName: string;
    price: number;
    purchasedDate: string; // ISO Date string (YYYY-MM-DD)
    authorName: string;
    fileImage: string;
}

export interface StudentFinancialStats {
    totalSpent: number;
    totalRegisteredMaterials: number;
    currentBalance: number;
    spendingBySubject: Record<string, number>;
    spendingByType: Record<string, number>;
    monthlySpending: Record<string, number>;
    recentPurchases: RecentPurchase[];
}

export interface StudentFinancialStatsResponse {
    code: number;
    message: string;
    data: StudentFinancialStats;
}