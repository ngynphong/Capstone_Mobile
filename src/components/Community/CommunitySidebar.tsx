import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X, Users } from 'lucide-react-native';
import type { Community } from '../../types/communityTypes';

interface CommunitySidebarProps {
  visible: boolean;
  onClose: () => void;
  communities: Community[];
  onCommunityPress?: (community: Community | null) => void;
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({
  visible,
  onClose,
  communities,
  onCommunityPress,
}) => {
  // Format member count
  const formatMemberCount = (count?: number) => {
    if (!count) return '';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M members`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}k members`;
    }
    return `${count} members`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sidebar}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Communities</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* MY COMMUNITIES Section */}
            {communities.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>MY COMMUNITIES</Text>
                {communities.map((community) => (
                  <TouchableOpacity
                    key={community.id}
                    style={styles.communityItem}
                    onPress={() => {
                      onCommunityPress?.(community);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.communityIcon}>
                      <Users size={20} color="#3CBCB2" />
                    </View>
                    <View style={styles.communityInfo}>
                      <Text style={styles.communityName} numberOfLines={1}>
                        {community.name}
                      </Text>
                      {community.memberCount !== undefined && (
                        <Text style={styles.memberCount}>
                          {formatMemberCount(community.memberCount)}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No communities yet</Text>
                <Text style={styles.emptySubtext}>
                  Join or create a community to get started
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  communityIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default CommunitySidebar;

