import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { RootStackParamList } from '../../types/types';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsLoggedIn } = useAuth();

  const handleLogin = () => {
    if (!email || !password) {
      // Simple validation
      Alert.alert('Please enter both email and password.');
      return;
    }

    // Fake authentication logic for testing
    const fakeUsers = [
      { email: 'test@example.com', password: 'password123' },
      { email: 'admin@test.com', password: 'admin123' },
      { email: 'user@test.com', password: 'user123' },
    ];

    const isValidUser = fakeUsers.some(user => user.email === email && user.password === password);

    if (isValidUser) {
      console.log('Login successful for:', email);
      setIsLoggedIn(true);
    } else {
      Alert.alert('Invalid credentials', 'Please use:\nEmail: test@example.com\nPassword: password123\n\nOr try other test accounts.');
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-2xl font-bold mb-5">Login</Text>
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-md px-3 mb-3"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-md px-3 mb-5"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={() => console.log('Forgot Password pressed')}>
        <Text className="text-blue-500 mt-3">Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text className="mt-5">
          Don't have an account? <Text className="text-blue-500">Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
