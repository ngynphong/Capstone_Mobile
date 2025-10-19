import { ExamStackParamList, ExamAttempt } from './examTypes';

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
  Materials: undefined;
  Profile: undefined;
  Exams: undefined;
  Community: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ExamResults: undefined;
  ExamResultDetail: { attempt: ExamAttempt };
};


export type { ExamStackParamList };
