import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Check, BookOpen } from 'lucide-react-native';
import { Exam } from '../../types/examTypes';
import { ExamService } from '../../services/examService';
import { SubjectService } from '../../services/subjectService';
import { Subject } from '../../types/subjectTypes';
import ExamCard from './ExamCard';
import { useAppToast } from '../../utils/toast';
import { useScroll } from '../../context/ScrollContext';

interface CombinedTestBuilderProps {
    onStartTest: (examIds: string[]) => void;
}

const CombinedTestBuilder: React.FC<CombinedTestBuilderProps> = ({ onStartTest }) => {
    const toast = useAppToast();

    const [mode, setMode] = useState<'manual' | 'auto'>('manual');
    const [allExams, setAllExams] = useState<Exam[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedExams, setSelectedExams] = useState<Exam[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    const { handleScroll } = useScroll();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [examsResponse, subjectsResponse] = await Promise.all([
                ExamService.getAllExams(),
                SubjectService.getAllSubjects()
            ]);
            setAllExams(examsResponse.data);
            setSubjects(subjectsResponse.data?.items || []);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectExam = (exam: Exam) => {
        if (selectedExams.find(e => e.id === exam.id)) {
            // Already selected, remove it
            setSelectedExams(selectedExams.filter(e => e.id !== exam.id));
        } else {
            // Add to selected
            setSelectedExams([...selectedExams, exam]);
        }
    };

    const handleSelectSubject = (subjectId: string) => {
        if (selectedSubjects.includes(subjectId)) {
            setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
        } else {
            setSelectedSubjects([...selectedSubjects, subjectId]);
        }
    };

    const handleStartAutoTest = () => {
        if (selectedSubjects.length === 0) {
            toast.error('Vui lòng chọn ít nhất một môn học');
            return;
        }

        // Filter exams by selected subjects
        const availableExams = allExams.filter(exam =>
            exam.subjectNames.some(subjectName =>
                selectedSubjects.some(subjectId =>
                    subjects.find(s => s.id === subjectId)?.name === subjectName
                )
            )
        );

        if (availableExams.length === 0) {
            toast.error('Không có bài thi nào cho các môn đã chọn');
            return;
        }

        // Randomly select exams (up to 3 exams per subject)
        const selectedExams: Exam[] = [];
        selectedSubjects.forEach(subjectId => {
            const subjectExams = availableExams.filter(exam =>
                exam.subjectNames.includes(subjects.find(s => s.id === subjectId)?.name || '')
            );
            // Take up to 2 random exams per subject
            const shuffled = subjectExams.sort(() => 0.5 - Math.random());
            selectedExams.push(...shuffled.slice(0, Math.min(2, subjectExams.length)));
        });

        if (selectedExams.length === 0) {
            toast.error('Không thể tạo bài thi từ các môn đã chọn');
            return;
        }

        Alert.alert(
            'Bắt đầu Thi Tổ hợp',
            `Hệ thống đã chọn ${selectedExams.length} bài thi từ ${selectedSubjects.length} môn học bạn đã chọn.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Bắt đầu',
                    onPress: () => onStartTest(selectedExams.map(e => e.id)),
                },
            ]
        );
    };

    const handleStartTest = () => {
        if (selectedExams.length === 0) {
            toast.error('Vui lòng chọn ít nhất một bài thi');
            return;
        }

        Alert.alert(
            'Bắt đầu Thi Tổ hợp',
            `Bạn sẽ bắt đầu làm ${selectedExams.length} bài thi.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Bắt đầu',
                    onPress: () => onStartTest(selectedExams.map(e => e.id)),
                },
            ]
        );
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
            {/* Header */}
            <View className="bg-white px-6 py-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">
                    Tạo bộ đề tổ hợp
                </Text>
                {mode === 'manual' && selectedExams.length > 0 && (
                    <Text className="text-sm text-gray-600 mt-1">
                        Đã chọn: {selectedExams.length} bài thi
                    </Text>
                )}
                {mode === 'auto' && selectedSubjects.length > 0 && (
                    <Text className="text-sm text-gray-600 mt-1">
                        Đã chọn: {selectedSubjects.length} môn học
                    </Text>
                )}
            </View>

            {/* Mode Selection */}
            <View className="bg-white px-6 py-4 border-b border-gray-200">
                <View className="flex-row bg-gray-100 rounded-xl p-1">
                    <TouchableOpacity
                        onPress={() => setMode('manual')}
                        className={`flex-1 py-2 rounded-lg ${mode === 'manual' ? 'bg-teal-400' : ''}`}
                    >
                        <Text className={`font-semibold text-center text-sm ${mode === 'manual' ? 'text-white' : 'text-gray-600'}`}>
                            Tự chọn
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setMode('auto')}
                        className={`flex-1 py-2 rounded-lg ${mode === 'auto' ? 'bg-teal-400' : ''}`}
                    >
                        <Text className={`font-semibold text-center text-sm ${mode === 'auto' ? 'text-white' : 'text-gray-600'}`}>
                            Hệ thống tự tạo
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content based on mode */}
            {mode === 'manual' ? (
                /* Manual Exam Selection */
                <>
                    <FlatList
                        data={allExams}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        renderItem={({ item }) => {
                            const isSelected = selectedExams.find(e => e.id === item.id);
                            return (
                                <View className="mb-4">
                                    <ExamCard
                                        exam={item}
                                        onPress={() => handleSelectExam(item)}
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
                                <Text className="text-gray-500">Không có bài thi nào</Text>
                            </View>
                        }
                    />

                    {/* Start Button */}
                    {selectedExams.length > 0 && (
                        <View className="bg-white border-t border-gray-200 px-6 py-4">
                            <TouchableOpacity
                                onPress={handleStartTest}
                                className="bg-teal-400 py-4 rounded-xl"
                            >
                                <Text className="text-white font-bold text-center text-lg">
                                    Bắt đầu Thi Tổ hợp ({selectedExams.length} bài)
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            ) : (
                /* Auto Subject Selection */
                <>
                    <View className="px-6 py-4">
                        <Text className="text-base font-medium text-gray-900 mb-4">
                            Chọn môn học để hệ thống tự tạo bài thi
                        </Text>

                        <View className="flex-row flex-wrap">
                            {subjects.map((subject) => {
                                const isSelected = selectedSubjects.includes(subject.id);
                                return (
                                    <TouchableOpacity
                                        key={subject.id}
                                        onPress={() => handleSelectSubject(subject.id)}
                                        className={`mr-3 mb-3 px-4 py-3 rounded-xl border ${
                                            isSelected
                                                ? 'bg-teal-400 border-teal-400'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <View className="flex-row items-center">
                                            {isSelected && (
                                                <Check size={16} color="white" className="mr-2" />
                                            )}
                                            <Text className={`font-medium ${
                                                isSelected ? 'text-white' : 'text-gray-700'
                                            }`}>
                                                {subject.name}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {subjects.length === 0 && (
                            <View className="items-center py-8">
                                <Text className="text-gray-500">Không có môn học nào</Text>
                            </View>
                        )}
                    </View>

                    {/* Start Button */}
                    {selectedSubjects.length > 0 && (
                        <View className="bg-white border-t border-gray-200 px-6 py-4">
                            <TouchableOpacity
                                onPress={handleStartAutoTest}
                                className="bg-teal-400 py-4 rounded-xl"
                            >
                                <Text className="text-white font-bold text-center text-lg">
                                    Bắt đầu Thi Tổ hợp ({selectedSubjects.length} môn)
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </View>
    );
};

export default CombinedTestBuilder;
