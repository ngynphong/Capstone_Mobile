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
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/types';
import {useAuth} from '../../context/AuthContext';
import {useAppToast} from '../../utils/toast';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC<Props> = ({navigation}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [dobError, setDobError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const {register, isLoading} = useAuth();
  const toast = useAppToast();

  const validateForm = () => {
    const errors: string[] = [];

    if (!firstName.trim()) {
      errors.push('First name is required');
    } else if (firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }

    if (!lastName.trim()) {
      errors.push('Last name is required');
    } else if (lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }

    if (!dob.trim()) {
      errors.push('Date of birth is required');
    } else {
      // DateTimePicker ensures valid date and past date, so we only need to check age
      const birthDate = new Date(dob);
      const today = new Date();

      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      let isUnderage = false;
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        isUnderage = age - 1 < 13;
      } else {
        isUnderage = age < 13;
      }

      if (isUnderage) {
        errors.push('You must be at least 13 years old to register');
      }
    }

    if (!email.trim()) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
      } else if (email.length > 254) {
        errors.push('Email address is too long');
      }
    }

    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
      if (password.length > 128) {
        errors.push('Password is too long (maximum 128 characters)');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
      }
    }

    if (!confirmPassword) {
      errors.push('Please confirm your password');
    } else if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  };

  const handleSignUp = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setFirstNameError(errors.find(e => e.includes('First name')) || '');
      setLastNameError(errors.find(e => e.includes('Last name')) || '');
      setDobError(
        errors.find(e => e.includes('Date of birth') || e.includes('age')) ||
          '',
      );
      setEmailError(errors.find(e => e.includes('Email')) || '');
      setPasswordError(errors.find(e => e.includes('Password')) || '');
      setConfirmPasswordError(
        errors.find(e => e.includes('Passwords do not match')) || '',
      );
      return;
    } else {
      setFirstNameError('');
      setLastNameError('');
      setDobError('');
      setEmailError('');
      setPasswordError('');
      setConfirmPasswordError('');
    }

    const success = await register({
      email: email.trim().toLowerCase(),
      password: password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob: dob,
    });

    if (!success) {
      toast.error('Unable to create account. Please try again.');
    } else {
      toast.success('Your account has been created successfully!');
      // Đợi 1 giây để user thấy toast, sau đó navigate
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1000);
    }
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
            Create Account
          </Text>
          <Text className="text-gray-500 text-center">
            Sign up to get started
          </Text>
        </View>

        {/* Registration Form Card */}
        <View className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
          {/* First Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              First Name
            </Text>
            <TextInput
              className={`w-full h-12 border rounded-lg px-4  bg-white ${firstNameError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={text => {
                setFirstName(text);
                if (firstNameError) {
                  if (!text.trim()) {
                    setFirstNameError('First name is required');
                  } else if (text.trim().length < 2) {
                    setFirstNameError(
                      'First name must be at least 2 characters long',
                    );
                  } else {
                    setFirstNameError('');
                  }
                }
              }}
              autoCapitalize="words"
            />
            {firstNameError && (
              <Text className="text-red-500 text-sm mt-1">
                {firstNameError}
              </Text>
            )}
          </View>

          {/* Last Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Last Name
            </Text>
            <TextInput
              className={`w-full h-12 border rounded-lg px-4  bg-white ${lastNameError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter last name"
              value={lastName}
              onChangeText={text => {
                setLastName(text);
                if (lastNameError) {
                  if (!text.trim()) {
                    setLastNameError('Last name is required');
                  } else if (text.trim().length < 2) {
                    setLastNameError(
                      'Last name must be at least 2 characters long',
                    );
                  } else {
                    setLastNameError('');
                  }
                }
              }}
              autoCapitalize="words"
            />

            {lastNameError && (
              <Text className="text-red-500 text-sm mt-1">{lastNameError}</Text>
            )}
          </View>

          {/* Date of Birth Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </Text>
            <TouchableOpacity
              className={`w-full h-12 border rounded-lg px-4 bg-white  justify-center ${dobError ? 'border-red-500' : 'border-gray-300'}`}
              onPress={() => setShowDatePicker(true)}
            >
              <Text className={`${dob ? 'text-black' : 'text-gray-500'}`}>
                {dob
                  ? new Date(dob).toLocaleDateString()
                  : 'Select your date of birth'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dob ? new Date(dob) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const today = new Date();
                    const age =
                      today.getFullYear() - selectedDate.getFullYear();
                    const monthDiff =
                      today.getMonth() - selectedDate.getMonth();

                    let isUnderage = false;
                    if (
                      monthDiff < 0 ||
                      (monthDiff === 0 &&
                        today.getDate() < selectedDate.getDate())
                    ) {
                      isUnderage = age - 1 < 13;
                    } else {
                      isUnderage = age < 13;
                    }

                    if (selectedDate >= today) {
                      setDobError('Date of birth must be in the past');
                    } else if (isUnderage) {
                      setDobError(
                        'You must be at least 13 years old to register',
                      );
                    } else {
                      setDobError('');
                      setDob(selectedDate.toISOString().split('T')[0]);
                    }
                  }
                }}
                maximumDate={new Date()}
              />
            )}
            {dobError && (
              <Text className="text-red-500 text-sm mt-1">{dobError}</Text>
            )}
          </View>

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
                  if (!text.trim()) {
                    setEmailError('Email is required');
                  } else {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(text)) {
                      setEmailError('Please enter a valid email address');
                    } else if (text.length > 254) {
                      setEmailError('Email address is too long');
                    } else {
                      setEmailError('');
                    }
                  }
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
                className={`w-full h-12 border rounded-lg px-4 pr-12  bg-white ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your password (min 6 characters)"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (passwordError) {
                    if (!text) {
                      setPasswordError('Password is required');
                    } else if (text.length < 6) {
                      setPasswordError(
                        'Password must be at least 6 characters long',
                      );
                    } else if (text.length > 128) {
                      setPasswordError(
                        'Password is too long (maximum 128 characters)',
                      );
                    } else if (!/(?=.*[a-z])/.test(text)) {
                      setPasswordError(
                        'Password must contain at least one lowercase letter',
                      );
                    } else if (!/(?=.*[A-Z])/.test(text)) {
                      setPasswordError(
                        'Password must contain at least one uppercase letter',
                      );
                    } else if (!/(?=.*\d)/.test(text)) {
                      setPasswordError(
                        'Password must contain at least one number',
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

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </Text>
            <View className="relative">
              <TextInput
                className={`w-full h-12 border rounded-lg px-4 pr-12  bg-white ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) {
                    if (!text) {
                      setConfirmPasswordError('Please confirm your password');
                    } else if (password !== text) {
                      setConfirmPasswordError('Passwords do not match');
                    } else {
                      setConfirmPasswordError('');
                    }
                  }
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text className="text-gray-500 text-lg opacity-60">
                  {showConfirmPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            {confirmPasswordError && (
              <Text className="text-red-500 text-sm mt-1">
                {confirmPasswordError}
              </Text>
            )}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`w-full h-12 rounded-lg items-center justify-center mb-4 ${isLoading ? 'bg-gray-400' : 'bg-backgroundColor'}`}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate('Login')}
        >
          <View className="flex-row gap-1">
            <Text className="text-gray-600">Already have an account?</Text>
            <Text className="text-brightColor font-semibold">Sign In</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
