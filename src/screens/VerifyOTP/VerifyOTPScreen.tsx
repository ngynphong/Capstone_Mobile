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
import { verifyOTPApi } from '../../services/authService';
import { useAppToast } from '../../utils/toast';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyOTP'>;

const VerifyOTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const toast = useAppToast();

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleVerifyOTP = async () => {
    let valid = true;

    // Validate OTP
    if (!otp.trim()) {
      setOtpError('OTP is required');
      valid = false;
    } else if (otp.length < 6) {
      setOtpError('OTP must be at least 6 digits');
      valid = false;
    } else {
      setOtpError('');
    }

    // Validate Password
    if (!newPassword.trim()) {
      setPasswordError('New password is required');
      valid = false;
    } else if (!validatePassword(newPassword)) {
      setPasswordError('Password must be at least 6 characters long');
      valid = false;
    } else {
      setPasswordError('');
    }

    // Validate Confirm Password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (!valid) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOTPApi({
        email: email,
        otp: otp.trim(),
        newPassword: newPassword
      });

      // Kiểm tra cả response code và message để xác định thành công
      if (response.code === '1000' || response.message?.toLowerCase().includes('success') || response.message?.toLowerCase().includes('reset')) {
        // Hiển thị toast thành công và chuyển về màn hình Login
        toast.success('Your password has been reset successfully!');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        toast.error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setOtp(numericText);

    if (otpError) {
      if (!numericText.trim()) {
        setOtpError('OTP is required');
      } else if (numericText.length < 6) {
        setOtpError('OTP must be at least 6 digits');
      } else {
        setOtpError('');
      }
    }
  };

  const handlePasswordChange = (text: string) => {
    setNewPassword(text);
    if (passwordError) {
      if (!text.trim()) {
        setPasswordError('New password is required');
      } else if (!validatePassword(text)) {
        setPasswordError('Password must be at least 6 characters long');
      } else {
        setPasswordError('');
      }
    }

    // Also check confirm password if it exists
    if (confirmPassword && text !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else if (confirmPassword && text === confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) {
      if (!text.trim()) {
        setConfirmPasswordError('Please confirm your password');
      } else if (newPassword !== text) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
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
          <Text className="text-3xl font-bold text-backgroundColor mb-2">Verify OTP</Text>
          <Text className="text-gray-500 text-center">
            Enter the OTP sent to your email and set your new password
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-2">
            Email: {email}
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
          {/* OTP Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">OTP Code</Text>
            <TextInput
              className={`w-full h-12 border rounded-lg px-4 bg-white text-center text-lg ${otpError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter OTP code"
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="numeric"
              maxLength={6}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {otpError && <Text className="text-red-500 text-sm mt-1">{otpError}</Text>}
          </View>

          {/* New Password Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">New Password</Text>
            <View className="relative">
              <TextInput
                className={`w-full h-12 border rounded-lg px-4 pr-12 bg-white ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Text className="text-gray-500 text-lg opacity-60">
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            {passwordError && <Text className="text-red-500 text-sm mt-1">{passwordError}</Text>}
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Confirm New Password</Text>
            <View className="relative">
              <TextInput
                className={`w-full h-12 border rounded-lg px-4 pr-12 bg-white ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <Text className="text-gray-500 text-lg opacity-60">
                  {showConfirmPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            {confirmPasswordError && <Text className="text-red-500 text-sm mt-1">{confirmPasswordError}</Text>}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            className={`w-full h-12 rounded-lg items-center justify-center mb-4 ${isLoading ? 'bg-gray-400' : 'bg-backgroundColor'}`}
            onPress={handleVerifyOTP}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Reset Password</Text>
            )}
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            className="items-center"
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text className="text-brightColor font-semibold">Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VerifyOTPScreen;
