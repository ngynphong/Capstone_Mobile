import { ExamStackParamList } from './examTypes';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  VerifyOTP: { email: string };
  ExamStack: undefined;
};

export type TabParamList = {
  Home: undefined;
  Subjects: undefined;
  Profile: undefined;
  Exams: undefined;
};

export type { ExamStackParamList };
