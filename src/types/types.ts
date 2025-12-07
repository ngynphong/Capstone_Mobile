import { ExamStackParamList, MockAttempt } from './examTypes';
import type { Material } from './material';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  VerifyOTP: { email: string };
  ExamStack: undefined;
  MainTabs: undefined;
  ChatBot: undefined;
  Onboarding: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  TeacherDetail: { teacherId: string };
};

export type TabParamList = {
  Home: undefined;
  Materials: undefined;
  Profile: undefined;
  Exams: undefined;
  Community: undefined;
  Roadmap: undefined;
};

export type MaterialStackParamList = {
  MaterialMain: undefined;
  MaterialDetail: { material: Material };
};

export type ParentTabParamList = {
  Dashboard: undefined;
  Children: undefined;
  Reports: undefined;
  ExamStats: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ExamResults: undefined;
  ExamResultDetail: { attempt: MockAttempt };
  Store: undefined;
  StudentExamStats: undefined;
};


export type { ExamStackParamList };
