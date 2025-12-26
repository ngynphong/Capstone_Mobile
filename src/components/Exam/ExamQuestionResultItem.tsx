import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { CheckCircle, Sparkles, Send } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useAiExamAsk } from '../../hooks/useAiExamAsk';
import LatexText from '../common/LatexText';
import QuestionImage from './QuestionImage';
import AudioPlayer from '../common/AudioPlayer';

interface QuestionItemProps {
    questionItem: any;
    index: number;
    attemptId: string;
    hideContextMedia?: boolean; // Hide context/image/audio if shown at group level
}

const ExamQuestionResultItem: React.FC<QuestionItemProps> = ({ questionItem, index, attemptId, hideContextMedia = false }) => {
    const { user } = useAuth();
    const { askAi, response, isLoading, error } = useAiExamAsk();
    const [showAiSection, setShowAiSection] = useState(false);
    const [userQuestion, setUserQuestion] = useState('');

    // Extract question media
    const questionImage = questionItem.question.imageUrl;
    const questionAudio = questionItem.question.audioUrl;
    const questionContext = questionItem.question.questionContext;

    const handleAskAi = () => {
        if (!userQuestion.trim()) return;

        // Extract answer contents from question answers
        const answerContents: string[] = questionItem.question.answers?.map((a: any) => a.content) || [];

        askAi({
            attemptId: attemptId,
            questionContent: questionItem.question.content,
            studentAnswer: questionItem.studentAnswer?.selectedAnswerId
                ? questionItem.question.answers?.find((a: any) => a.id === questionItem.studentAnswer?.selectedAnswerId)?.content || 'No answer'
                : questionItem.studentAnswer?.frqAnswerText || 'No answer',
            studentAsking: userQuestion,
            doneBy: user?.email || 'User',
            questionContext: questionContext?.content || '',
            answerContents: answerContents,
        });
    };

    const toggleAiSection = () => {
        setShowAiSection(!showAiSection);
    };

    return (
        <View className="mb-6 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 last:mb-0">
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">
                        Question {questionItem.orderNumber}
                    </Text>
                    <View className="flex-row items-center mb-2">
                        <View className="bg-gray-100 px-2 py-1 rounded mr-2">
                            <Text className="text-xs text-gray-700">{questionItem.question.type.toUpperCase()}</Text>
                        </View>
                        <View className="bg-blue-100 px-2 py-1 rounded mr-2">
                            <Text className="text-xs text-blue-700">{questionItem.question.subject.name}</Text>
                        </View>
                        <View className="bg-purple-100 px-2 py-1 rounded">
                            <Text className="text-xs text-purple-700">{questionItem.question.difficulty.name}</Text>
                        </View>
                    </View>
                    <Text className="text-sm text-gray-600 mb-1">Topic: {questionItem.question.topic}</Text>
                </View>
                <View className="items-end">
                    <Text className={`text-sm font-semibold ${questionItem.score === questionItem.points ? 'text-green-600' : 'text-red-600'}`}>
                        {questionItem.score}/{questionItem.points} pts
                    </Text>
                </View>
            </View>

            {/* Question Image (only show if not hidden by group) */}
            {!hideContextMedia && questionImage && (
                <QuestionImage imageUrl={questionImage} alt="Question image" />
            )}

            {/* Question Audio (only show if not hidden by group) */}
            {!hideContextMedia && questionAudio && (
                <AudioPlayer audioUrl={questionAudio} title="Listen to the audio" />
            )}

            <LatexText content={questionItem.question.content} fontSize={15} />

            {/* Answers */}
            {questionItem.question.answers && questionItem.question.answers.length > 0 && (
                <View className="mb-4">
                    {questionItem.question.answers.map((answer: any, answerIndex: number) => {
                        const isSelected = questionItem.studentAnswer?.selectedAnswerId === answer.id;
                        const isCorrect = answer.id === questionItem.studentAnswer?.correctAnswer?.id;

                        return (
                            <View
                                key={answer.id}
                                className={`flex-row items-center p-3 rounded-lg mb-2 ${isCorrect ? 'bg-green-50 border border-green-200' :
                                    isSelected && !isCorrect ? 'bg-red-50 border border-red-200' :
                                        'bg-gray-50'
                                    }`}
                            >
                                <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${isCorrect ? 'bg-green-500' :
                                    isSelected && !isCorrect ? 'bg-red-500' :
                                        'bg-gray-300'
                                    }`}>
                                    <Text className="text-xs text-white font-bold">
                                        {String.fromCharCode(65 + answerIndex)}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <LatexText
                                        content={answer.content}
                                        fontSize={14}
                                        textStyle={{
                                            color: isCorrect ? '#166534' : (isSelected && !isCorrect) ? '#991B1B' : '#374151',
                                            fontWeight: isCorrect ? '500' : 'normal'
                                        }}
                                    />
                                </View>
                                {isCorrect && (
                                    <CheckCircle size={16} color="#10B981" />
                                )}
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Student Answer Summary */}
            <View className="bg-gray-50 rounded-lg p-3 mb-3">
                <Text className="text-sm font-medium text-gray-900 mb-2">Your Answer:</Text>
                {questionItem.studentAnswer ? (
                    <View>
                        {questionItem.question.type === 'mcq' ? (
                            <LatexText
                                content={questionItem.question.answers?.find((a: any) => a.id === questionItem.studentAnswer?.selectedAnswerId)?.content || 'N/A'}
                                fontSize={14}
                            />
                        ) : (
                            <LatexText
                                content={questionItem.studentAnswer.frqAnswerText || 'No answer provided'}
                                fontSize={14}
                            />
                        )}
                        {questionItem.studentAnswer.feedback && (
                            <Text className="text-sm text-blue-700 mt-1">
                                Feedback: {questionItem.studentAnswer.feedback}
                            </Text>
                        )}
                    </View>
                ) : (
                    <Text className="text-sm text-gray-500">No answer recorded</Text>
                )}
            </View>

            {/* Ask AI Button */}
            <TouchableOpacity
                onPress={toggleAiSection}
                className={`flex-row items-center self-start px-3 py-2 rounded-lg border ${showAiSection ? 'bg-purple-100 border-purple-200' : 'bg-white border-purple-200'
                    }`}
            >
                <Sparkles size={16} color="#9333EA" className="mr-2" />
                <Text className="text-purple-700 font-medium ml-2">
                    {showAiSection ? 'Hide AI Help' : 'Ask AI Help'}
                </Text>
            </TouchableOpacity>

            {/* AI Interaction Area */}
            {showAiSection && (
                <View className="mt-3 bg-purple-50 rounded-xl p-4 border border-purple-100">
                    {!response && (
                        <View className="flex-row items-center mb-4">
                            <TextInput
                                className="flex-1 bg-white border border-purple-200 rounded-lg px-3 py-2 mr-2 text-gray-700"
                                placeholder="What would you like to ask?"
                                value={userQuestion}
                                onChangeText={setUserQuestion}
                                onSubmitEditing={handleAskAi}
                            />
                            <TouchableOpacity
                                onPress={handleAskAi}
                                disabled={isLoading || !userQuestion.trim()}
                                className={`p-2 rounded-lg ${isLoading || !userQuestion.trim() ? 'bg-purple-200' : 'bg-purple-600'}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Send size={20} color="#FFFFFF" />
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Response display */}
                    {(response || isLoading) && (
                        <View>
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-purple-900 font-semibold flex-row items-center">
                                    <Sparkles size={14} color="#9333EA" /> AI Explanation
                                </Text>
                            </View>

                            {isLoading && !response ? (
                                <View className="py-2 items-center">
                                    <Text className="text-purple-600 text-xs">Thinking...</Text>
                                </View>
                            ) : (
                                <View>
                                    <LatexText
                                        content={response}
                                        fontSize={14}
                                        textStyle={{ color: '#4B5563' }}
                                    />
                                    {isLoading && (
                                        <Text className="text-purple-500 text-xs mt-2">Generating...</Text>
                                    )}
                                </View>
                            )}
                        </View>
                    )}

                    {error && (
                        <Text className="text-red-500 text-sm mt-2">Error: {error}</Text>
                    )}
                </View>
            )}
        </View>
    );
};

export default ExamQuestionResultItem;
