import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';
import { forgotPasswordApi } from '../../services/authService';
import { useAppToast } from '../../utils/toast';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useAppToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async () => {
    // Validation
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setIsLoading(true);

    try {
      const response = await forgotPasswordApi({ email: email.trim() });

      // Kiểm tra cả response code và message để xác định thành công
      if (response.code === '1000' || response.message?.toLowerCase().includes('otp') || response.message?.toLowerCase().includes('sent')) {
        // Hiển thị toast thành công và chuyển sang màn hình VerifyOTP
        toast.success('OTP has been sent to your email address');
        setTimeout(() => {
          navigation.navigate('VerifyOTP', { email: email.trim() });
        }, 1500);
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      if (!text.trim()) {
        setEmailError('Email is required');
      } else if (!validateEmail(text)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-backgroundColor mb-2">Forgot Password</Text>
          <Text className="text-gray-500 text-center">
            Enter your email address and we'll send you an OTP to reset your password
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
            <TextInput
              className={`w-full h-12 border rounded-lg px-4 bg-white ${emailError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your email address"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {emailError && <Text className="text-red-500 text-sm mt-1">{emailError}</Text>}
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            className={`w-full h-12 rounded-lg items-center justify-center mb-4 ${isLoading ? 'bg-gray-400' : 'bg-backgroundColor'}`}
            onPress={handleSendOTP}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Send OTP</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            className="items-center"
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text className="text-brightColor font-semibold">Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
