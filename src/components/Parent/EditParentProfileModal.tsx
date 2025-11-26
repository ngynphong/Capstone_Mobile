import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { X, Briefcase, Check, User, Calendar } from 'lucide-react-native';
import { useParentProfile } from '../../hooks/useParentProfile';
import { useAuth } from '../../context/AuthContext';
import { UpdateProfileRequest } from '../../types/userTypes';

interface EditParentProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onProfileUpdated: () => void;
}

const EditParentProfileModal: React.FC<EditParentProfileModalProps> = ({
    visible,
    onClose,
    onProfileUpdated,
}) => {
    const { user } = useAuth();
    const { loading, updateBasicProfile, updateOccupation } = useParentProfile();
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [dob, setDob] = useState(user?.dob || '');
    const [occupation, setOccupation] = useState('');

    useEffect(() => {
        if (visible) {
            setFirstName(user?.firstName || '');
            setLastName(user?.lastName || '');
            setDob(user?.dob || '');
            setOccupation(user?.parentProfile?.occupation || '');
        }
    }, [visible, user]);

    const handleSave = async () => {
        if (!firstName.trim() || !lastName.trim() || !dob.trim()) {
            return;
        }

        const basicData: UpdateProfileRequest = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dob: dob.trim(),
        };

        const basicSuccess = await updateBasicProfile(basicData);

        let occupationSuccess = true;
        if (occupation.trim()) {
            occupationSuccess = await updateOccupation(occupation.trim());
        }

        if (basicSuccess && occupationSuccess) {
            await onProfileUpdated();
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <View className="justify-end min-h-full">
                            <View className="bg-white rounded-t-3xl px-6 py-8">
                                {/* Modal Header */}
                                <View className="flex-row items-center justify-between mb-6">
                                    <View className="flex-1">
                                        <Text className="text-2xl font-bold text-gray-800">
                                            Chỉnh sửa hồ sơ 👤
                                        </Text>
                                        <Text className="text-gray-600 mt-1">
                                            Cập nhật thông tin cá nhân
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                                        onPress={onClose}
                                    >
                                        <X size={20} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                {/* First Name Input */}
                                <View className="mb-4">
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                                        Tên *
                                    </Text>
                                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                        <User size={20} color="#9CA3AF" />
                                        <TextInput
                                            className="flex-1 ml-3 text-base"
                                            placeholder="Nhập tên của bạn"
                                            value={firstName}
                                            onChangeText={setFirstName}
                                            autoCapitalize="words"
                                        />
                                    </View>
                                </View>

                                {/* Last Name Input */}
                                <View className="mb-4">
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                                        Họ *
                                    </Text>
                                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                        <User size={20} color="#9CA3AF" />
                                        <TextInput
                                            className="flex-1 ml-3 text-base"
                                            placeholder="Nhập họ của bạn"
                                            value={lastName}
                                            onChangeText={setLastName}
                                            autoCapitalize="words"
                                        />
                                    </View>
                                </View>

                                {/* DOB Input */}
                                <View className="mb-4">
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                                        Ngày sinh *
                                    </Text>
                                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                        <Calendar size={20} color="#9CA3AF" />
                                        <TextInput
                                            className="flex-1 ml-3 text-base"
                                            placeholder="YYYY-MM-DD"
                                            value={dob}
                                            onChangeText={setDob}
                                        />
                                    </View>
                                </View>

                                {/* Occupation Input */}
                                <View className="mb-6">
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                                        Nghề nghiệp
                                    </Text>
                                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                        <Briefcase size={20} color="#9CA3AF" />
                                        <TextInput
                                            className="flex-1 ml-3 text-base"
                                            placeholder="Nhập nghề nghiệp của bạn"
                                            value={occupation}
                                            onChangeText={setOccupation}
                                            autoCapitalize="words"
                                        />
                                    </View>
                                    <Text className="text-xs text-gray-500 mt-1">
                                        Ví dụ: Giáo viên, Bác sĩ, Kỹ sư, v.v.
                                    </Text>
                                </View>

                                {/* Action Buttons */}
                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        className="flex-1 bg-gray-100 py-4 rounded-xl items-center"
                                        onPress={onClose}
                                        disabled={loading}
                                    >
                                        <Text className="text-gray-700 font-semibold">Hủy</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="flex-1 py-4 rounded-xl items-center flex-row justify-center"
                                        onPress={handleSave}
                                        disabled={loading || !firstName.trim() || !lastName.trim() || !dob.trim()}
                                        style={{
                                            backgroundColor: loading || !firstName.trim() || !lastName.trim() || !dob.trim() ? '#9CA3AF' : '#3CBCB2'
                                        }}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <>
                                                <Check size={20} color="white" />
                                                <Text className="text-white font-semibold ml-2">Lưu</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default EditParentProfileModal;
