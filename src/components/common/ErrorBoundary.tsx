import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors in child component tree.
 * Displays a fallback UI when an error occurs.
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error);
        console.error('Error info:', errorInfo);

        this.setState({ errorInfo });

        // Call optional error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <AlertTriangle size={48} color="#EF4444" />
                        </View>

                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.subtitle}>
                            An unexpected error occurred. Please try again.
                        </Text>

                        {/* Error details for debugging */}
                        {__DEV__ && this.state.error && (
                            <ScrollView style={styles.errorContainer}>
                                <Text style={styles.errorLabel}>Error:</Text>
                                <Text style={styles.errorText}>
                                    {this.state.error.toString()}
                                </Text>

                                {this.state.errorInfo && (
                                    <>
                                        <Text style={styles.errorLabel}>Component Stack:</Text>
                                        <Text style={styles.errorText}>
                                            {this.state.errorInfo.componentStack}
                                        </Text>
                                    </>
                                )}
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={this.handleReset}
                        >
                            <RefreshCw size={20} color="#ffffff" />
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    errorContainer: {
        maxHeight: 200,
        width: '100%',
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    errorLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#991B1B',
        marginBottom: 4,
        marginTop: 8,
    },
    errorText: {
        fontSize: 11,
        color: '#B91C1C',
        fontFamily: 'monospace',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3CBCB2',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ErrorBoundary;
