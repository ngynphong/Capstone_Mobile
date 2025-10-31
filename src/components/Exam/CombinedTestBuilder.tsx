import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { X, Check, Coins, BookOpen } from 'lucide-react-native';
import { Subject, SubjectType, Exam } from '../../types/examTypes';
import { ExamService } from '../../services/examService';
import ExamCard from './ExamCard';
import { useAuth } from '../../context/AuthContext';
import { useAppToast } from '../../utils/toast';
import { useScroll } from '../../context/ScrollContext';

interface CombinedTestBuilderProps {
    onStartTest: (examIds: string[]) => void;
}

const CombinedTestBuilder: React.FC<CombinedTestBuilderProps> = ({ onStartTest }) => {
    const { user, spendTokens } = useAuth();
    const toast = useAppToast();

    const [mode, setMode] = useState<'custom' | 'auto'>('custom');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [allExams, setAllExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    // Custom mode state
    const [selectedExams, setSelectedExams] = useState<Exam[]>([]);
    const [showExamModal, setShowExamModal] = useState(false);
    const [selectedSubjectForModal, setSelectedSubjectForModal] = useState<Subject | null>(null);
    const [modalExams, setModalExams] = useState<Exam[]>([]);

    // Auto mode state
    const [selectedSubjects, setSelectedSubjects] = useState<SubjectType[]>([]);

    const { handleScroll } = useScroll();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [subjectsData, examsData] = await Promise.all([
                ExamService.getSubjects(),
                ExamService.getExams(),
            ]);

            // Filter out 'All' subject
            const filteredSubjects = subjectsData.filter(s => s.name !== 'All');
            setSubjects(filteredSubjects);
            setAllExams(examsData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectExamFromModal = (exam: Exam) => {
        if (selectedExams.find(e => e.id === exam.id)) {
            // Already selected, remove it
            setSelectedExams(selectedExams.filter(e => e.id !== exam.id));
        } else {
            // Add to selected
            setSelectedExams([...selectedExams, exam]);
        }
    };

    const openExamModal = async (subject: Subject) => {
        setSelectedSubjectForModal(subject);
        const filteredExams = allExams.filter(exam => exam.subject.name === subject.name);
        setModalExams(filteredExams);
        setShowExamModal(true);
    };

    const calculateTotalTokens = () => {
        return selectedExams.reduce((sum, exam) => sum + exam.tokenCost, 0);
    };

    const handleStartCustomTest = async () => {
        if (selectedExams.length === 0) {
            toast.error('Vui lòng chọn ít nhất một bài thi');
            return;
        }

        if (user) {
            const totalCost = calculateTotalTokens();
            if (!user.tokenBalance || user.tokenBalance < totalCost) {
                Alert.alert(
                    'Không đủ Token',
                    `Bạn cần ${totalCost} token để làm bài thi tổ hợp này. Số token hiện tại: ${user.tokenBalance || 0}`,
                    [{ text: 'OK' }]
                );
                return;
            }

            Alert.alert(
                'Bắt đầu Thi Tổ hợp',
                `Bạn sẽ bắt đầu làm ${selectedExams.length} bài thi với tổng chi phí ${totalCost} token.`,
                [
                    { text: 'Hủy', style: 'cancel' },
                    {
                        text: 'Bắt đầu',
                        onPress: async () => {
                            const success = await spendTokens(totalCost);
                            if (success) {
                                onStartTest(selectedExams.map(e => e.id));
                            } else {
                                toast.error('Failed to deduct tokens');
                            }
                        },
                    },
                ]
            );
        }
    };

    const handleToggleSubject = (subjectName: SubjectType) => {
        if (selectedSubjects.includes(subjectName)) {
            setSelectedSubjects(selectedSubjects.filter(s => s !== subjectName));
        } else {
            setSelectedSubjects([...selectedSubjects, subjectName]);
        }
    };

    const handleStartAutoTest = async () => {
        if (selectedSubjects.length === 0) {
            toast.error('Vui lòng chọn ít nhất một môn học');
            return;
        }

        // Random select one exam from each selected subject
        const examsToTake: Exam[] = [];
        selectedSubjects.forEach(subjectName => {
            const examsInSubject = allExams.filter(exam => exam.subject.name === subjectName);
            if (examsInSubject.length > 0) {
                const randomExam = examsInSubject[Math.floor(Math.random() * examsInSubject.length)];
                examsToTake.push(randomExam);
            }
        });

        if (examsToTake.length === 0) {
            toast.error('Không tìm thấy bài thi cho các môn đã chọn');
            return;
        }

        const totalCost = examsToTake.reduce((sum, exam) => sum + exam.tokenCost, 0);

        if (user) {
            if (!user.tokenBalance || user.tokenBalance < totalCost) {
                Alert.alert(
                    'Không đủ Token',
                    `Bạn cần ${totalCost} token. Số token hiện tại: ${user.tokenBalance || 0}`,
                    [{ text: 'OK' }]
                );
                return;
            }

            Alert.alert(
                'Bắt đầu Thi Tổ hợp',
                `Bạn sẽ làm ${examsToTake.length} bài thi từ các môn đã chọn với tổng chi phí ${totalCost} token.`,
                [
                    { text: 'Hủy', style: 'cancel' },
                    {
                        text: 'Bắt đầu',
                        onPress: async () => {
                            const success = await spendTokens(totalCost);
                            if (success) {
                                onStartTest(examsToTake.map(e => e.id));
                            } else {
                                toast.error('Failed to deduct tokens');
                            }
                        },
                    },
                ]
            );
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3CBCB2" />
                <Text className="text-gray-600 mt-4">Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Mode Selection Tabs */}
            <View className="bg-white px-6 pt-4 pb-4 border-b border-gray-200">
                <View className="flex-row bg-gray-100 rounded-xl p-1">
                    <TouchableOpacity
                        onPress={() => setMode('custom')}
                        className={`flex-1 py-2 rounded-lg ${mode === 'custom' ? 'bg-teal-400' : ''}`}
                    >
                        <Text className={`font-semibold text-center ${mode === 'custom' ? 'text-white' : 'text-gray-600'}`}>
                            Tự Chọn
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setMode('auto')}
                        className={`flex-1 py-2 rounded-lg ${mode === 'auto' ? 'bg-teal-400' : ''}`}
                    >
                        <Text className={`font-semibold text-center ${mode === 'auto' ? 'text-white' : 'text-gray-600'}`}>
                            Nền Tảng Chọn
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Custom Mode UI */}
            {mode === 'custom' && (
                <View className="flex-1">
                    {/* Selected Exams Summary */}
                    {selectedExams.length > 0 && (
                        <View className="bg-teal-50 border-b border-teal-200 px-6 py-4">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-base font-semibold text-gray-900">
                                    Đã chọn {selectedExams.length} bài thi
                                </Text>
                                <View className="flex-row items-center">
                                    <Coins size={20} color="#F59E0B" />
                                    <Text className="text-lg font-bold text-gray-900 ml-2">
                                        {calculateTotalTokens()}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setSelectedExams([])}
                                className="bg-red-500 px-4 py-2 rounded-lg self-start"
                            >
                                <Text className="text-white font-medium">Xóa tất cả</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Subject List */}
                    <FlatList
                        data={subjects}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        onScroll={handleScroll} // scroll behavior 
                        scrollEventThrottle={16} // scroll behavior 
                        renderItem={({ item }) => {
                            const examCount = allExams.filter(e => e.subject.name === item.name).length;
                            return (
                                <TouchableOpacity
                                    onPress={() => openExamModal(item)}
                                    className="bg-white rounded-xl p-4 mb-4 flex-row items-center justify-between border border-gray-200"
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View
                                            className="w-12 h-12 rounded-lg items-center justify-center mr-3"
                                            style={{ backgroundColor: item.color || '#3CBCB2' + '20' }}
                                        >
                                            <BookOpen size={24} color={item.color || '#3CBCB2'} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-base font-semibold text-gray-900">
                                                {item.name}
                                            </Text>
                                            <Text className="text-sm text-gray-500">
                                                {examCount} bài thi có sẵn
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="bg-teal-50 px-3 py-2 rounded-lg">
                                        <Text className="text-teal-600 font-medium">Chọn bài thi</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={
                            <View className="items-center py-8">
                                <Text className="text-gray-500">Không có môn học nào</Text>
                            </View>
                        }
                    />

                    {/* Start Button */}
                    {selectedExams.length > 0 && (
                        <View className="bg-white border-t border-gray-200 px-6 py-4">
                            <TouchableOpacity
                                onPress={handleStartCustomTest}
                                className="bg-teal-400 py-4 rounded-xl"
                            >
                                <Text className="text-white font-bold text-center text-lg">
                                    Bắt đầu Thi Tổ hợp
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Auto Mode UI */}
            {mode === 'auto' && (
                <View className="flex-1">
                    <View className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                        <Text className="text-sm text-blue-800">
                            ℹ️ Chọn các môn học, hệ thống sẽ tự động chọn ngẫu nhiên 1 bài thi cho mỗi môn
                        </Text>
                    </View>

                    {/* Subject List */}
                    <FlatList
                        data={subjects}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        onScroll={handleScroll} // scroll behavior 
                        scrollEventThrottle={16} // scroll behavior 
                        renderItem={({ item }) => {
                            const isSelected = selectedSubjects.includes(item.name);
                            return (
                                <TouchableOpacity
                                    onPress={() => handleToggleSubject(item.name)}
                                    className="bg-white rounded-xl p-4 mb-4 flex-row items-center justify-between border-2"
                                    style={{
                                        borderColor: isSelected ? '#3CBCB2' : '#E5E7EB',
                                        backgroundColor: isSelected ? '#F0FDFA' : 'white',
                                    }}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View
                                            className="w-12 h-12 rounded-lg items-center justify-center mr-3"
                                            style={{ backgroundColor: item.color || '#3CBCB2' + '20' }}
                                        >
                                            <BookOpen size={24} color={item.color || '#3CBCB2'} />
                                        </View>
                                        <Text className="text-base font-semibold text-gray-900">
                                            {item.name}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <View className="w-6 h-6 bg-teal-400 rounded-full items-center justify-center">
                                            <Check size={16} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={
                            <View className="items-center py-8">
                                <Text className="text-gray-500">Không có môn học nào</Text>
                            </View>
                        }
                    />

                    {/* Start Button */}
                    {selectedSubjects.length > 0 && (
                        <View className="bg-white border-t border-gray-200 px-6 py-4">
                            <TouchableOpacity
                                onPress={handleStartAutoTest}
                                className="bg-teal-400 py-4 rounded-xl"
                            >
                                <Text className="text-white font-bold text-center text-lg">
                                    Bắt đầu Thi
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Exam Selection Modal */}
            <Modal
                visible={showExamModal}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowExamModal(false)}
            >
                <View className="flex-1 bg-gray-50">
                    {/* Modal Header */}
                    <View className="bg-white pt-12 pb-4 px-6 shadow-sm">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-xl font-bold text-gray-900">
                                Chọn bài thi - {selectedSubjectForModal?.name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowExamModal(false)}
                                className="p-2"
                            >
                                <X size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Modal Content */}
                    <FlatList
                        data={modalExams}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => {
                            const isSelected = selectedExams.find(e => e.id === item.id);
                            return (
                                <View className="mb-4">
                                    <ExamCard
                                        exam={item}
                                        onPress={() => handleSelectExamFromModal(item)}
                                    />
                                    {isSelected && (
                                        <View className="absolute top-2 right-2 bg-teal-400 w-8 h-8 rounded-full items-center justify-center">
                                            <Check size={20} color="white" />
                                        </View>
                                    )}
                                </View>
                            );
                        }}
                        ListEmptyComponent={
                            <View className="items-center py-8">
                                <Text className="text-gray-500">Không có bài thi nào cho môn này</Text>
                            </View>
                        }
                    />

                    {/* Modal Footer */}
                    <View className="bg-white border-t border-gray-200 px-6 py-4">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-base font-semibold text-gray-900">
                                Đã chọn: {selectedExams.filter(e => e.subject.name === selectedSubjectForModal?.name).length}
                            </Text>
                            <View className="flex-row items-center">
                                <Coins size={20} color="#F59E0B" />
                                <Text className="text-lg font-bold text-gray-900 ml-2">
                                    {selectedExams.filter(e => e.subject.name === selectedSubjectForModal?.name).reduce((sum, e) => sum + e.tokenCost, 0)}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowExamModal(false)}
                            className="bg-teal-400 py-3 rounded-xl"
                        >
                            <Text className="text-white font-bold text-center">Hoàn tất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CombinedTestBuilder;

