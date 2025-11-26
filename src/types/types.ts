import { ExamStackParamList, MockAttempt } from './examTypes';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  VerifyOTP: { email: string };
  ExamStack: undefined;
  MainTabs: undefined;
  ChatBot: undefined;
};

export type TabParamList = {
  Home: undefined;
  Materials: undefined;
  Profile: undefined;
  Exams: undefined;
  Community: undefined;
  Roadmap: undefined;
};

export type ParentTabParamList = {
  Dashboard: undefined;
  Children: undefined;
  Reports: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ExamResults: undefined;
  ExamResultDetail: { attempt: MockAttempt };
  Store: undefined;
};


export type { ExamStackParamList };
