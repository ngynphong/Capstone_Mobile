import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface NoteModalProps {
  visible: boolean;
  lessonTitle: string;
  noteText: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({
  visible,
  lessonTitle,
  noteText,
  onChangeText,
  onClose,
  onSave,
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
          <Text style={styles.title}>Note for {lessonTitle || 'Lesson'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Write your note here..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={5}
            value={noteText}
            onChangeText={onChangeText}
            textAlignVertical="top"
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                onSave();
                Alert.alert('Saved', 'Your note has been saved locally.');
              }}
            >
              <Text style={styles.primaryText}>Save</Text>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 120,
    marginBottom: 16,
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
});

export default NoteModal;


