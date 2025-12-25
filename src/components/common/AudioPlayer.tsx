import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react-native';

interface AudioPlayerProps {
    audioUrl: string;
    title?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title }) => {
    // Safety check: return null if audioUrl is invalid
    if (!audioUrl) {
        return null;
    }

    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const progressBarWidth = useRef(0);
    const soundRef = useRef<Audio.Sound | null>(null);

    // Load audio when component mounts or URL changes
    useEffect(() => {
        loadAudio();
        return () => {
            // Cleanup on unmount
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, [audioUrl]);

    const loadAudio = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Unload previous sound if exists
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
            }

            // Set audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            // Load new sound
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: false },
                onPlaybackStatusUpdate
            );

            soundRef.current = newSound;
            setSound(newSound);
            setIsLoading(false);
        } catch (err) {
            console.error('Error loading audio:', err);
            setError('Failed to load audio');
            setIsLoading(false);
        }
    };

    const onPlaybackStatusUpdate = useCallback((status: any) => {
        if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
            setPosition(status.positionMillis || 0);
            setIsPlaying(status.isPlaying);

            // Reset when playback finishes
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
            }
        }
    }, []);

    const handlePlayPause = async () => {
        if (!soundRef.current) return;

        try {
            if (isPlaying) {
                await soundRef.current.pauseAsync();
            } else {
                await soundRef.current.playAsync();
            }
        } catch (err) {
            console.error('Error playing/pausing:', err);
        }
    };

    const handleSeek = async (newPosition: number) => {
        if (!soundRef.current || duration === 0) return;

        try {
            const clampedPosition = Math.max(0, Math.min(newPosition, duration));
            await soundRef.current.setPositionAsync(clampedPosition);
        } catch (err) {
            console.error('Error seeking:', err);
        }
    };

    const handleProgressBarPress = (event: any) => {
        if (!progressBarWidth.current || duration === 0) return;

        const touchX = event.nativeEvent.locationX;
        const percentage = touchX / progressBarWidth.current;
        const newPosition = percentage * duration;
        handleSeek(newPosition);
    };

    const handleRestart = async () => {
        if (!soundRef.current) return;

        try {
            await soundRef.current.setPositionAsync(0);
            await soundRef.current.playAsync();
        } catch (err) {
            console.error('Error restarting:', err);
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Volume2 size={20} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={loadAudio} style={styles.retryButton}>
                        <RotateCcw size={16} color="#3CBCB2" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}

            <View style={styles.playerRow}>
                {/* Play/Pause Button */}
                <TouchableOpacity
                    onPress={handlePlayPause}
                    disabled={isLoading}
                    style={styles.playButton}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : isPlaying ? (
                        <Pause size={20} color="#ffffff" />
                    ) : (
                        <Play size={20} color="#ffffff" />
                    )}
                </TouchableOpacity>

                {/* Progress Bar */}
                <TouchableOpacity
                    style={styles.progressContainer}
                    onPress={handleProgressBarPress}
                    activeOpacity={1}
                    onLayout={(e) => {
                        progressBarWidth.current = e.nativeEvent.layout.width;
                    }}
                >
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${progressPercentage}%` }
                            ]}
                        />
                        <View
                            style={[
                                styles.progressThumb,
                                { left: `${progressPercentage}%` }
                            ]}
                        />
                    </View>
                </TouchableOpacity>

                {/* Time Display */}
                <Text style={styles.timeText}>
                    {formatTime(position)} / {formatTime(duration)}
                </Text>

                {/* Restart Button */}
                <TouchableOpacity
                    onPress={handleRestart}
                    disabled={isLoading || !sound}
                    style={styles.restartButton}
                >
                    <RotateCcw size={16} color="#6B7280" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
        marginVertical: 8,
    },
    title: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 8,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3CBCB2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContainer: {
        flex: 1,
        marginHorizontal: 12,
        paddingVertical: 10,
    },
    progressTrack: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        position: 'relative',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3CBCB2',
        borderRadius: 2,
    },
    progressThumb: {
        position: 'absolute',
        top: -4,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3CBCB2',
        marginLeft: -6,
    },
    timeText: {
        fontSize: 11,
        color: '#6B7280',
        minWidth: 70,
        textAlign: 'center',
    },
    restartButton: {
        padding: 8,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
    },
    retryButton: {
        padding: 8,
    },
});

export default AudioPlayer;
