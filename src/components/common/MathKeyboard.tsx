import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    TextInput,
} from 'react-native';
import { X, Calculator, ChevronDown, ChevronUp } from 'lucide-react-native';
import LatexText from './LatexText';

interface MathKeyboardProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    style?: object;
}

// Type for math symbol items
interface MathSymbol {
    symbol: string;
    latex: string;
    display: string;
    cursor?: number;
}

// Common math symbols organized by category
const MATH_SYMBOLS: Record<string, MathSymbol[]> = {
    'Basic': [
        { symbol: '+', latex: '+', display: '+' },
        { symbol: '-', latex: '-', display: '−' },
        { symbol: '×', latex: '\\times', display: '×' },
        { symbol: '÷', latex: '\\div', display: '÷' },
        { symbol: '=', latex: '=', display: '=' },
        { symbol: '≠', latex: '\\neq', display: '≠' },
        { symbol: '<', latex: '<', display: '<' },
        { symbol: '>', latex: '>', display: '>' },
        { symbol: '≤', latex: '\\leq', display: '≤' },
        { symbol: '≥', latex: '\\geq', display: '≥' },
        { symbol: '±', latex: '\\pm', display: '±' },
        { symbol: '∞', latex: '\\infty', display: '∞' },
    ],
    'Exponent & Root': [
        { symbol: 'x²', latex: '^2', display: 'x²' },
        { symbol: 'x³', latex: '^3', display: 'x³' },
        { symbol: 'xⁿ', latex: '^{}', display: 'xⁿ', cursor: -1 },
        { symbol: '√', latex: '\\sqrt{}', display: '√', cursor: -1 },
        { symbol: '∛', latex: '\\sqrt[3]{}', display: '∛', cursor: -1 },
        { symbol: 'ⁿ√', latex: '\\sqrt[]{}', display: 'ⁿ√', cursor: -4 },
        { symbol: 'xₙ', latex: '_{}', display: 'xₙ', cursor: -1 },
    ],
    'Fraction': [
        { symbol: '½', latex: '\\frac{1}{2}', display: '½' },
        { symbol: 'a/b', latex: '\\frac{}{}', display: 'a/b', cursor: -3 },
        { symbol: 'π', latex: '\\pi', display: 'π' },
        { symbol: 'e', latex: 'e', display: 'e' },
    ],
    'Angle & Trigonometry': [
        { symbol: '°', latex: '^\\circ', display: '°' },
        { symbol: 'sin', latex: '\\sin', display: 'sin' },
        { symbol: 'cos', latex: '\\cos', display: 'cos' },
        { symbol: 'tan', latex: '\\tan', display: 'tan' },
        { symbol: 'cot', latex: '\\cot', display: 'cot' },
        { symbol: 'α', latex: '\\alpha', display: 'α' },
        { symbol: 'β', latex: '\\beta', display: 'β' },
        { symbol: 'θ', latex: '\\theta', display: 'θ' },
    ],
    'Integral & Limit': [
        { symbol: '∫', latex: '\\int', display: '∫' },
        { symbol: '∑', latex: '\\sum', display: '∑' },
        { symbol: '∏', latex: '\\prod', display: '∏' },
        { symbol: 'lim', latex: '\\lim', display: 'lim' },
        { symbol: '→', latex: '\\to', display: '→' },
        { symbol: 'dx', latex: '\\,dx', display: 'dx' },
    ],
    'Set': [
        { symbol: '∈', latex: '\\in', display: '∈' },
        { symbol: '∉', latex: '\\notin', display: '∉' },
        { symbol: '⊂', latex: '\\subset', display: '⊂' },
        { symbol: '∪', latex: '\\cup', display: '∪' },
        { symbol: '∩', latex: '\\cap', display: '∩' },
        { symbol: '∅', latex: '\\emptyset', display: '∅' },
        { symbol: 'ℝ', latex: '\\mathbb{R}', display: 'ℝ' },
        { symbol: 'ℕ', latex: '\\mathbb{N}', display: 'ℕ' },
    ],
    'Parentheses': [
        { symbol: '( )', latex: '()', display: '( )', cursor: -1 },
        { symbol: '[ ]', latex: '[]', display: '[ ]', cursor: -1 },
        { symbol: '{ }', latex: '\\{\\}', display: '{ }', cursor: -2 },
        { symbol: '| |', latex: '||', display: '| |', cursor: -1 },
    ],
    'Numbers': [
        { symbol: '0', latex: '0', display: '0' },
        { symbol: '1', latex: '1', display: '1' },
        { symbol: '2', latex: '2', display: '2' },
        { symbol: '3', latex: '3', display: '3' },
        { symbol: '4', latex: '4', display: '4' },
        { symbol: '5', latex: '5', display: '5' },
        { symbol: '6', latex: '6', display: '6' },
        { symbol: '7', latex: '7', display: '7' },
        { symbol: '8', latex: '8', display: '8' },
        { symbol: '9', latex: '9', display: '9' },
        { symbol: '.', latex: '.', display: '.' },
        { symbol: ',', latex: ',', display: ',' },
    ],
    'Variables': [
        { symbol: 'a', latex: 'a', display: 'a' },
        { symbol: 'b', latex: 'b', display: 'b' },
        { symbol: 'c', latex: 'c', display: 'c' },
        { symbol: 'd', latex: 'd', display: 'd' },
        { symbol: 'x', latex: 'x', display: 'x' },
        { symbol: 'y', latex: 'y', display: 'y' },
        { symbol: 'z', latex: 'z', display: 'z' },
        { symbol: 'n', latex: 'n', display: 'n' },
        { symbol: 'm', latex: 'm', display: 'm' },
        { symbol: 'k', latex: 'k', display: 'k' },
        { symbol: 'i', latex: 'i', display: 'i' },
        { symbol: 'j', latex: 'j', display: 'j' },
    ],
};

