import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { ExamTemplate } from '../../types/examTypes';
import ExamCard from './ExamCard';
import { useAppToast } from '../../utils/toast';
import { useScroll } from '../../context/ScrollContext';
import { useBrowseExams } from '../../hooks/useExam';
import { useSubject } from '../../hooks/useSubject';
import { useExamAttempt } from '../../hooks/useExamAttempt';

interface CombinedTestBuilderProps {
    onStartTest: (examIds: string[]) => void;
    onStartAutoTest?: (subjectIds: string[]) => Promise<void>;
}

const CombinedTestBuilder: React.FC<CombinedTestBuilderProps> = ({ onStartTest, onStartAutoTest }) => {
    const toast = useAppToast();

    const [mode, setMode] = useState<'manual' | 'auto'>('manual');
    const [selectedExams, setSelectedExams] = useState<ExamTemplate[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [filterSubjectId, setFilterSubjectId] = useState<string>('');

    const { handleScroll } = useScroll();
    const { templates: allExams, loading: examsLoading } = useBrowseExams({ pageSize: 100 });
    const { subjects, isLoading: subjectsLoading, fetchAllSubjects } = useSubject();
    const { startComboRandomAttempt } = useExamAttempt();
    const [isStartingTest, setIsStartingTest] = useState(false);

    const loading = examsLoading || subjectsLoading;

    // Load subjects when component mounts
    useFocusEffect(
        useCallback(() => {
            if (subjects.length === 0) {
                fetchAllSubjects();
            }
        }, [subjects.length, fetchAllSubjects])
    );

    // Filter exams based on selected subject
    const filteredExams = filterSubjectId
        ? allExams.filter(exam => exam.subject.id === filterSubjectId)
        : allExams;

    const handleSelectExam = (exam: ExamTemplate) => {
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

    const handleStartAutoTest = async () => {
        if (selectedSubjects.length === 0) {
            toast.error('Please select at least one subject');
            return;
        }

        if (!onStartAutoTest) {
            toast.error('Feature not supported yet');
            return;
        }

        try {
            setIsStartingTest(true);
            await onStartAutoTest(selectedSubjects);
        } catch (error) {
            console.error('Error starting random combined test:', error);
            toast.error('Failed to create random combined test. Please try again.');
        } finally {
            setIsStartingTest(false);
        }
    };

    const handleStartTest = () => {

        if (selectedExams.length === 0) {
            toast.error('Please select at least one exam');
            return;
        }

        Alert.alert(
            'Start Combined Test',
            `You will start ${selectedExams.length} exams. Cost: ${selectedExams.reduce((total, exam) => total + exam.tokenCost, 0)} VNĐ`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start',
                    onPress: () => {
                        setIsStartingTest(true);
                        onStartTest(selectedExams.map(e => e.id));
                    },
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
            <View className="bg-white px-6 py-2 border-b border-gray-200">
                {/* <Text className="text-lg font-semibold text-gray-900">
                    Tạo bộ đề tổ hợp
                </Text> */}
                {mode === 'manual' && selectedExams.length > 0 && (
                    <Text className="text-sm text-gray-600 mt-1">
                        Selected: {selectedExams.length} exams
                    </Text>
                )}
                {mode === 'auto' && selectedSubjects.length > 0 && (
                    <Text className="text-sm text-gray-600 mt-1">
                        Selected: {selectedSubjects.length} subjects
                    </Text>
                )}
            </View>

            {/* Mode Selection */}
            <View className="bg-white px-6 py-2 border-b border-gray-200">
                <View className="flex-row bg-gray-100 rounded-xl p-1">
                    <TouchableOpacity
                        onPress={() => setMode('manual')}
                        className={`flex-1 py-2 rounded-lg ${mode === 'manual' ? 'bg-teal-400' : ''}`}
                    >
                        <Text className={`font-semibold text-center text-sm ${mode === 'manual' ? 'text-white' : 'text-gray-600'}`}>
                            Manual
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setMode('auto')}
                        className={`flex-1 py-2 rounded-lg ${mode === 'auto' ? 'bg-teal-400' : ''}`}
                    >
                        <Text className={`font-semibold text-center text-sm ${mode === 'auto' ? 'text-white' : 'text-gray-600'}`}>
                            System choice
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content based on mode */}
            {mode === 'manual' ? (
                /* Manual Exam Selection */
                <>
                    {/* Subject Filter */}
                    <View className="bg-white px-6 py-4 border-b border-gray-200">
                        <Text className="text-base font-medium text-gray-900 mb-3">
                            Subject filter
                        </Text>
                        <View className="flex-row flex-wrap">
                            <TouchableOpacity
                                onPress={() => setFilterSubjectId('')}
                                className={`mr-3 mb-2 px-4 py-2 rounded-xl border ${filterSubjectId === ''
                                        ? 'bg-teal-400 border-teal-400'
                                        : 'bg-white border-gray-300'
                                    }`}
                            >
                                <Text className={`font-medium ${filterSubjectId === '' ? 'text-white' : 'text-gray-700'
                                    }`}>
                                    All
                                </Text>
                            </TouchableOpacity>
                            {subjects.map((subject) => (
                                <TouchableOpacity
                                    key={subject.id}
                                    onPress={() => setFilterSubjectId(subject.id)}
                                    className={`mr-3 mb-2 px-4 py-2 rounded-xl border ${filterSubjectId === subject.id
                                            ? 'bg-teal-400 border-teal-400'
                                            : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <Text className={`font-medium ${filterSubjectId === subject.id ? 'text-white' : 'text-gray-700'
                                        }`}>
                                        {subject.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {filterSubjectId && (
                            <Text className="text-sm text-gray-600 mt-2">
                                Filter: {subjects.find(s => s.id === filterSubjectId)?.name}
                            </Text>
                        )}
                    </View>

                    <FlatList
                        data={filteredExams}
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
                                <Text className="text-gray-500">
                                    {filterSubjectId ? 'No exams found for this subject' : 'No exams found'}
                                </Text>
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
                                    Start Combined Test ({selectedExams.length} exams)
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
                            Select subjects to let the system create the test
                        </Text>

                        <View className="flex-row flex-wrap">
                            {subjects.map((subject) => {
                                const isSelected = selectedSubjects.includes(subject.id);
                                return (
                                    <TouchableOpacity
                                        key={subject.id}
                                        onPress={() => handleSelectSubject(subject.id)}
                                        className={`mr-3 mb-3 px-4 py-3 rounded-xl border ${isSelected
                                                ? 'bg-teal-400 border-teal-400'
                                                : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <View className="flex-row items-center">
                                            {isSelected && (
                                                <Check size={16} color="white" className="mr-2" />
                                            )}
                                            <Text className={`font-medium ${isSelected ? 'text-white' : 'text-gray-700'
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
                                <Text className="text-gray-500">No subjects found</Text>
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
                                    Start Combined Test ({selectedSubjects.length} subjects)
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
            {/* Loading Overlay */}
            {isStartingTest && (
                <View className="absolute inset-0 bg-white bg-opacity-50 justify-center items-center">
                    <View className="bg-white rounded-2xl p-8 items-center shadow-lg">
                        <ActivityIndicator size="large" color="#3CBCB2" />
                        <Text className="text-gray-900 font-semibold mt-4 text-lg">
                            Creating test...
                        </Text>
                        <Text className="text-gray-600 text-center mt-2">
                            Please wait a moment
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default CombinedTestBuilder;
