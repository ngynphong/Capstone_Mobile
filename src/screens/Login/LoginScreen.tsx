import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/types';
import {useAuth} from '../../context/AuthContext';
import {useAppToast} from '../../utils/toast';
import AntDesign from '@expo/vector-icons/AntDesign';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const {login, isLoading} = useAuth();
  const toast = useAppToast();

  const handleLogin = async () => {
    let valid = true;

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        valid = false;
      } else {
        setEmailError('');
      }
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters long');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) {
      return;
    }

    const success = await login({email: email.trim(), password: password});
    if (!success) {
      toast.error('Invalid email or password. Please try again.');
    } else {
      toast.success('Login successful!');
    }
  };

  const handleGoogleLogin = () => {
    toast.info('Google login functionality will be implemented later.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 20,
        }}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-backgroundColor mb-2">
            Welcome Back
          </Text>
          <Text className="text-gray-500 text-center">
            Sign in to your account
          </Text>
        </View>

        {/* Login Form Card */}
        <View className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email
            </Text>
            <TextInput
              className={`w-full h-12 border rounded-lg px-4 bg-white ${emailError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (emailError) {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  setEmailError(
                    emailRegex.test(text)
                      ? ''
                      : 'Please enter a valid email address',
                  );
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {emailError && (
              <Text className="text-red-500 text-sm mt-1">{emailError}</Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Password
            </Text>
            <View className="relative">
              <TextInput
                className={`w-full h-12 border rounded-lg px-4 pr-12 bg-white ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your password"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (passwordError) {
                    if (!text.trim()) {
                      setPasswordError('Password is required');
                    } else if (text.length < 4) {
                      setPasswordError(
                        'Password must be at least 4 characters long',
                      );
                    } else {
                      setPasswordError('');
                    }
                  }
                }}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text className="text-gray-500 text-lg opacity-60">
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            {passwordError && (
              <Text className="text-red-500 text-sm mt-1">{passwordError}</Text>
            )}
          </View>

          {/* Remember Me & Forgot Password */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                className={`w-5 h-5 border-2 rounded mr-2 ${rememberMe ? 'bg-backgroundColor border-backgroundColor' : 'border-gray-300'}`}
              >
                {rememberMe && (
                  <Text className="text-white text-xs text-center">✓</Text>
                )}
              </View>
              <Text className="text-sm text-gray-600">Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text className="text-sm text-brightColor">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className={`w-full h-12 rounded-lg items-center justify-center mb-4 ${isLoading ? 'bg-gray-400' : 'bg-backgroundColor'}`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-3 text-gray-500 text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            className="w-full h-12 border border-gray-300 rounded-lg items-center justify-center flex-row"
            onPress={handleGoogleLogin}
          >
            {/* <Image source={require('../../../assets/google-icon.svg')} className="w-5 h-5 mr-3" /> */}
            <AntDesign name="google" size={24} color="black" className="mr-3" />
            <Text className="text-gray-700 font-medium">
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate('SignUp')}
        >
          <View className="flex-row gap-1">
            <Text className="text-gray-600">Don't have an account?</Text>
            <Text className="text-brightColor font-semibold">Sign Up</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
