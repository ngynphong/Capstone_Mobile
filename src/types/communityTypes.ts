// Community & Forum Types

export interface ForumCategory {
  id: string;
  name: string;
  postCount: number;
  color: string;
  icon?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  subject: string;
  timeAgo: string;
  likes: number;
  comments: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  timeAgo: string;
  likes: number;
  avatar?: string;
  createdAt: string;
}

export interface StudyGroupMember {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member';
  joinDate: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  maxMembers: number;
  currentMembers: number;
  meetingSchedule: string;
  createdBy: string;
  createdAt: string;
  members: StudyGroupMember[];
  isActive: boolean;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  subject: string;
  categoryId?: string;
}

export interface CreateStudyGroupRequest {
  name: string;
  subject: string;
  description: string;
  maxMembers: number;
  meetingSchedule: string;
}

export interface CommunityStats {
  totalPosts: number;
  totalStudyGroups: number;
  activeUsers: number;
  postsThisWeek: number;
}

// Navigation types for Community Stack
export type CommunityStackParamList = {
  CommunityMain: undefined;
  CategoryPosts: { categoryId: string; categoryName: string };
  PostDetail: { postId: string };
  StudyGroupDetail: { groupId: string };
  Members: { groupId: string; members: StudyGroupMember[] };
  CreatePost: undefined;
  CreateStudyGroup: undefined;
};

// API Response types
export interface CommunityResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PostsResponse {
  posts: Post[];
  totalCount: number;
  hasMore: boolean;
}

export interface StudyGroupsResponse {
  groups: StudyGroup[];
  totalCount: number;
  hasMore: boolean;
}

export interface CommentsResponse {
  comments: Comment[];
  totalCount: number;
  hasMore: boolean;
}