const MathKeyboard: React.FC<MathKeyboardProps> = ({
    value,
    onChangeText,
    placeholder = 'Nhập câu trả lời...',
    style
}) => {
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Cơ bản');
    const [cursorPosition, setCursorPosition] = useState(value.length);
    // const [showPreview, setShowPreview] = useState(true); // Show preview by default

    const insertSymbol = (latex: string, cursorOffset?: number) => {
        const before = value.slice(0, cursorPosition);
        const after = value.slice(cursorPosition);
        const newValue = before + latex + after;
        onChangeText(newValue);

        // Update cursor position
        const newPosition = cursorPosition + latex.length + (cursorOffset || 0);
        setCursorPosition(newPosition);
    };

    const handleTextChange = (text: string) => {
        onChangeText(text);
        setCursorPosition(text.length);
    };

    const wrapWithLatex = () => {
        if (!value.includes('$')) {
            onChangeText(`$${value}$`);
        }
    };

    const categories = Object.keys(MATH_SYMBOLS);
    const [showInput, setShowInput] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {/* Rendered LaTeX Display - Always visible, tap to edit */}
            <TouchableOpacity
                style={styles.renderedContainer}
                onPress={() => setShowInput(!showInput)}
                activeOpacity={0.8}
            >
                <View style={styles.answerHeader}>
                    <Text style={styles.answerLabel}>Your answer:</Text>
                    <Text style={styles.editHint}>{showInput ? '▼ Hide input' : '▶ Tap to edit'}</Text>
                </View>
                {value.trim() ? (
                    <View style={styles.renderedContent}>
                        <LatexText
                            content={value.includes('$') ? value : `$${value}$`}
                            fontSize={18}
                        />
                    </View>
                ) : (
                    <Text style={styles.placeholderText}>{placeholder}</Text>
                )}
            </TouchableOpacity>

            {/* Collapsible Text Input for raw editing */}
            {showInput && (
                <View style={styles.inputContainer}>
                    <TextInput
                        multiline
                        value={value}
                        onChangeText={handleTextChange}
                        placeholder="Enter your answer..."
                        placeholderTextColor="#9CA3AF"
                        style={styles.textInput}
                        textAlignVertical="top"
                        onSelectionChange={(e) => setCursorPosition(e.nativeEvent.selection.start)}
                        autoFocus
                    />

                    {/* Math Keyboard Toggle */}
                    <View style={styles.toolbar}>
                        <TouchableOpacity
                            onPress={() => setShowKeyboard(!showKeyboard)}
                            style={[styles.toolbarButton, showKeyboard && styles.toolbarButtonActive]}
                        >
                            <Calculator size={20} color={showKeyboard ? '#fff' : '#3CBCB2'} />
                            <Text style={[styles.toolbarText, showKeyboard && styles.toolbarTextActive]}>
                                Math Keyboard
                            </Text>
                            {showKeyboard ? (
                                <ChevronDown size={16} color="#fff" />
                            ) : (
                                <ChevronUp size={16} color="#3CBCB2" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Math Keyboard */}
            {showKeyboard && (
                <View style={styles.keyboardContainer}>
                    {/* Category Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryTabs}
                        contentContainerStyle={styles.categoryTabsContent}
                    >
                        {categories.map(category => (
                            <TouchableOpacity
                                key={category}
                                onPress={() => setActiveCategory(category)}
                                style={[
                                    styles.categoryTab,
                                    activeCategory === category && styles.categoryTabActive
                                ]}
                            >
                                <Text style={[
                                    styles.categoryTabText,
                                    activeCategory === category && styles.categoryTabTextActive
                                ]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Symbol Grid */}
                    <View style={styles.symbolGrid}>
                        {MATH_SYMBOLS[activeCategory as keyof typeof MATH_SYMBOLS].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => insertSymbol(item.latex, item.cursor)}
                                style={styles.symbolButton}
                            >
                                <Text style={styles.symbolText}>{item.display}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            onPress={() => insertSymbol('$', 0)}
                            style={styles.quickActionButton}
                        >
                            <Text style={styles.quickActionText}>$ (LaTeX)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={wrapWithLatex}
                            style={styles.quickActionButton}
                        >
                            <Text style={styles.quickActionText}>Wrap $...$</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowKeyboard(false)}
                            style={[styles.quickActionButton, styles.closeButton]}
                        >
                            <X size={16} color="#EF4444" />
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Help Text */}
                    <Text style={styles.helpText}>
                        💡 Tip: Use $...$ to write LaTeX. Example: $x^2 + y^2 = r^2$
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    renderedContainer: {
        backgroundColor: '#F0FDF9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        minHeight: 80,
    },
    answerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    answerLabel: {
        fontSize: 12,
        color: '#059669',
        fontWeight: '600',
    },
    editHint: {
        fontSize: 11,
        color: '#6B7280',
    },
    renderedContent: {
        minHeight: 40,
    },
    placeholderText: {
        fontSize: 16,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        overflow: 'hidden',
    },
    textInput: {
        minHeight: 100,
        padding: 12,
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    toolbarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#E0F7F5',
    },
    toolbarButtonActive: {
        backgroundColor: '#3CBCB2',
    },
    toolbarText: {
        marginLeft: 6,
        marginRight: 4,
        fontSize: 14,
        fontWeight: '500',
        color: '#3CBCB2',
    },
    toolbarTextActive: {
        color: '#fff',
    },
    previewButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    previewButtonActive: {
        backgroundColor: '#3CBCB2',
    },
    previewButtonText: {
        fontSize: 12,
        color: '#6B7280',
    },
    previewButtonTextActive: {
        color: '#fff',
    },
    previewContainer: {
        marginTop: 8,
        padding: 12,
        backgroundColor: '#F0FDF9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    previewLabel: {
        fontSize: 12,
        color: '#059669',
        marginBottom: 4,
        fontWeight: '500',
    },
    previewContent: {
        minHeight: 40,
    },
    keyboardContainer: {
        marginTop: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    categoryTabs: {
        marginBottom: 8,
    },
    categoryTabsContent: {
        paddingHorizontal: 4,
    },
    categoryTab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 6,
        borderRadius: 16,
        backgroundColor: '#E5E7EB',
    },
    categoryTabActive: {
        backgroundColor: '#3CBCB2',
    },
    categoryTabText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    categoryTabTextActive: {
        color: '#fff',
    },
    symbolGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginBottom: 8,
    },
    symbolButton: {
        width: '12%',
        aspectRatio: 1,
        margin: '0.5%',
        backgroundColor: '#fff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    symbolText: {
        fontSize: 18,
        color: '#374151',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 8,
    },
    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        borderRadius: 8,
        backgroundColor: '#E0F7F5',
    },
    quickActionText: {
        fontSize: 12,
        color: '#3CBCB2',
        fontWeight: '500',
    },
    closeButton: {
        backgroundColor: '#FEE2E2',
        marginLeft: 'auto',
    },
    closeButtonText: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '500',
        marginLeft: 4,
    },
    helpText: {
        fontSize: 11,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});

export default MathKeyboard;
