import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { RootStackParamList } from '../../types/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match.');
      return;
    }
    // Handle sign up logic here
    console.log('Signing up with:', fullName, email, password);
    navigation.navigate('Login');
  };

  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-2xl font-bold mb-5">Sign Up</Text>
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-md px-3 mb-3"
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-md px-3 mb-3"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-md px-3 mb-3"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-md px-3 mb-5"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text className="mt-5">
          Already have an account? <Text className="text-blue-500">Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpScreen;
