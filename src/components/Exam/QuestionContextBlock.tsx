import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react-native';
import { QuestionContext } from '../../types/examTypes';
import AudioPlayer from '../common/AudioPlayer';
import QuestionImage from './QuestionImage';

interface QuestionContextBlockProps {
    context: QuestionContext;
    questionCount: number;
}

const QuestionContextBlock: React.FC<QuestionContextBlockProps> = ({
    context,
    questionCount,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <View style={styles.container}>
            {/* Context Header */}
            <TouchableOpacity
                style={styles.header}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                        <BookOpen size={20} color="#3CBCB2" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>{context.title || 'Reading Passage'}</Text>
                        <Text style={styles.subtitle}>
                            {questionCount} question{questionCount > 1 ? 's' : ''} based on this passage
                        </Text>
                    </View>
                </View>
                <View style={styles.expandButton}>
                    {isExpanded ? (
                        <ChevronUp size={20} color="#6B7280" />
                    ) : (
                        <ChevronDown size={20} color="#6B7280" />
                    )}
                </View>
            </TouchableOpacity>

            {/* Context Content */}
            {isExpanded && (
                <View style={styles.contentContainer}>
                    {/* Context Image */}
                    {context.imageUrl && (
                        <QuestionImage imageUrl={context.imageUrl} alt={context.title} />
                    )}

                    {/* Context Audio */}
                    {context.audioUrl && (
                        <AudioPlayer audioUrl={context.audioUrl} title="Listen to the passage" />
                    )}

                    {/* Context Text */}
                    <View style={styles.textContainer}>
                        <ScrollView
                            style={styles.scrollView}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={true}
                        >
                            <Text style={styles.contentText}>{context.content}</Text>
                        </ScrollView>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#DBEAFE',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E40AF',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: '#3B82F6',
    },
    expandButton: {
        padding: 4,
    },
    contentContainer: {
        padding: 16,
        paddingTop: 8,
    },
    textContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        maxHeight: 300,
    },
    scrollView: {
        maxHeight: 268,
    },
    contentText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#374151',
    },
});

export default QuestionContextBlock;
