import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';

interface RatingModalProps {
  visible: boolean;
  materialTitle: string;
  rating: number;
  setRating: (value: number) => void;
  comment: string;
  setComment: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  materialTitle,
  rating,
  setRating,
  comment,
  setComment,
  isSubmitting,
  onSubmit,
  onClose,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Rate Learning Material</Text>
          <Text style={styles.subtitle}>
            You have completed "{materialTitle}". Please share your rating!
          </Text>

          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Text style={styles.starIcon}>
                  {star <= rating ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>{rating} star{rating !== 1 ? 's' : ''}</Text>

          <TextInput
            style={styles.commentInput}
            placeholder="Share your comments (optional)..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                onClose();
                setComment('');
                setRating(5);
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, isSubmitting && styles.primaryBtnDisabled]}
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Submit Rating</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  starIcon: {
    fontSize: 32,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3CBCB2',
    textAlign: 'center',
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 16,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#3CBCB2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
});

export default RatingModal;


