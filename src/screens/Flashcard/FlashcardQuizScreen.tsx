import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Trophy,
    RotateCcw,
    Layers,
} from 'lucide-react-native';
import { useFlashcardSets } from '../../hooks/useFlashcardSets';
import { FlashcardStackParamList } from '../../types/types';
import type { FlashcardQuizQuestion } from '../../types/flashcardSet';

type NavigationProp = NativeStackNavigationProp<FlashcardStackParamList, 'FlashcardQuiz'>;
type RouteProps = RouteProp<FlashcardStackParamList, 'FlashcardQuiz'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QuizResult {
    questionIndex: number;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

const FlashcardQuizScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { flashcardSetId } = route.params;

    const { quizQuestions, loading, fetchQuiz } = useFlashcardSets();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [quizCompleted, setQuizCompleted] = useState(false);

    // Fetch quiz questions
    useEffect(() => {
        fetchQuiz(flashcardSetId);
    }, [flashcardSetId, fetchQuiz]);

    const currentQuestion: FlashcardQuizQuestion | undefined = quizQuestions[currentQuestionIndex];
    const totalQuestions = quizQuestions.length;

    // Handle answer selection
    const handleAnswerSelect = useCallback((answer: string) => {
        if (showFeedback || !currentQuestion) return;

        setSelectedAnswer(answer);
        setShowFeedback(true);

        const isCorrect = answer === currentQuestion.correctAnswer;
        setResults((prev) => [
            ...prev,
            {
                questionIndex: currentQuestionIndex,
                selectedAnswer: answer,
                correctAnswer: currentQuestion.correctAnswer,
                isCorrect,
            },
        ]);
    }, [showFeedback, currentQuestion, currentQuestionIndex]);

    // Go to next question
    const handleNext = useCallback(() => {
        if (currentQuestionIndex === totalQuestions - 1) {
            setQuizCompleted(true);
        } else {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
        }
    }, [currentQuestionIndex, totalQuestions]);

    // Retry quiz
    const handleRetry = useCallback(() => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setResults([]);
        setQuizCompleted(false);
    }, []);

    // Calculate score
    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Get answer button style
    const getAnswerStyle = (answer: string) => {
        if (!showFeedback) {
            return selectedAnswer === answer ? styles.answerSelected : styles.answer;
        }

        if (answer === currentQuestion?.correctAnswer) {
            return styles.answerCorrect;
        }

        if (answer === selectedAnswer && answer !== currentQuestion?.correctAnswer) {
            return styles.answerWrong;
        }

        return styles.answerDisabled;
    };

    const getAnswerTextStyle = (answer: string) => {
        if (!showFeedback) {
            return selectedAnswer === answer ? styles.answerTextSelected : styles.answerText;
        }

        if (answer === currentQuestion?.correctAnswer) {
            return styles.answerTextCorrect;
        }

        if (answer === selectedAnswer && answer !== currentQuestion?.correctAnswer) {
            return styles.answerTextWrong;
        }

        return styles.answerTextDisabled;
    };

    // Loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3CBCB2" />
            </View>
        );
    }

    // No questions
    if (!loading && quizQuestions.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Layers size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Quiz Available</Text>
                <Text style={styles.emptySubtitle}>
                    This flashcard set doesn't have quiz questions yet
                </Text>
                <TouchableOpacity style={styles.backToCardsButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backToCardsText}>Back to Cards</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Quiz completed - Results screen
    if (quizCompleted) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Quiz Results</Text>
                </View>

                <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
                    {/* Score Card */}
                    <View style={styles.scoreCard}>
                        <View style={styles.trophyContainer}>
                            <Trophy size={48} color={scorePercentage >= 70 ? '#F59E0B' : '#9CA3AF'} />
                        </View>
                        <Text style={styles.scoreTitle}>
                            {scorePercentage >= 80
                                ? 'Excellent!'
                                : scorePercentage >= 60
                                    ? 'Good Job!'
                                    : 'Keep Practicing!'}
                        </Text>
                        <View style={styles.scoreCircle}>
                            <Text style={styles.scorePercentage}>{scorePercentage}%</Text>
                            <Text style={styles.scoreSubtext}>
                                {correctAnswers}/{totalQuestions} correct
                            </Text>
                        </View>
                    </View>

                    {/* Results Breakdown */}
                    <View style={styles.breakdownCard}>
                        <Text style={styles.breakdownTitle}>Results Breakdown</Text>
                        {results.map((result, index) => (
                            <View key={index} style={styles.resultItem}>
                                <View style={styles.resultIcon}>
                                    {result.isCorrect ? (
                                        <CheckCircle size={20} color="#10B981" />
                                    ) : (
                                        <XCircle size={20} color="#EF4444" />
                                    )}
                                </View>
                                <View style={styles.resultContent}>
                                    <Text style={styles.resultQuestion} numberOfLines={2}>
                                        {quizQuestions[result.questionIndex]?.question}
                                    </Text>
                                    {!result.isCorrect && (
                                        <Text style={styles.correctAnswerText}>
                                            Correct: {result.correctAnswer}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.resultActions}>
                        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                            <RotateCcw size={20} color="#3CBCB2" />
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.backButton2}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backButtonText}>Back to Cards</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </View>
        );
    }

    // Quiz in progress
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quiz</Text>
                <Text style={styles.questionCounter}>
                    {currentQuestionIndex + 1}/{totalQuestions}
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` },
                        ]}
                    />
                </View>
            </View>

            <ScrollView style={styles.quizContainer} showsVerticalScrollIndicator={false}>
                {currentQuestion && (
                    <>
                        {/* Question Card */}
                        <View style={styles.questionCard}>
                            {currentQuestion.imageUrl && (
                                <Image
                                    source={{ uri: currentQuestion.imageUrl }}
                                    style={styles.questionImage}
                                    resizeMode="contain"
                                />
                            )}
                            <Text style={styles.questionText}>{currentQuestion.question}</Text>
                        </View>

                        {/* Answer Options */}
                        <View style={styles.answersContainer}>
                            {currentQuestion.options.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={getAnswerStyle(option)}
                                    onPress={() => handleAnswerSelect(option)}
                                    disabled={showFeedback}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.answerContent}>
                                        <Text style={styles.answerLetter}>
                                            {String.fromCharCode(65 + index)}
                                        </Text>
                                        <Text style={getAnswerTextStyle(option)}>{option}</Text>
                                    </View>
                                    {showFeedback && option === currentQuestion.correctAnswer && (
                                        <CheckCircle size={20} color="#10B981" />
                                    )}
                                    {showFeedback &&
                                        option === selectedAnswer &&
                                        option !== currentQuestion.correctAnswer && (
                                            <XCircle size={20} color="#EF4444" />
                                        )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Feedback */}
                        {showFeedback && (
                            <View style={styles.feedbackContainer}>
                                {selectedAnswer === currentQuestion.correctAnswer ? (
                                    <View style={styles.feedbackCorrect}>
                                        <CheckCircle size={24} color="#10B981" />
                                        <Text style={styles.feedbackTextCorrect}>Correct!</Text>
                                    </View>
                                ) : (
                                    <View style={styles.feedbackWrong}>
                                        <XCircle size={24} color="#EF4444" />
                                        <Text style={styles.feedbackTextWrong}>
                                            Incorrect. The correct answer is: {currentQuestion.correctAnswer}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Next Button */}
                        {showFeedback && (
                            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                                <Text style={styles.nextButtonText}>
                                    {currentQuestionIndex === totalQuestions - 1 ? 'See Results' : 'Next Question'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    backToCardsButton: {
        backgroundColor: '#3CBCB2',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    backToCardsText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    header: {
        backgroundColor: '#3CBCB2',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 16,
    },
    questionCounter: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3CBCB2',
        borderRadius: 3,
    },
    quizContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    questionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    questionImage: {
        width: '100%',
        height: 150,
        marginBottom: 16,
        borderRadius: 12,
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        lineHeight: 26,
        textAlign: 'center',
    },
    answersContainer: {
        marginTop: 20,
        gap: 12,
    },
    answer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    answerSelected: {
        backgroundColor: 'rgba(60, 188, 178, 0.1)',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: '#3CBCB2',
    },
    answerCorrect: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: '#10B981',
    },
    answerWrong: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: '#EF4444',
    },
    answerDisabled: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    answerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    answerLetter: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        textAlign: 'center',
        lineHeight: 28,
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    answerText: {
        flex: 1,
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
    },
    answerTextSelected: {
        flex: 1,
        fontSize: 15,
        color: '#3CBCB2',
        fontWeight: '500',
        lineHeight: 22,
    },
    answerTextCorrect: {
        flex: 1,
        fontSize: 15,
        color: '#10B981',
        fontWeight: '500',
        lineHeight: 22,
    },
    answerTextWrong: {
        flex: 1,
        fontSize: 15,
        color: '#EF4444',
        fontWeight: '500',
        lineHeight: 22,
    },
    answerTextDisabled: {
        flex: 1,
        fontSize: 15,
        color: '#9CA3AF',
        lineHeight: 22,
    },
    feedbackContainer: {
        marginTop: 20,
    },
    feedbackCorrect: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: 16,
        borderRadius: 12,
    },
    feedbackWrong: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 16,
        borderRadius: 12,
    },
    feedbackTextCorrect: {
        fontSize: 15,
        fontWeight: '600',
        color: '#10B981',
    },
    feedbackTextWrong: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#EF4444',
        lineHeight: 22,
    },
    nextButton: {
        backgroundColor: '#3CBCB2',
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 24,
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Results styles
    resultsContainer: {
        flex: 1,
    },
    scoreCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 24,
        padding: 32,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    trophyContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    scoreCircle: {
        alignItems: 'center',
    },
    scorePercentage: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#3CBCB2',
    },
    scoreSubtext: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 4,
    },
    breakdownCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 24,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    breakdownTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 12,
    },
    resultIcon: {
        marginTop: 2,
    },
    resultContent: {
        flex: 1,
    },
    resultQuestion: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    correctAnswerText: {
        fontSize: 13,
        color: '#10B981',
        marginTop: 4,
    },
    resultActions: {
        marginHorizontal: 20,
        marginTop: 24,
        gap: 12,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#3CBCB2',
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3CBCB2',
    },
    backButton2: {
        backgroundColor: '#3CBCB2',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    bottomSpacer: {
        height: 100,
    },
});

export default FlashcardQuizScreen;
